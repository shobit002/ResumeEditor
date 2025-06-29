from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class SectionInput(BaseModel):
    section: str
    content: str

class Resume(BaseModel):
    data: dict

RESUME_FILE = "saved_resume.json"

@app.post("/ai-enhance")
def ai_enhance(data: SectionInput):
    # Placeholder logic – can later connect to OpenAI or HuggingFace
    return {
        "enhanced_content": f"✨ Enhanced: {data.content}"
    }

@app.post("/save-resume")
def save_resume(resume: Resume):
    with open(RESUME_FILE, "w") as f:
        json.dump(resume.data, f, indent=2)
    return {"status": "saved"}

@app.get("/get-resume")
def get_resume():
    if os.path.exists(RESUME_FILE):
        with open(RESUME_FILE, "r") as f:
            data = json.load(f)
        return {"resume": data}
    return {"resume": {}}
