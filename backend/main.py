from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, scan # Tambah scan

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

origins = [
    "http://localhost:5173",
    "https://lacaknutri.rbwtech.io",
    "http://lacaknutri.rbwtech.io"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scan.router) 

@app.get("/")
def root():
    return {"message": "LacakNutri API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}