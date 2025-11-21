from sqlalchemy.orm import Session
from app.models.favorite import Favorite
import json

def add_favorite(db: Session, user_id: int, product_type: str, product_name: str, bpom_number: str = None, product_data: dict = None):
    existing = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_type == product_type,
        Favorite.bpom_number == bpom_number
    ).first()
    
    if existing:
        return existing
    
    fav = Favorite(
        user_id=user_id,
        product_type=product_type,
        bpom_number=bpom_number,
        product_name=product_name,
        product_data=json.dumps(product_data) if product_data else None
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

def remove_favorite(db: Session, user_id: int, favorite_id: int):
    fav = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == user_id
    ).first()
    
    if fav:
        db.delete(fav)
        db.commit()
        return True
    return False

def get_favorites(db: Session, user_id: int):
    favs = db.query(Favorite).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()
    return [
        {
            "id": f.id,
            "product_type": f.product_type,
            "bpom_number": f.bpom_number,
            "product_name": f.product_name,
            "product_data": json.loads(f.product_data) if f.product_data else None,
            "created_at": f.created_at.isoformat()
        }
        for f in favs
    ]

def is_favorited(db: Session, user_id: int, product_type: str, bpom_number: str = None):
    return db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_type == product_type,
        Favorite.bpom_number == bpom_number
    ).first() is not None