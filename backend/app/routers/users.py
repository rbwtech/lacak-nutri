from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Allergen
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR

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

class CustomAllergyRequest(BaseModel):
    name: str

@router.post("/allergies/custom")
def add_custom_allergy(
    request: CustomAllergyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Menambahkan alergi custom dan langsung memilihnya untuk user"""
    # 1. Cek apakah alergi sudah ada di master (case insensitive)
    existing = db.query(Allergen).filter(Allergen.name.ilike(request.name)).first()
    
    if not existing:
        # Buat baru jika belum ada
        new_allergen = Allergen(name=request.name.title(), description="Custom user input")
        db.add(new_allergen)
        db.commit()
        db.refresh(new_allergen)
        target_allergen = new_allergen
    else:
        target_allergen = existing
    
    # 2. Tambahkan ke list user jika belum ada
    if target_allergen not in current_user.allergies:
        current_user.allergies.append(target_allergen)
        db.commit()
        
    return {"message": "Alergi berhasil ditambahkan", "allergen": {"id": target_allergen.id, "name": target_allergen.name}}

class DashboardStats(BaseModel):
    scans: int
    favorites: int
    history: int
    recommendations: int

class ScanHistoryItem(BaseModel):
    id: int
    type: str # 'bpom' or 'ocr'
    title: str
    subtitle: str
    date: str
    score: Optional[int] = None

class DashboardData(BaseModel):
    stats: DashboardStats
    recent: List[ScanHistoryItem]

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count_bpom = db.query(ScanHistoryBPOM).filter(ScanHistoryBPOM.user_id == current_user.id).count()
    count_ocr = db.query(ScanHistoryOCR).filter(ScanHistoryOCR.user_id == current_user.id).count()
    total_scans = count_bpom + count_ocr

    recent_bpom = db.query(ScanHistoryBPOM).filter(ScanHistoryBPOM.user_id == current_user.id)\
                    .order_by(ScanHistoryBPOM.created_at.desc()).limit(5).all()
    
    recent_ocr = db.query(ScanHistoryOCR).filter(ScanHistoryOCR.user_id == current_user.id)\
                   .order_by(ScanHistoryOCR.created_at.desc()).limit(5).all()
    
    combined = []
    for item in recent_bpom:
        combined.append({
            "id": item.id,
            "type": "bpom",
            "title": item.product_name or "Produk BPOM",
            "subtitle": item.bpom_number,
            "date": item.created_at.isoformat(),
            "score": None,
            "timestamp": item.created_at.timestamp()
        })
        
    for item in recent_ocr:
        combined.append({
            "id": item.id,
            "type": "ocr",
            "title": "Scan Label Gizi",
            "subtitle": f"Analisis AI",
            "date": item.created_at.isoformat(),
            "score": item.health_score,
            "timestamp": item.created_at.timestamp()
        })
    
    # Sort by time desc
    combined.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {
        "stats": {
            "scans": total_scans,
            "favorites": 0, # Belum implementasi favorit
            "history": total_scans,
            "recommendations": count_ocr 
        },
        "recent": combined[:5] # Ambil 5 teratas
    }