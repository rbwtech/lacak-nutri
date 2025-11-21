from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.education import EducationArticle, NutritionInfo, Additive, Disease

def get_articles(db: Session, category: str = None, query: str = None, page: int = 1, size: int = 9):
    offset = (page - 1) * size
    db_query = db.query(EducationArticle).filter(EducationArticle.is_published == 1)
    
    # Filter Kategori
    if category and category != "all":
        db_query = db_query.filter(EducationArticle.category == category)
    
    # Filter Search (Judul)
    if query:
        search = f"%{query}%"
        db_query = db_query.filter(EducationArticle.title.ilike(search))
        
    total = db_query.count()
    items = db_query.order_by(EducationArticle.created_at.desc()).offset(offset).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "data": items
    }

def get_article_by_slug(db: Session, slug: str):
    return db.query(EducationArticle).filter(EducationArticle.slug == slug).first()

def get_nutrition_dictionary(db: Session):
    return db.query(NutritionInfo).all()

def get_additives_dictionary(db: Session):
    return db.query(Additive).all()

# --- TAMBAHAN BARU ---
def get_diseases_dictionary(db: Session):
    return db.query(Disease).all()