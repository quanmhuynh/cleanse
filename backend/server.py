from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from database import DatabaseManager  # Ensure this module is in your project

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
    height: float
    weight: float
    age: int
    physical_activity: str
    gender: str
    comorbidities: List[str]
    preferences: str

class HistoryModel(BaseModel):
    email: str
    upc: str
    score: int
    reasoning: str
    image_url: str
    date: Optional[str] = None

class UserEmailModel(BaseModel):
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
def add_history(history: HistoryModel):
    try:
        db_manager.add_history(
            email=history.email,
            upc=history.upc,
            score=history.score,
            reasoning=history.reasoning,
            image_url=history.image_url,
            date=history.date,
        )
        return {"message": "History item added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/get_history")
def get_history(user: UserEmailModel):
    history_list = db_manager.get_user_history(user.email)
    if not history_list:
        raise HTTPException(
            status_code=404, detail="No history found for this user"
        )
    return history_list

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
