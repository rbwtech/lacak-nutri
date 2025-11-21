from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import food as crud_food
from app.schemas import food as schemas

router = APIRouter(prefix="/api/food", tags=["Food Catalog"])

@router.get("/search", response_model=schemas.FoodSearchResult)
def search_food_catalog(
    q: str = Query("", min_length=0),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Mencari database bahan makanan (Beras, Telur, dll)"""
    return crud_food.search_food(db, query=q, page=page, size=size)