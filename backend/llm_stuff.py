from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
load_dotenv()

# Initialize models
openai_model = ChatOpenAI(model="gpt-4o", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
gemini_model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=os.getenv("GEMINI_API_KEY")
)

# Define response structure
class ResponseFormatter(BaseModel):
    score: int
    reasoning: str

prompt_template = PromptTemplate.from_template(
    """
    Below is an enhanced prompt that integrates fields from two distinct sources: the patient's health record and detailed food information. Use this prompt to evaluate how healthy a specific food is for the patient. Each field is defined as follows:

    Patient Information:
    - Email: The patient's unique email address.
    - Height: Patient's height in centimeters.
    - Weight: Patient's weight in kilograms.
    - Age: Patient's age in years.
    - Physical Activity Level: Description of the patient's daily movement or exercise habits.
    - Gender: Patient's gender.
    - Comorbidities: List of any chronic illnesses or conditions the patient has.
    - Preferences: Specific dietary or personal preferences.

    Food Details:
    - Ingredients: A textual description listing all ingredients of the food.
    - Nutri-Score Score: A numerical value indicating the nutritional quality.
    - Nutri-Score Grade: A letter grade (e.g., A to E) summarizing the nutritional quality.
    - NOVA Group: A classification of the food based on its level of processing.
    - Allergens: A list of known allergens contained in the food.

    Instructions:
    Using the information provided below, assign a health suitability score between 0 and 100 that reflects how appropriate this food is for the patient. Consider the patient's overall health profile—including age, weight, comorbidities, and lifestyle—as well as the food's nutritional indicators and ingredient list. In your evaluation, be sure to:
    - Highlight any ingredients or food properties that may not suit the patient's health profile.
    - Provide a brief reasoning for the score you assign. Limit your reasoning to no more than three concise sentences.

    ---

    Here is information about the patient:
    Email: {email}
    Height (cm): {height}
    Weight (kg): {weight}
    Age: {age}
    Physical Activity Level: {physical_activity}
    Gender: {gender}
    Comorbidities: {comorbidities}
    Preferences: {preferences}

    Here is information about the food:
    Ingredients: {ingredients_text}
    Nutri-Score Score: {nutriscore_score}
    Nutri-Score Grade: {nutriscore_grade}
    NOVA Group: {nova_group}
    Allergens: {allergens}

    ---

    Assign a score between 0 and 100 rating how healthy this food is for the patient, and include your concise reasoning below.
    Be impersonable.
    """
)

# Recommendation prompt template
recommendation_prompt = PromptTemplate.from_template(
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
    
    Below is a list of all food items in our database (including items scanned by other users):
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

# Define recommendation response classes
class FoodRecommendation(BaseModel):
    """Model for food recommendation response"""
    score: int = Field(description="Score from 0-100 indicating how healthy the food is for the user")
    reasoning: str = Field(description="Brief reasoning for the recommendation")
    food_name: str = Field(description="Name of the food product")
    image_url: str = Field(description="URL of the food image")
    upc: str = Field(description="UPC code of the food")

class RecommendationResult(BaseModel):
    """Result containing top recommendations"""
    recommendations: list[FoodRecommendation]

def get_llm_response(user_info, food_info, use_gemini=True):
    """
    Generate health evaluation for a food item based on user profile.
    
    Args:
        user_info: Dictionary with user health data
        food_info: Dictionary with food nutritional data
        use_gemini: Whether to use Gemini (True) or OpenAI (False) model
    
    Returns:
        ResponseFormatter with score and reasoning
    """
    # Merge patient and food details into a single parameter dictionary
    params = {
        "email": user_info.get("email", ""),
        "height": user_info.get("height", 0.0),
        "weight": user_info.get("weight", 0.0),
        "age": user_info.get("age", 0),
        "physical_activity": user_info.get("physical_activity", ""),
        "gender": user_info.get("gender", ""),
        "comorbidities": user_info.get("comorbidities", []),
        "preferences": user_info.get("preferences", ""),
        "ingredients_text": food_info.get("ingredients_text", ""),
        "nutriscore_score": food_info.get("nutriscore_score", 0),
        "nutriscore_grade": food_info.get("nutriscore_grade", ""),
        "nova_group": food_info.get("nova_group", ""),
        "allergens": food_info.get("allergens", ""),
    }

    # Invoke the enhanced prompt template with the parameters
    prompt = prompt_template.invoke(params)
    
    # Use the specified model
    selected_model = gemini_model if use_gemini else openai_model
    structured_llm = selected_model.with_structured_output(ResponseFormatter)
    
    # Call the language model with the generated prompt and return its response
    response = structured_llm.invoke(prompt)
    return response

def format_food_list(history_items):
    """Format the food history items for the prompt"""
    formatted_list = []
    
    for item in history_items:
        formatted_item = f"""
Food: {item.get('product_name', item.get('name', 'Unknown'))}
UPC: {item.get('upc', 'Unknown')}
Score: {item.get('score', 0)}
Image URL: {item.get('image_url', '')}
Description: {item.get('reasoning', 'No description available')}
        """
        formatted_list.append(formatted_item)
    
    return "\n".join(formatted_list)

def get_food_recommendations(user_info, history_items, use_gemini=True):
    """
    Generate personalized food recommendations for a user based on their history.
    
    Args:
        user_info: Dictionary containing user information
        history_items: List of dictionaries containing food history items
        use_gemini: Whether to use Gemini (True) or OpenAI (False) model
        
    Returns:
        RecommendationResult object containing the top 3 recommendations
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
    
    # Create the prompt
    prompt = recommendation_prompt.invoke(params)
    
    # Use the specified model
    selected_model = gemini_model if use_gemini else openai_model
    structured_model = selected_model.with_structured_output(RecommendationResult)
    
    # Call the LLM
    recommendations = structured_model.invoke(prompt)
    
    return recommendations

def enrich_food_data(history_items):
    """
    Fetch additional food information for history items if needed.
    
    Args:
        history_items: List of history items from the database
        
    Returns:
        Enriched list of history items with additional food information
    """
    from open_food_api import get_product_info
    
    enriched_items = []
    
    for item in history_items:
        # Check if we need to fetch additional information
        if "product_name" not in item and ("name" not in item or not item.get("name")):
            # Try to fetch food info from the API
            try:
                food_info = get_product_info(item["upc"])
                item["name"] = food_info.get("product_name", "Unknown Product")
            except Exception as e:
                print(f"Error fetching food info for UPC {item.get('upc')}: {e}")
                item["name"] = "Unknown Product"
        
        enriched_items.append(item)
    
    return enriched_items

if __name__ == '__main__':
    from open_food_api import get_product_info
    food_info = get_product_info("028400003001")
    user_info = {
        "email": "jane.doe@example.com",
        "height": 165.0,  # Height in centimeters
        "weight": 60.0,   # Weight in kilograms
        "age": 28,
        "physical_activity": "Regular exercise (3-4 times per week)",
        "gender": "Female",
        "comorbidities": ["asthma", "seasonal allergies"],
        "preferences": "Vegetarian, prefers organic options"
    }

    # Test the food evaluation
    print("Testing food evaluation:")
    print(get_llm_response(user_info, food_info))
    
    # Test the recommendation system
    print("\nTesting recommendation system:")
    history_items = [
        {
            "product_name": "Organic Bananas",
            "upc": "123456789012",
            "score": 90,
            "image_url": "https://example.com/banana.jpg",
            "reasoning": "Excellent source of potassium and fiber."
        },
        {
            "name": "Greek Yogurt",
            "upc": "987654321098",
            "score": 85,
            "image_url": "https://example.com/yogurt.jpg",
            "reasoning": "High in protein and probiotics."
        }
    ]
    print(get_food_recommendations(user_info, history_items))
