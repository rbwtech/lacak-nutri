from sqlalchemy.orm import Session
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR, BPOMCache
from datetime import datetime, timedelta
import json

# --- BPOM CACHE ---
def get_bpom_cache(db: Session, bpom_number: str):
    """Ambil cache jika ada dan belum expired (30 hari)"""
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

# --- HISTORY ---
def create_bpom_history(db: Session, data: dict, session_id: str, user_id: int = None):
    history = ScanHistoryBPOM(
        user_id=user_id,
        session_id=session_id,
        bpom_number=data.get('bpom_number', ''),
        product_name=data.get('product_name', ''),
        brand=data.get('brand', ''),
        manufacturer=data.get('manufacturer', ''), 
        status=data.get('status', ''),
        raw_response=data
    )
    db.add(history)
    db.commit()
    return history

def create_ocr_history(db: Session, result: dict, session_id: str, user_id: int = None):
    analysis_data = result.get('analysis', {})
    
    if isinstance(analysis_data, dict):
        analysis_string = json.dumps(analysis_data)
    else:
        analysis_string = str(analysis_data)

    health_score = analysis_data.get('health_score', 0) if isinstance(analysis_data, dict) else 0

    history = ScanHistoryOCR(
        user_id=user_id,
        session_id=session_id,
        ocr_raw_data=result.get('nutrition'),
        ai_analysis=analysis_string,          
        health_score=health_score
    )
    db.add(history)
    db.commit()
    return history