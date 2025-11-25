from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

@router.get("/status/{scan_type}/{scan_id}")
def check_favorite_status(
    scan_type: str,
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if scan_type == "bpom":
        item = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.id == scan_id,
            ScanHistoryBPOM.user_id == current_user.id
        ).first()
    else:
        item = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.id == scan_id,
            ScanHistoryOCR.user_id == current_user.id
        ).first()
    
    if not item:
        return {"is_favorited": False}
    
    return {"is_favorited": item.is_favorited}

@router.post("/{scan_type}/{scan_id}/toggle")
def toggle_fav(
    scan_type: str,
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if scan_type == "bpom":
        scan = db.query(ScanHistoryBPOM).filter(
            ScanHistoryBPOM.id == scan_id,
            ScanHistoryBPOM.user_id == current_user.id
        ).first()
    else:
        scan = db.query(ScanHistoryOCR).filter(
            ScanHistoryOCR.id == scan_id,
            ScanHistoryOCR.user_id == current_user.id
        ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    
    scan.is_favorited = not scan.is_favorited
    db.commit()
    
    return {"is_favorited": scan.is_favorited}

@router.get("/list")
def read_favorites(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    bpom_favs = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.user_id == current_user.id,
        ScanHistoryBPOM.is_favorited == True
    ).offset(skip).limit(limit).all()
    
    ocr_favs = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.user_id == current_user.id,
        ScanHistoryOCR.is_favorited == True
    ).offset(skip).limit(limit).all()
    
    result = []
    
    for scan in bpom_favs:
        result.append({
            "id": scan.id,
            "product_type": "bpom",
            "product_name": scan.product_name,
            "bpom_number": scan.bpom_number,
            "product_data": {}
        })
    
    for scan in ocr_favs:
        result.append({
            "id": scan.id,
            "product_type": "ocr",
            "product_name": scan.product_name,
            "bpom_number": None,
            "product_data": {
                "health_score": scan.health_score,
                "grade": scan.grade
            }
        })
    
    return result