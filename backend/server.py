from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from image_and_name import scrape_image
from database import DatabaseManager  # Ensure this module is in your project
from llm_stuff import get_llm_response
from open_food_api import get_product_info
from recommendation import get_food_recommendations, enrich_food_data

# Create a single global instance of the DatabaseManager.
db_manager = DatabaseManager("example.db")

app = FastAPI()

# Enable CORS from any origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define Pydantic models for request bodies.
class UserModel(BaseModel):
    email: str
    height: float  # Height in centimeters
    weight: float  # Weight in kilograms
    age: int
    physical_activity: str  # e.g., "Regular exercise (3-4 times per week)"
    gender: str
    comorbidities: List[str]
    preferences: str


# New input model for history; the LLM response is generated, not provided by the client.
class HistoryInputModel(BaseModel):
    email: str
    upc: str


class RecommendationRequestModel(BaseModel):
    email: str


@app.post("/add_user")
def add_user(user: UserModel):
    try:
        db_manager.add_user(
            email=user.email,
            height=user.height,
            weight=user.weight,
            age=user.age,
            physical_activity=user.physical_activity,
            gender=user.gender,
            comorbidities=user.comorbidities,
            preferences=user.preferences,
        )
        return {"message": "User added successfully"}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/add_history")
def add_history(history: HistoryInputModel):
    print(f"Received add_history request for email: {history.email}, UPC: {history.upc}")
    
    try:
        # First check if we already have a very recent scan of this UPC for this user
        # to prevent duplicate entries from double-scans
        existing_entries = db_manager.get_user_history(history.email)
        
        if existing_entries:
            # Check for entries with same UPC in the last 1 minute
            current_time = datetime.now()
            for entry in existing_entries:
                if entry['upc'] == history.upc:
                    try:
                        entry_time = datetime.fromisoformat(entry['date'])
                        time_diff = (current_time - entry_time).total_seconds()
                        # If an entry for this UPC exists within the last 60 seconds, return it
                        if time_diff < 60:
                            print(f"Found recent scan of UPC {history.upc} from {time_diff} seconds ago. Returning existing entry.")
                            return {
                                "score": entry['score'],
                                "reasoning": entry['reasoning'],
                                "image_url": entry['image_url'],
                                "product_name": entry.get('product_name', "Unknown Product")
                            }
                    except Exception as e:
                        print(f"Error parsing date for existing entry: {e}")
                        # Continue processing if date parsing fails
        
        # Retrieve food information using the provided UPC.
        food_info = get_product_info(history.upc)
        print(f"Retrieved food info: {food_info}")
        
        # Get product name from food info
        product_name = food_info.get("product_name", "Unknown Product")
        
        # Retrieve user details from the database using the provided email.
        user_info = db_manager.get_user(history.email)
        print(f"User lookup result: {user_info}")

        # If user doesn't exist, create a default user
        if not user_info:
            print(f"No user found. Creating default user for: {history.email}")
            # Create a default user with minimal information
            try:
                # Add the default user directly to the database
                db_manager.add_user(
                    email=history.email,
                    height=170.0,  # Default height in cm
                    weight=70.0,   # Default weight in kg
                    age=30,        # Default age
                    physical_activity="Moderate",
                    gender="not_specified",
                    comorbidities=[],
                    preferences="No specific preferences"
                )
                print(f"Default user created for: {history.email}")
                # Get the newly created user
                user_info = db_manager.get_user(history.email)
                if not user_info:
                    print(f"ERROR: Failed to retrieve newly created user: {history.email}")
                    # Provide a minimal user info structure if we still can't get the user
                    user_info = {
                        "email": history.email,
                        "height": 170.0,
                        "weight": 70.0,
                        "age": 30,
                        "physical_activity": "Moderate",
                        "gender": "not_specified",
                        "comorbidities": [],
                        "preferences": "No specific preferences"
                    }
            except Exception as e:
                print(f"ERROR creating default user: {str(e)}")
                # Provide a minimal user info structure if creation fails
                user_info = {
                    "email": history.email,
                    "height": 170.0,
                    "weight": 70.0,
                    "age": 30,
                    "physical_activity": "Moderate",
                    "gender": "not_specified",
                    "comorbidities": [],
                    "preferences": "No specific preferences"
                }

        # Call the LLM to evaluate the food against the user's profile.
        print(f"Calling LLM with user_info: {user_info} and food_info: {food_info}")
        llm_response = get_llm_response(user_info, food_info)
        print(f"LLM response: {llm_response}")

        # Call scrape_image to get the image URL from the UPC.
        image_url = scrape_image(history.upc)

        # Automatically set the current date and time (in ISO format).
        current_date = datetime.now().isoformat()

        # Store the history entry in the database
        db_manager.add_history(
            email=history.email,
            upc=history.upc,
            score=llm_response.score,
            reasoning=llm_response.reasoning,
            image_url=image_url,
            date=current_date,
            product_name=product_name,
        )
        
        # Return the response
        result = {
            "score": llm_response.score,
            "reasoning": llm_response.reasoning,
            "image_url": image_url,
            "product_name": product_name,
        }
        print(f"Returning result: {result}")
        return result
        
    except Exception as e:
        print(f"ERROR in add_history: {str(e)}")
        # Return a fallback response with error details
        return {
            "score": 50,
            "reasoning": f"Error processing product: {str(e)}. Please try again.",
            "image_url": "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
            "product_name": "Unknown Product" 
        }


@app.get("/get_history")
def get_history(email: str):
    history_list = db_manager.get_user_history(email)
    if not history_list:
        # Return an empty list instead of raising an error
        return []
    return history_list


@app.get("/get_users")
def get_users():
    """
    Retrieve all users from the database.
    """
    users = db_manager.get_users()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users


@app.post("/get_recommendations")
def get_recommendations(request: RecommendationRequestModel):
    """
    Generate food recommendations for a user based on their past scans.
    Returns the top 3 healthiest foods for the user with explanations.
    """
    try:
        # Get user information
        user_info = db_manager.get_user(request.email)
        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user history
        history_items = db_manager.get_user_history(request.email)
        if not history_items or len(history_items) < 2:
            raise HTTPException(status_code=404, detail="Not enough history found to make recommendations. Please scan at least 2 items.")
        
        # Add product names and other missing data to history items
        enriched_history = enrich_food_data(history_items)
        
        # Get recommendations
        recommendations = get_food_recommendations(user_info, enriched_history)
        
        return {
            "recommendations": recommendations.recommendations
        }
    except Exception as e:
        print(f"ERROR in get_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
