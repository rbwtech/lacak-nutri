from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form 
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.dependencies import get_current_user
from app.crud import scan as crud_scan 
from app.models.user import User, Allergen, LocalizationSetting
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
import shutil
import uuid
import re
from datetime import datetime
import pytz
from pathlib import Path

router = APIRouter(prefix="/api/users", tags=["User Data"])

class AllergenOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    
    class Config:
        from_attributes = True

class UpdateAllergyRequest(BaseModel):
    allergen_ids: List[int]

@router.get("/allergens", response_model=List[AllergenOut])
def get_all_allergens(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Allergen).filter(
        (Allergen.created_by.is_(None)) | (Allergen.created_by == current_user.id)
    ).all()

@router.get("/my-allergies", response_model=List[AllergenOut])
def get_my_allergens(current_user: User = Depends(get_current_user)):
    return current_user.allergies

@router.put("/allergies")
def update_user_allergies(
    request: UpdateAllergyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    selected_allergens = db.query(Allergen).filter(Allergen.id.in_(request.allergen_ids)).all()
    current_user.allergies = selected_allergens
    db.commit()
    return {"message": "Preferensi alergi berhasil disimpan", "total": len(selected_allergens)}

class CustomAllergyRequest(BaseModel):
    name: str

class CustomAllergyResponse(BaseModel):
    message: str
    allergen: AllergenOut

def validate_allergy_name(name: str):
    if len(name) < 3:
        raise HTTPException(400, "Nama alergi terlalu pendek (min 3 huruf)")
    if len(name) > 50:
        raise HTTPException(400, "Nama alergi terlalu panjang")
        
    if not re.match(r"^[a-zA-Z\s\-\(\)]+$", name):
        raise HTTPException(400, "Nama alergi tidak valid. Gunakan huruf saja.")
    
    return name.title().strip()

@router.post("/allergies/custom", response_model=CustomAllergyResponse)
def add_custom_allergy(
    request: CustomAllergyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_name = validate_allergy_name(request.name)

    existing = db.query(Allergen).filter(
        Allergen.name.ilike(clean_name),
        (Allergen.created_by.is_(None)) | (Allergen.created_by == current_user.id)
    ).first()
    
    if not existing:
        new_allergen = Allergen(
            name=clean_name, 
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
    
    return {
        "message": "Alergi berhasil ditambahkan",
        "allergen": {
            "id": target_allergen.id,
            "name": target_allergen.name,
            "description": target_allergen.description
        }
    }

@router.delete("/allergens/{allergen_id}")
def delete_custom_allergy(
    allergen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allergen = db.query(Allergen).filter(Allergen.id == allergen_id).first()
    if not allergen:
        raise HTTPException(404, "Alergi tidak ditemukan")

    if allergen.created_by != current_user.id:
        if allergen in current_user.allergies:
            current_user.allergies.remove(allergen)
            db.commit()
            return {"message": "Alergi dihapus dari preferensi Anda"}
        else:
             raise HTTPException(403, "Anda tidak dapat menghapus alergi sistem permanen")

    db.delete(allergen)
    db.commit()
    return {"message": "Alergi kustom berhasil dihapus permanen"}

@router.get("/localization-settings")
def get_localization_settings(
    region: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(LocalizationSetting).filter(LocalizationSetting.is_active == True)
    
    if region:
        query = query.filter(LocalizationSetting.region == region)
    
    settings = query.order_by(LocalizationSetting.region, LocalizationSetting.timezone_label).all()
    
    grouped = {}
    for setting in settings:
        if setting.region not in grouped:
            grouped[setting.region] = []
        grouped[setting.region].append({
            "id": setting.id,
            "timezone": setting.timezone,
            "timezone_offset": setting.timezone_offset,
            "timezone_label": setting.timezone_label,
            "locale": setting.locale,
            "locale_label": setting.locale_label,
            "country_code": setting.country_code,
            "region": setting.region
        })
    
    return {"data": grouped}

@router.put("/profile")
async def update_profile(
    name: str = Form(...),
    age: Optional[int] = Form(None),      
    weight: Optional[float] = Form(None), 
    height: Optional[float] = Form(None),
    gender: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    locale: Optional[str] = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.name = name
    if age is not None: current_user.age = age
    if weight is not None: current_user.weight = weight
    if height is not None: current_user.height = height
    if gender is not None: current_user.gender = gender
    if timezone is not None: current_user.timezone = timezone
    if locale is not None: current_user.locale = locale
    
    if photo:
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if photo.content_type not in allowed_types:
            raise HTTPException(400, "Format tidak didukung")
        
        if photo.size and photo.size > 2 * 1024 * 1024:
            raise HTTPException(400, "Ukuran file maksimal 2MB")
        
        filename = f"user_{current_user.id}_{uuid.uuid4().hex[:6]}.{photo.filename.split('.')[-1]}"
        upload_dir = Path("uploads/profiles")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        filepath = upload_dir / filename
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        current_user.photo_url = f"/api/uploads/profiles/{filename}"
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "success": True, 
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "age": current_user.age,
            "weight": current_user.weight,
            "height": current_user.height,
            "gender": current_user.gender,
            "timezone": current_user.timezone,
            "locale": current_user.locale,
            "photo_url": current_user.photo_url
        }
    }

@router.get("/history")
async def get_history(
    type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user timezone
    user_tz = pytz.timezone(current_user.timezone or 'Asia/Jakarta')
    
    bpom_scans, ocr_scans = crud_scan.get_user_history(db, current_user.id)
    
    history_items = []
    for scan in bpom_scans:
        # Convert to user timezone
        scan_time = scan.created_at.replace(tzinfo=pytz.UTC).astimezone(user_tz)
        history_items.append({
            "id": scan.id,
            "type": "bpom",
            "title": scan.product_name,
            "subtitle": scan.bpom_number,
            "date": scan_time.isoformat(),
            "is_favorited": scan.is_favorited
        })
    
    for scan in ocr_scans:
        scan_time = scan.created_at.replace(tzinfo=pytz.UTC).astimezone(user_tz)
        history_items.append({
            "id": scan.id,
            "type": "ocr",
            "title": scan.product_name or "Analisis Nutrisi AI",
            "subtitle": f"Scan pada {scan_time.strftime('%d %b %Y')}",
            "score": scan.health_score,
            "date": scan_time.isoformat(),
            "is_favorited": scan.is_favorited
        })
    
    # Filter & sort
    if type:
        history_items = [h for h in history_items if h["type"] == type]
    history_items.sort(key=lambda x: x["date"], reverse=True)
    
    return {"data": history_items}

class DashboardStats(BaseModel):
    favorites: int
    scans: int
    allergies: int

class ScanHistoryItem(BaseModel):
    id: int
    type: str
    title: str
    subtitle: str
    date: str
    score: Optional[int] = None
    is_favorited: Optional[bool] = False

class DashboardData(BaseModel):
    stats: DashboardStats
    recent: List[ScanHistoryItem]

@router.get("/history/{type}/{id}")
async def get_history_detail(
    type: str,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if type == "bpom":
        item = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.id == id,
            ScanHistoryBPOM.user_id == current_user.id
        ).first()
        
        if not item:
            raise HTTPException(404, "Data tidak ditemukan")
        
        return {"success": True, "data": {
            "product_name": item.product_name,
            "bpom_number": item.bpom_number,
            "brand": item.brand,
            "manufacturer": item.manufacturer,
            "status": item.status,
            "is_favorited": item.is_favorited,
            "scanned_at": item.created_at.isoformat()
        }}
    
    elif type == "ocr":
        item = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.id == id,
            ScanHistoryOCR.user_id == current_user.id
        ).first()
        
        if not item:
            raise HTTPException(404, "Data tidak ditemukan")
        
        return {"success": True, "data": {
            "health_score": item.health_score,
            "ocr_raw_data": item.ocr_raw_data,
            "ai_analysis": item.ai_analysis,
            "is_favorited": item.is_favorited,
            "scanned_at": item.created_at.isoformat()
        }}
    
    raise HTTPException(400, "Tipe tidak valid")

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_profile_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count_bpom = db.query(ScanHistoryBPOM).filter(ScanHistoryBPOM.user_id == current_user.id).count()
    count_ocr = db.query(ScanHistoryOCR).filter(ScanHistoryOCR.user_id == current_user.id).count()
    
    fav_bpom = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.user_id == current_user.id,
        ScanHistoryBPOM.is_favorited == True
    ).count()
    
    fav_ocr = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.user_id == current_user.id,
        ScanHistoryOCR.is_favorited == True
    ).count()

    return {
        "favorites": fav_bpom + fav_ocr,
        "scans": count_bpom + count_ocr,
        "allergies": len(current_user.allergies)
    }

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count_bpom = db.query(ScanHistoryBPOM).filter(ScanHistoryBPOM.user_id == current_user.id).count()
    count_ocr = db.query(ScanHistoryOCR).filter(ScanHistoryOCR.user_id == current_user.id).count()
    total_scans = count_bpom + count_ocr
    
    count_favorites = (
        db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.user_id == current_user.id,
            ScanHistoryBPOM.is_favorited == True
        ).count() +
        db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.user_id == current_user.id,
            ScanHistoryOCR.is_favorited == True
        ).count()
    )

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
            "is_favorited": item.is_favorited,
            "timestamp": item.created_at.timestamp()
        })
        
    for item in recent_ocr:
        combined.append({
            "id": item.id,
            "type": "ocr",
            "title": "Scan Label Gizi",
            "subtitle": "Analisis AI",
            "date": item.created_at.isoformat(),
            "score": item.health_score,
            "is_favorited": item.is_favorited,
            "timestamp": item.created_at.timestamp()
        })
    
    combined.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {
        "stats": {
            "scans": total_scans,
            "favorites": count_favorites,
            "history": total_scans,
            "recommendations": count_ocr 
        },
        "recent": combined[:5]
    }