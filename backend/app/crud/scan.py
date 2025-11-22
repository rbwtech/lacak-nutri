from sqlalchemy.orm import Session
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR, BPOMCache
from datetime import datetime, timedelta
import json

def get_bpom_cache(db: Session, bpom_number: str):
    cache = db.query(BPOMCache).filter(BPOMCache.bpom_number == bpom_number).first()
    if cache:
        expiry_date = cache.last_updated + timedelta(days=30)
        if datetime.now() < expiry_date:
            return cache.data
    return None

def create_bpom_cache(db: Session, bpom_number: str, data: dict):
    existing = db.query(BPOMCache).filter(BPOMCache.bpom_number == bpom_number).first()
    if existing:
        existing.data = data
        existing.last_updated = datetime.now()
        db.commit()
        db.refresh(existing)
    else:
        new_cache = BPOMCache(bpom_number=bpom_number, data=data)
        db.add(new_cache)
        db.commit()

def create_bpom_history(db: Session, user_id: int, data: dict, session_id: str = None):
    if not data:
        return None
        
    query = db.query(ScanHistoryBPOM)
    
    if user_id:
        query = query.filter(ScanHistoryBPOM.user_id == user_id)
    else:
        query = query.filter(ScanHistoryBPOM.session_id == session_id)
    
    bpom_num = data.get("bpom_number")
    if not bpom_num:
        return None
        
    existing_scan = query.filter(
        ScanHistoryBPOM.bpom_number == bpom_num
    ).first()

    if existing_scan:
        existing_scan.created_at = datetime.now()
        existing_scan.product_name = data.get("product_name")
        existing_scan.brand = data.get("brand")
        existing_scan.manufacturer = data.get("manufacturer")
        existing_scan.status = data.get("status", "Berlaku")
        existing_scan.raw_response = data
        if not existing_scan.session_id and session_id:
            existing_scan.session_id = session_id
            
        db.commit()
        db.refresh(existing_scan)
        return existing_scan

    db_scan = ScanHistoryBPOM(
        user_id=user_id,
        session_id=session_id or "guest", 
        bpom_number=bpom_num,
        product_name=data.get("product_name"),
        brand=data.get("brand"),
        manufacturer=data.get("manufacturer"),
        status=data.get("status", "Berlaku"),
        raw_response=data
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

def create_ocr_history(db: Session, user_id: int, product_name: str, image_data: str, 
                       health_score: int, grade: str, ocr_data: str, ai_analysis: str, 
                       pros: list = None, cons: list = None, ingredients: str = None, 
                       warnings: list = None, session_id: str = None):
    query = db.query(ScanHistoryOCR)
    if user_id:
        query = query.filter(ScanHistoryOCR.user_id == user_id)
    else:
        query = query.filter(ScanHistoryOCR.session_id == session_id)
        
    last_scan = query.order_by(ScanHistoryOCR.created_at.desc()).first()

    if last_scan and last_scan.ocr_raw_data == ocr_data:
        last_scan.created_at = datetime.now()
        db.commit()
        db.refresh(last_scan)
        return last_scan

    db_scan = ScanHistoryOCR(
        user_id=user_id,
        session_id=session_id or "guest",
        product_name=product_name,
        image_data=image_data,
        pros=pros,
        cons=cons,
        ingredients=ingredients,
        warnings=warnings, 
        health_score=health_score,
        grade=grade,
        ocr_raw_data=ocr_data,
        ai_analysis=ai_analysis
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

def get_user_history(db: Session, user_id: int, limit: int = 20):
    bpom = db.query(ScanHistoryBPOM).filter(ScanHistoryBPOM.user_id == user_id)\
        .order_by(ScanHistoryBPOM.created_at.desc()).limit(limit).all()
    ocr = db.query(ScanHistoryOCR).filter(ScanHistoryOCR.user_id == user_id)\
        .order_by(ScanHistoryOCR.created_at.desc()).limit(limit).all()
    
    return bpom, ocr