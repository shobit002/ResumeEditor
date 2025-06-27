from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

# Mock AI Enhance API
@app.post("/ai-enhance")
def ai_enhance(data: SectionInput):
    return {
        "enhanced_content": f"Enhanced version of: {data.content}"
    }

# Save Resume API
@app.post("/save-resume")
def save_resume(resume: Resume):
    import json
    with open("saved_resume.json", "w") as f:
        json.dump(resume.data, f)
    return {"status": "saved"}
