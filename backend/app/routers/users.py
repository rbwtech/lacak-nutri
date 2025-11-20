from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Allergen

router = APIRouter(prefix="/api/users", tags=["User Data"])

# Schema Sederhana untuk Alergi
class AllergenOut(BaseModel):
    id: int
    name: str
    description: str | None = None

class UpdateAllergyRequest(BaseModel):
    allergen_ids: List[int]

@router.get("/allergens", response_model=List[AllergenOut])
def get_all_allergens(db: Session = Depends(get_db)):
    """Mendapatkan daftar semua alergen master"""
    return db.query(Allergen).all()

@router.get("/my-allergies", response_model=List[AllergenOut])
def get_my_allergens(current_user: User = Depends(get_current_user)):
    """Mendapatkan alergi user yang sedang login"""
    return current_user.allergies

@router.put("/allergies")
def update_user_allergies(
    request: UpdateAllergyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update pilihan alergi user"""
    # Ambil object allergen berdasarkan ID yang dikirim
    selected_allergens = db.query(Allergen).filter(Allergen.id.in_(request.allergen_ids)).all()
    
    # Replace alergi lama dengan yang baru
    current_user.allergies = selected_allergens
    db.commit()
    
    return {"message": "Preferensi alergi berhasil disimpan", "total": len(selected_allergens)}