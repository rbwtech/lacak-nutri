from sqlalchemy.orm import Session
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR

def toggle_favorite(db: Session, user_id: int, scan_type: str, scan_id: int):
    if scan_type == "bpom":
        scan = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.id == scan_id,
            ScanHistoryBPOM.user_id == user_id
        ).first()
    elif scan_type == "ocr":
        scan = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.id == scan_id,
            ScanHistoryOCR.user_id == user_id
        ).first()
    else:
        return None
    
    if not scan:
        return None
    
    scan.is_favorited = not scan.is_favorited
    db.commit()
    db.refresh(scan)
    return scan

def get_favorites(db: Session, user_id: int):
    bpom_favs = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.user_id == user_id,
        ScanHistoryBPOM.is_favorited == True
    ).order_by(ScanHistoryBPOM.created_at.desc()).all()
    
    ocr_favs = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.user_id == user_id,
        ScanHistoryOCR.is_favorited == True
    ).order_by(ScanHistoryOCR.created_at.desc()).all()
    
    result = []
    
    for item in bpom_favs:
        result.append({
            "id": item.id,
            "type": "bpom",
            "product_name": item.product_name or "Produk BPOM",
            "bpom_number": item.bpom_number,
            "brand": item.brand,
            "manufacturer": item.manufacturer,
            "status": item.status,
            "raw_response": item.raw_response,
            "created_at": item.created_at.isoformat(),
            "is_favorited": True
        })
    
    for item in ocr_favs:
        result.append({
            "id": item.id,
            "type": "ocr",
            "product_name": "Scan Label Gizi",
            "image_url": item.image_url,
            "ocr_raw_data": item.ocr_raw_data,
            "ai_analysis": item.ai_analysis,
            "health_score": item.health_score,
            "created_at": item.created_at.isoformat(),
            "is_favorited": True
        })
    
    result.sort(key=lambda x: x['created_at'], reverse=True)
    return result

def get_favorite_count(db: Session, user_id: int):
    bpom_count = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.user_id == user_id,
        ScanHistoryBPOM.is_favorited == True
    ).count()
    
    ocr_count = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.user_id == user_id,
        ScanHistoryOCR.is_favorited == True
    ).count()
    
    return bpom_count + ocr_count