from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud import favorites as crud_favorites
from pydantic import BaseModel

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

class AddFavoriteRequest(BaseModel):
    product_type: str
    product_name: str
    bpom_number: str = None
    product_data: dict = None

@router.post("/add")
def add_favorite(
    request: AddFavoriteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = crud_favorites.add_favorite(
        db, 
        current_user.id, 
        request.product_type, 
        request.product_name,
        request.bpom_number,
        request.product_data
    )
    return {"success": True, "favorite_id": fav.id}

@router.delete("/remove/{favorite_id}")
def remove_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = crud_favorites.remove_favorite(db, current_user.id, favorite_id)
    if not success:
        raise HTTPException(404, "Favorit tidak ditemukan")
    return {"success": True}

@router.get("/list")
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favs = crud_favorites.get_favorites(db, current_user.id)
    return {"success": True, "data": favs}

@router.get("/check")
def check_favorite(
    product_type: str,
    bpom_number: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_fav = crud_favorites.is_favorited(db, current_user.id, product_type, bpom_number)
    return {"is_favorited": is_fav}