from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud import favorites as fav_crud

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/{scan_type}/{scan_id}/toggle")
def toggle_favorite(
    scan_type: str,
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle favorite status for a scan item"""
    if scan_type not in ["bpom", "ocr"]:
        raise HTTPException(status_code=400, detail="Invalid scan type")
    
    result = fav_crud.toggle_favorite(db, current_user.id, scan_type, scan_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Scan history not found")
    
    return {
        "success": True,
        "is_favorited": result.is_favorited,
        "message": "Favorit berhasil diperbarui"
    }

@router.get("")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all favorited items"""
    favorites = fav_crud.get_favorites(db, current_user.id)
    
    return {
        "success": True,
        "data": favorites,
        "total": len(favorites)
    }