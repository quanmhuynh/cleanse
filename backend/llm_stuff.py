from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os
from pydantic import BaseModel
load_dotenv()

model = ChatOpenAI(model="gpt-4o", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
