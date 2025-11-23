from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, users, food, scan, education, favorites, admin
import os

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="api-uploads")

app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(users.router) 
app.include_router(education.router)
app.include_router(food.router)
app.include_router(favorites.router)
app.include_router(admin.router) 

@app.get("/")
def root():
    return {"message": "LacakNutri API v1.0.0 is runnning"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}