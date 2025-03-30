from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import os
from open_food_api import get_product_info
from dotenv import load_dotenv

load_dotenv()

class FoodRecommendation(BaseModel):
    """Model for food recommendation response"""
    score: int = Field(description="Score from 0-100 indicating how healthy the food is for the user")
    reasoning: str = Field(description="Brief reasoning for the recommendation")
    food_name: str = Field(description="Name of the food product")
    image_url: str = Field(description="URL of the food image")
    upc: str = Field(description="UPC code of the food")

class RecommendationResult(BaseModel):
    """Result containing top recommendations"""
    recommendations: List[FoodRecommendation]
    summary: str = Field(description="A brief summary of the recommendations")

# Prompt template for ranking foods
ranking_prompt_template = PromptTemplate.from_template(
    """
    You are a nutrition expert tasked with ranking foods based on their healthiness for a specific patient.
    
    Here is information about the patient:
    Email: {email}
    Height (cm): {height}
    Weight (kg): {weight}
    Age: {age}
    Physical Activity Level: {physical_activity}
    Gender: {gender}
    Comorbidities: {comorbidities}
    Preferences: {preferences}
    
    Below is a list of foods the patient has scanned in the past:
    {food_list}
    
    Please analyze these foods and rank the top 3 healthiest options specifically for this patient.
    For each recommended food, provide:
    1. A score between 0-100 indicating how healthy it is for this patient
    2. A brief reasoning (2-3 sentences) explaining why this food is recommended for this specific patient
    3. Return the food's name, image URL, and UPC exactly as provided in the input
    
    Consider the patient's health profile, comorbidities, and preferences when making recommendations.
    Focus on foods that would benefit this specific patient's health situation.
    """
)

# Initialize the LLM
model = ChatOpenAI(model="gpt-4o", temperature=0.2, api_key=os.getenv("OPENAI_API_KEY"))
structured_model = model.with_structured_output(RecommendationResult)

def format_food_list(history_items: List[Dict[str, Any]]) -> str:
    """Format the food history items for the prompt"""
    formatted_list = []
    
    for item in history_items:
        formatted_item = f"""
Food: {item.get('name', 'Unknown')}
UPC: {item.get('upc', 'Unknown')}
Score: {item.get('score', 0)}
Image URL: {item.get('image_url', '')}
Description: {item.get('reasoning', 'No description available')}
        """
        formatted_list.append(formatted_item)
    
    return "\n".join(formatted_list)

def get_food_recommendations(user_info: Dict[str, Any], history_items: List[Dict[str, Any]]) -> RecommendationResult:
    """
    Generate personalized food recommendations for a user based on their history.
    
    Args:
        user_info: Dictionary containing user information
        history_items: List of dictionaries containing food history items
        
    Returns:
        RecommendationResult object containing the top 3 recommendations and a summary
    """
    # Format the food list for the prompt
    food_list_text = format_food_list(history_items)
    
    # Create the prompt parameters
    params = {
        "email": user_info.get("email", ""),
        "height": user_info.get("height", 0.0),
        "weight": user_info.get("weight", 0.0),
        "age": user_info.get("age", 0),
        "physical_activity": user_info.get("physical_activity", ""),
        "gender": user_info.get("gender", ""),
        "comorbidities": user_info.get("comorbidities", []),
        "preferences": user_info.get("preferences", ""),
        "food_list": food_list_text
    }
    
    # Create the prompt and call the LLM
    prompt = ranking_prompt_template.invoke(params)
    recommendations = structured_model.invoke(prompt)
    
    return recommendations

def enrich_food_data(history_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Fetch additional food information for history items if needed.
    This is useful if the history items don't have all the required information.
    
    Args:
        history_items: List of history items from the database
        
    Returns:
        Enriched list of history items with additional food information
    """
    enriched_items = []
    
    for item in history_items:
        # Check if we need to fetch additional information
        if "name" not in item or not item.get("name"):
            # Try to fetch food info from the API
            try:
                food_info = get_product_info(item["upc"])
                item["name"] = food_info.get("product_name", "Unknown Product")
                # Add any other missing fields you need
            except Exception as e:
                print(f"Error fetching food info for UPC {item.get('upc')}: {e}")
                item["name"] = "Unknown Product"
        
        enriched_items.append(item)
    
    return enriched_items

# Test the recommendation system
if __name__ == "__main__":
    from database import DatabaseManager
    
    # Create a database manager instance
    db_manager = DatabaseManager("example.db")
    
    # Get a test user
    test_email = "user@example.com"
    user_info = db_manager.get_user(test_email)
    
    if user_info:
        # Get user history
        history_items = db_manager.get_user_history(test_email)
        
        # Enrich the food data
        enriched_items = enrich_food_data(history_items)
        
        # Get recommendations
        recommendations = get_food_recommendations(user_info, enriched_items)
        
        # Print the recommendations
        print("Top Food Recommendations:")
        for i, rec in enumerate(recommendations.recommendations, 1):
            print(f"\n{i}. {rec.food_name} (Score: {rec.score})")
            print(f"UPC: {rec.upc}")
            print(f"Reasoning: {rec.reasoning}")
            print(f"Image: {rec.image_url}")
        
        print(f"\nSummary: {recommendations.summary}")
    else:
        print(f"User with email {test_email} not found.") 