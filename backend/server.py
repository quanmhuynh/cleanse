from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

from image_and_name import scrape_image
from database import DatabaseManager  # Ensure this module is in your project
from llm_stuff import get_llm_response
from open_food_api import get_product_info

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
    # image_url: str


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
    # Retrieve food information using the provided UPC.
    food_info = get_product_info(history.upc)
    # Retrieve user details from the database using the provided email.
    user_info = db_manager.get_user(history.email)

    # Call the LLM to evaluate the food against the user's profile.
    llm_response = get_llm_response(user_info, food_info)

    # Call scrape_image to get the image URL from the UPC.
    image_url = scrape_image(history.upc)

    # Automatically set the current date and time (in ISO format).
    current_date = datetime.now().isoformat()

    try:
        db_manager.add_history(
            email=history.email,
            upc=history.upc,
            score=llm_response.score,
            reasoning=llm_response.reasoning,
            image_url=image_url,
            date=current_date,
        )
        # Return just the LLM response.
        return {"score": llm_response.score, "reasoning": llm_response.reasoning, 'image_url': image_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/get_history")
def get_history(email: str):
    history_list = db_manager.get_user_history(email)
    if not history_list:
        raise HTTPException(status_code=404, detail="No history found for this user")
    return history_list


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
