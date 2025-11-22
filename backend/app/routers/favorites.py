from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud import favorites as crud_favorites
from app.schemas.food import ProductDetail

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

# Endpoint Toggle (Dipakai saat klik love di history/scanner)
@router.post("/{scan_type}/{scan_id}/toggle")
def toggle_fav(
    scan_type: str,
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = crud_favorites.toggle_favorite(db, current_user.id, scan_type, scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Item history tidak ditemukan")
    
    return result

# Endpoint List (Untuk halaman Favorites)
@router.get("/list", response_model=List[ProductDetail]) 
def read_favorites(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    favorites = crud_favorites.get_favorites_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return favorites