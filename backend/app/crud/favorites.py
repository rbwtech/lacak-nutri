from sqlalchemy.orm import Session
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
from app.schemas.food import ProductDetail

# --- TOGGLE FAVORITE (Langsung di History) ---
def toggle_favorite(db: Session, user_id: int, scan_type: str, scan_id: int):
    item = None
    if scan_type == "bpom":
        item = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.id == scan_id,
            ScanHistoryBPOM.user_id == user_id
        ).first()
    elif scan_type == "ocr":
        item = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.id == scan_id,
            ScanHistoryOCR.user_id == user_id
        ).first()
    
    if not item:
        return None
    
    # Flip status
    item.is_favorited = not item.is_favorited
    db.commit()
    db.refresh(item)
    
    return {
        "id": item.id,
        "is_favorited": item.is_favorited
    }

# --- LIST FAVORITES (Ambil dari History yang di-Love) ---
def get_favorites_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # 1. Ambil dari Scan History BPOM (is_favorited = True)
    bpom_favs = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.user_id == user_id,
        ScanHistoryBPOM.is_favorited == True
    ).order_by(ScanHistoryBPOM.created_at.desc()).all()
    
    # 2. Ambil dari Scan History OCR (is_favorited = True)
    ocr_favs = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.user_id == user_id,
        ScanHistoryOCR.is_favorited == True
    ).order_by(ScanHistoryOCR.created_at.desc()).all()
    
    result = []
    
    # Mapping BPOM ke Schema ProductDetail
    for item in bpom_favs:
        result.append({
            "id": item.id,
            "product_type": "bpom", 
            "product_name": item.product_name or "Produk BPOM",
            "bpom_number": item.bpom_number,
            "product_data": {
                "brand": item.brand,
                "manufacturer": item.manufacturer,
                "status": item.status
            },
            "created_at": item.created_at
        })
    
    # Mapping OCR ke Schema ProductDetail
    for item in ocr_favs:
        result.append({
            "id": item.id,
            "product_type": "ocr",
            "product_name": "Analisis Nutrisi (AI)",
            "bpom_number": None,
            "product_data": {
                "health_score": item.health_score,
                "summary": "Hasil scan nutrisi"
            },
            "created_at": item.created_at
        })
    
    # Sort gabungan berdasarkan waktu (terbaru diatas)
    result.sort(key=lambda x: x['created_at'], reverse=True)
    
    # Pagination
    return result[skip : skip + limit]