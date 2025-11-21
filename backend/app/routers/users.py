from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form 
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Allergen
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
import shutil
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/users", tags=["User Data"])

# Schema Sederhana untuk Alergi
class AllergenOut(BaseModel):
    id: int
    name: str
    description: str | None = None

class UpdateAllergyRequest(BaseModel):
    allergen_ids: List[int]

@router.get("/allergens", response_model=List[AllergenOut])
def get_all_allergens(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Allergen).filter(
        (Allergen.created_by.is_(None)) | (Allergen.created_by == current_user.id)
    ).all()

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
    existing = db.query(Allergen).filter(
        Allergen.name.ilike(request.name),
        (Allergen.created_by.is_(None)) | (Allergen.created_by == current_user.id)
    ).first()
    
    if not existing:
        new_allergen = Allergen(
            name=request.name.title(), 
            description="Custom user input",
            created_by=current_user.id 
        )
        db.add(new_allergen)
        db.commit()
        db.refresh(new_allergen)
        target_allergen = new_allergen
    else:
        target_allergen = existing
    
    if target_allergen not in current_user.allergies:
        current_user.allergies.append(target_allergen)
        db.commit()
        
    return {"message": "Alergi custom berhasil ditambahkan", "allergen": target_allergen}

@router.put("/profile")
async def update_profile(
    name: str = Form(...),
    phone: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.name = name
    if phone:
        current_user.phone = phone
    
    if photo:
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if photo.content_type not in allowed_types:
            raise HTTPException(400, "Format tidak didukung")
        
        if photo.size > 2 * 1024 * 1024:
            raise HTTPException(400, "Ukuran file maksimal 2MB")
        
        filename = f"{uuid.uuid4()}.{photo.filename.split('.')[-1]}"
        upload_dir = Path("uploads/profiles")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = upload_dir / filename
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        current_user.photo_url = f"/uploads/profiles/{filename}"
    
    db.commit()
    db.refresh(current_user)
    
    return {"success": True, "user": {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "photo_url": current_user.photo_url
    }}

@router.get("/history")
async def get_history(
    type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query kedua tabel
    bpom_items = []
    ocr_items = []
    
    if type is None or type == "bpom":
        bpom_items = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.user_id == current_user.id
        ).order_by(ScanHistoryBPOM.created_at.desc()).limit(50).all()
    
    if type is None or type == "ocr":
        ocr_items = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.user_id == current_user.id
        ).order_by(ScanHistoryOCR.created_at.desc()).limit(50).all()
    
    combined = []
    
    for item in bpom_items:
        combined.append({
            "id": item.id,
            "type": "bpom",
            "title": item.product_name or "Produk BPOM",
            "subtitle": item.bpom_number,
            "score": None,
            "date": item.created_at.isoformat(),
            "timestamp": item.created_at.timestamp()
        })
    
    for item in ocr_items:
        combined.append({
            "id": item.id,
            "type": "ocr",
            "title": "Analisis Nutrisi AI",
            "subtitle": f"Health Score: {item.health_score}/100",
            "score": item.health_score,
            "date": item.created_at.isoformat(),
            "timestamp": item.created_at.timestamp()
        })
    
    combined.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {"success": True, "data": combined[:50]}

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