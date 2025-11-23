from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, Allergen, LocalizationSetting
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
from app.models.education import Article
from app.models.food import FoodCatalog  # FIX: Use food instead of nutrition
import secrets

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user

# ============= DASHBOARD STATS =============
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    total_users = db.query(User).count()
    total_bpom = db.query(ScanHistoryBPOM).count()
    total_ocr = db.query(ScanHistoryOCR).count()
    total_articles = db.query(Article).count()
    total_products = db.query(FoodCatalog).count()
    
    return {
        "users": total_users,
        "scans": total_bpom + total_ocr,
        "articles": total_articles,
        "products": total_products
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
            "created_at": u.created_at.isoformat(),
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
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
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
            "user_name": s.user.name,
            "product_name": s.product_name,
            "bpom_number": s.bpom_number,
            "manufacturer": s.manufacturer,
            "status": s.status,
            "created_at": s.created_at.isoformat()
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
            "user_name": s.user.name,
            "product_name": s.product_name,
            "health_score": s.health_score,
            "created_at": s.created_at.isoformat()
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
        } for a in allergens]
    }

@router.post("/allergens")
def create_allergen(
    data: AllergenCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
):
    allergen = db.query(Allergen).filter(Allergen.id == allergen_id).first()
    if not allergen:
        raise HTTPException(404, "Allergen not found")
    
    db.delete(allergen)
    db.commit()
    return {"success": True, "message": "Deleted"}

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
    return {"data": settings}

@router.post("/localization")
def create_localization(
    data: LocalizationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
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

@router.get("/articles")
def get_articles_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    articles = db.query(Article).all()
    return {"data": articles}

@router.post("/articles")
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    article = Article(**data.dict())
    db.add(article)
    db.commit()
    return {"success": True}

@router.put("/articles/{article_id}")
def update_article(
    article_id: int,
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    article = db.query(Article).filter(Article.id == article_id).first()
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
    admin: User = Depends(admin_required)
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(404, "Not found")
    db.delete(article)
    db.commit()
    return {"success": True}

# ============= FOOD CATALOG CRUD =============
class FoodCatalogCreate(BaseModel):
    product_name: str
    brand: Optional[str] = None
    bpom_number: Optional[str] = None
    category: Optional[str] = None

@router.get("/food-catalog")
def get_food_catalog(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
):
    products = db.query(FoodCatalog).all()
    return {"data": products}

@router.post("/food-catalog")
def create_food_product(
    data: FoodCatalogCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
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
    admin: User = Depends(admin_required)
):
    product = db.query(FoodCatalog).filter(FoodCatalog.id == product_id).first()
    if not product:
        raise HTTPException(404, "Not found")
    db.delete(product)
    db.commit()
    return {"success": True}