from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI


llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=os.getenv("GEMINI_API_KEY")
    # other params...
)
load_dotenv()

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
    Using the information provided below, assign a health suitability score between 0 and 100 that reflects how appropriate this food is for the patient. Consider the patient’s overall health profile—including age, weight, comorbidities, and lifestyle—as well as the food's nutritional indicators and ingredient list. In your evaluation, be sure to:
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

model = ChatOpenAI(model="gpt-4o", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))


def get_llm_response(user_info, food_info):
    # Merge patient and food details into a single parameter dictionary.
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

    # Invoke the enhanced prompt template with the parameters.

    prompt = prompt_template.invoke(params)
    structured_llm = model.with_structured_output(ResponseFormatter)
    # Call the language model with the generated prompt and return its response.
    response = structured_llm.invoke(prompt)
    return response

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

    print(get_llm_response(user_info, food_info))
