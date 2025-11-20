from sqlalchemy.orm import Session
from app.models.education import EducationArticle, NutritionInfo, Additive, Disease

def get_articles(db: Session, category: str = None, limit: int = 10):
    query = db.query(EducationArticle).filter(EducationArticle.is_published == 1)
    if category and category != "all":
        query = query.filter(EducationArticle.category == category)
    return query.order_by(EducationArticle.created_at.desc()).limit(limit).all()

def get_article_by_slug(db: Session, slug: str):
    return db.query(EducationArticle).filter(EducationArticle.slug == slug).first()

def get_nutrition_dictionary(db: Session):
    return db.query(NutritionInfo).all()

def get_additives_dictionary(db: Session):
    return db.query(Additive).all()

# --- TAMBAHAN BARU ---
def get_diseases_dictionary(db: Session):
    return db.query(Disease).all()