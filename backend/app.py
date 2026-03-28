from fastapi import FastAPI
from routes import process
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NyayBot API",
    description="Legal Document Simplification & Translation Bot",
    version="1.0.0"
)

# Allow frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router)

@app.get("/")
def home():
    return {"message": "NyayBot Backend Running ✅"}
