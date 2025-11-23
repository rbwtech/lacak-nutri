from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Allergen, LocalizationSetting
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
from app.models.education import EducationArticle, Additive, Disease, NutritionInfo
from app.models.food import FoodCatalog
from app.schemas.user import AuthorizationCode 
from app.crud import admin as crud_admin
import secrets
import os
from pathlib import Path

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    type: str = "general",  # general, article, product, profile
    admin: User = Depends(admin_required)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    file_bytes = await file.read()
    if len(file_bytes) > 2 * 1024 * 1024:
        raise HTTPException(400, "Ukuran maksimal 2MB")
    
    subdir = f"{type}s" 
    upload_dir = UPLOAD_DIR / subdir
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = file.filename.split(".")[-1].lower()
    filename = f"{type}_{secrets.token_urlsafe(16)}.{ext}"
    filepath = upload_dir / filename

    with open(filepath, "wb") as f:
        f.write(file_bytes)

    return {"success": True, "url": f"/api/uploads/{subdir}/{filename}"}

def owner_auth_required(
    current_user: User = Depends(get_current_user),
    auth_code_header: str | None = Header(None, alias="X-Authorization-Code"), 
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
        
    if current_user.id == crud_admin.OWNER_ID:
        if not auth_code_header or not crud_admin.verify_authorization_code(db, current_user.id, auth_code_header):
            raise HTTPException(
                status_code=403,
                detail="Owner Authorization Code required or invalid."
            )

    return current_user

OWNER_WRITE_DEPENDENCY = Depends(owner_auth_required)

class AuthCodeResponse(BaseModel):
    wa_link: str
    code_expires_in: str

@router.get("/auth-code", response_model=AuthCodeResponse)
def get_auth_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != crud_admin.OWNER_ID:
        raise HTTPException(403, "Owner access required")
        
    # Generate code and save to DB (valid for 5 minutes)
    code = crud_admin.create_authorization_code(db, lifetime_minutes=5)
    
    owner_phone = crud_admin.OWNER_PHONE
    message = f"Kode Otorisasi Admin Anda adalah: {code}. Kode ini berlaku 2 jam."
    wa_link = f"https://wa.me/{owner_phone}?text={message.replace(' ', '%20')}"
    
    return {
        "wa_link": wa_link,
        "code_expires_in": "2 jam"
    }


# ============= DASHBOARD STATS =============
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    total_users = db.query(User).count()
    total_scans = db.query(ScanHistoryBPOM).count() + db.query(ScanHistoryOCR).count()
    total_articles = db.query(EducationArticle).count()
    total_products = db.query(FoodCatalog).count()
    total_allergens = db.query(Allergen).count()
    total_additives = db.query(Additive).count()
    total_diseases = db.query(Disease).count()
    total_localization = db.query(LocalizationSetting).count()
    
    return {
        "users": total_users,
        "scans": total_scans,
        "articles": total_articles,
        "products": total_products,
        "allergens": total_allergens,  # Added
        "additives": total_additives,  # Added
        "diseases": total_diseases,    # Added
        "localization": total_localization # Added
    }

# ============= USER MANAGEMENT =============
@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    
    users = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "data": [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "age": u.age,
            "weight": u.weight,
            "height": u.height,
            "timezone": u.timezone,
            "locale": u.locale,
            "allergies": [a.name for a in u.allergies]
        } for u in users],
        "total": total
    }

class UpdateUserRole(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    data: UpdateUserRole,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    if data.role not in ["user", "admin"]:
        raise HTTPException(400, "Invalid role")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    user.role = data.role
    db.commit()
    return {"success": True, "message": f"Role updated to {data.role}"}

class UpdateUserEmail(BaseModel):
    email: EmailStr

@router.patch("/users/{user_id}/email")
def update_user_email(
    user_id: int,
    data: UpdateUserEmail,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
    if existing:
        raise HTTPException(400, "Email already in use")
    
    user.email = data.email
    db.commit()
    return {"success": True, "message": "Email updated"}

@router.post("/users/{user_id}/reset-password")
def send_reset_password_link(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    reset_token = secrets.token_urlsafe(32)
    reset_link = f"https://lacaknutri.rbwtech.io/reset-password?token={reset_token}"
    
    return {
        "success": True,
        "message": "Reset link generated",
        "reset_link": reset_link,
        "user_email": user.email
    }

# ============= HISTORY MANAGEMENT =============
@router.get("/history/bpom")
def get_all_bpom_scans(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    scans = db.query(ScanHistoryBPOM).order_by(ScanHistoryBPOM.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(ScanHistoryBPOM).count()
    
    return {
        "data": [{
            "id": s.id,
            "user_id": s.user_id,
            "user_name": s.user.name if s.user else "Unknown",
            "product_name": s.product_name,
            "bpom_number": s.bpom_number,
            "manufacturer": s.manufacturer,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        } for s in scans],
        "total": total
    }

@router.get("/history/ocr")
def get_all_ocr_scans(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    scans = db.query(ScanHistoryOCR).order_by(ScanHistoryOCR.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(ScanHistoryOCR).count()
    
    return {
        "data": [{
            "id": s.id,
            "user_id": s.user_id,
            "user_name": s.user.name if s.user else "Unknown",
            "product_name": s.product_name,
            "health_score": s.health_score,
            "created_at": s.created_at.isoformat() if s.created_at else None
        } for s in scans],
        "total": total
    }

# ============= ALLERGEN CRUD =============
class AllergenCreate(BaseModel):
    name: str
    description: Optional[str] = None

@router.get("/allergens")
def get_allergens_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    allergens = db.query(Allergen).all()
    return {
        "data": [{
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "created_by": a.created_by
        } for a in allergens],
        "total": len(allergens)
    }

@router.post("/allergens")
def create_allergen(
    data: AllergenCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    allergen = Allergen(name=data.name, description=data.description)
    db.add(allergen)
    db.commit()
    db.refresh(allergen)
    return {"success": True, "data": {"id": allergen.id, "name": allergen.name}}

@router.put("/allergens/{allergen_id}")
def update_allergen(
    allergen_id: int,
    data: AllergenCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    allergen = db.query(Allergen).filter(Allergen.id == allergen_id).first()
    if not allergen:
        raise HTTPException(404, "Allergen not found")
    
    allergen.name = data.name
    allergen.description = data.description
    db.commit()
    return {"success": True, "message": "Updated"}

@router.delete("/allergens/{allergen_id}")
def delete_allergen(
    allergen_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    allergen = db.query(Allergen).filter(Allergen.id == allergen_id).first()
    if not allergen:
        raise HTTPException(404, "Allergen not found")
    
    db.delete(allergen)
    db.commit()
    return {"success": True, "message": "Deleted"}

# ============= ADDITIVE CRUD =============
class AdditiveCreate(BaseModel):
    name: str
    code: Optional[str] = None
    category: Optional[str] = None
    safety_level: Optional[str] = "safe"
    description: Optional[str] = None
    health_risks: Optional[str] = None

@router.get("/additives")
def get_additives_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    additives = db.query(Additive).all()
    return {"data": additives, "total": len(additives)}

@router.post("/additives")
def create_additive(
    data: AdditiveCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    additive = Additive(**data.dict())
    db.add(additive)
    db.commit()
    db.refresh(additive)
    return {"success": True}

@router.put("/additives/{additive_id}")
def update_additive(
    additive_id: int,
    data: AdditiveCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    additive = db.query(Additive).filter(Additive.id == additive_id).first()
    if not additive:
        raise HTTPException(404, "Not found")
    
    for key, value in data.dict().items():
        setattr(additive, key, value)
    db.commit()
    return {"success": True}

@router.delete("/additives/{additive_id}")
def delete_additive(
    additive_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    additive = db.query(Additive).filter(Additive.id == additive_id).first()
    if not additive:
        raise HTTPException(404, "Not found")
    db.delete(additive)
    db.commit()
    return {"success": True}

# ============= DISEASE CRUD =============
class DiseaseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dietary_recommendations: Optional[str] = None
    foods_to_avoid: Optional[str] = None

@router.get("/diseases")
def get_diseases_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    diseases = db.query(Disease).all()
    return {"data": diseases, "total": len(diseases)}

@router.post("/diseases")
def create_disease(
    data: DiseaseCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    disease = Disease(**data.dict())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return {"success": True}

@router.put("/diseases/{disease_id}")
def update_disease(
    disease_id: int,
    data: DiseaseCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(404, "Not found")
    
    for key, value in data.dict().items():
        setattr(disease, key, value)
    db.commit()
    return {"success": True}

@router.delete("/diseases/{disease_id}")
def delete_disease(
    disease_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(404, "Not found")
    db.delete(disease)
    db.commit()
    return {"success": True}

# ============= LOCALIZATION CRUD =============
class LocalizationCreate(BaseModel):
    timezone: str
    timezone_offset: str
    timezone_label: str
    locale: str
    locale_label: str
    country_code: str
    region: str
    is_active: bool = True

@router.get("/localization")
def get_localization_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    settings = db.query(LocalizationSetting).all()
    return {"data": settings, "total": len(settings)}

@router.post("/localization")
def create_localization(
    data: LocalizationCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    setting = LocalizationSetting(**data.dict())
    db.add(setting)
    db.commit()
    return {"success": True}

@router.put("/localization/{setting_id}")
def update_localization(
    setting_id: int,
    data: LocalizationCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    setting = db.query(LocalizationSetting).filter(LocalizationSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(404, "Not found")
    
    for key, value in data.dict().items():
        setattr(setting, key, value)
    db.commit()
    return {"success": True}

@router.delete("/localization/{setting_id}")
def delete_localization(
    setting_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    setting = db.query(LocalizationSetting).filter(LocalizationSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(404, "Not found")
    db.delete(setting)
    db.commit()
    return {"success": True}

# ============= ARTICLES CRUD =============
class ArticleCreate(BaseModel):
    title: str
    slug: str
    content: str
    category: str
    author: Optional[str] = None
    thumbnail_url: Optional[str] = None

@router.get("/articles")
def get_articles_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    articles = db.query(EducationArticle).all()
    return {"data": articles}

@router.post("/articles")
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    article = EducationArticle(**data.dict())
    db.add(article)
    db.commit()
    return {"success": True}

@router.put("/articles/{article_id}")
def update_article(
    article_id: int,
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    article = db.query(EducationArticle).filter(EducationArticle.id == article_id).first()
    if not article:
        raise HTTPException(404, "Not found")
    
    for key, value in data.dict().items():
        setattr(article, key, value)
    db.commit()
    return {"success": True}

@router.delete("/articles/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    article = db.query(EducationArticle).filter(EducationArticle.id == article_id).first()
    if not article:
        raise HTTPException(404, "Not found")
    db.delete(article)
    db.commit()
    return {"success": True}

# ============= FOOD CATALOG CRUD =============
class FoodCatalogCreate(BaseModel):
    original_code: Optional[str] = None
    name: str
    weight_g: Optional[float] = 100.0
    calories: Optional[float] = 0.0
    protein: Optional[float] = 0.0
    fat: Optional[float] = 0.0
    carbs: Optional[float] = 0.0
    sugar: Optional[float] = 0.0
    fiber: Optional[float] = 0.0
    sodium_mg: Optional[float] = 0.0
    potassium_mg: Optional[float] = 0.0
    calcium_mg: Optional[float] = 0.0
    iron_mg: Optional[float] = 0.0
    cholesterol_mg: Optional[float] = 0.0
    image_url: Optional[str] = None

@router.get("/food-catalog")
def get_food_catalog(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    products = db.query(FoodCatalog).offset(skip).limit(limit).all()
    return {
        "data": [{
            "id": p.id,
            "original_code": p.original_code,
            "name": p.name,
            "weight_g": float(p.weight_g) if p.weight_g else 100.0,
            "calories": float(p.calories) if p.calories else 0.0,
            "protein": float(p.protein) if p.protein else 0.0,
            "fat": float(p.fat) if p.fat else 0.0,
            "carbs": float(p.carbs) if p.carbs else 0.0,
            "sugar": float(p.sugar) if p.sugar else 0.0,
            "fiber": float(p.fiber) if p.fiber else 0.0,
            "sodium_mg": float(p.sodium_mg) if p.sodium_mg else 0.0,
            "image_url": getattr(p, 'image_url', None)
        } for p in products],
        "total": db.query(FoodCatalog).count()
    }

@router.post("/food-catalog")
def create_food_product(
    data: FoodCatalogCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    product = FoodCatalog(**data.dict())
    db.add(product)
    db.commit()
    return {"success": True}

@router.put("/food-catalog/{product_id}")
def update_food_product(
    product_id: int,
    data: FoodCatalogCreate,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    product = db.query(FoodCatalog).filter(FoodCatalog.id == product_id).first()
    if not product:
        raise HTTPException(404, "Not found")
    
    for key, value in data.dict().items():
        setattr(product, key, value)
    db.commit()
    return {"success": True}

@router.delete("/food-catalog/{product_id}")
def delete_food_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = OWNER_WRITE_DEPENDENCY
):
    product = db.query(FoodCatalog).filter(FoodCatalog.id == product_id).first()
    if not product:
        raise HTTPException(404, "Not found")
    db.delete(product)
    db.commit()
    return {"success": True}