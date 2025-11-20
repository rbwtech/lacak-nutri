from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.crud import education as crud_education
from app.schemas import education as schemas

router = APIRouter(prefix="/api/education", tags=["Education"])

@router.get("/articles", response_model=List[schemas.ArticleList])
def get_articles(category: Optional[str] = "all", db: Session = Depends(get_db)):
    return crud_education.get_articles(db, category=category)

@router.get("/articles/{slug}", response_model=schemas.ArticleDetail)
def get_article_detail(slug: str, db: Session = Depends(get_db)):
    article = crud_education.get_article_by_slug(db, slug=slug)
    if not article:
        raise HTTPException(status_code=404, detail="Artikel tidak ditemukan")
    
    article.view_count += 1
    db.commit()
    return article

@router.get("/nutrition-info", response_model=List[schemas.NutritionOut])
def get_nutrition_dictionary(db: Session = Depends(get_db)):
    return crud_education.get_nutrition_dictionary(db)

@router.get("/additives", response_model=List[schemas.AdditiveOut])
def get_additives(db: Session = Depends(get_db)):
    return crud_education.get_additives_dictionary(db)

# --- ENDPOINT BARU ---
@router.get("/diseases", response_model=List[schemas.DiseaseOut])
def get_diseases(db: Session = Depends(get_db)):
    return crud_education.get_diseases_dictionary(db)