from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.food import FoodCatalog

def search_food(db: Session, query: str, page: int = 1, size: int = 20):
    offset = (page - 1) * size
    
    # Base Query
    db_query = db.query(FoodCatalog)
    
    if query:
        # Case insensitive search
        search = f"%{query}%"
        db_query = db_query.filter(FoodCatalog.name.ilike(search))
    
    total = db_query.count()
    items = db_query.order_by(FoodCatalog.name.asc()).offset(offset).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "data": items
    }