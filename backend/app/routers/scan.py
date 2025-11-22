from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.bpom_endpoint import BPOMScraper
from app.services.ai_service import GeminiService
from app.schemas.scan import BPOMRequest, ScanResponse, AnalyzeImageRequest, ChatRequest
from app.dependencies import get_current_user_optional, get_current_user
from app.crud import scan as crud_scan 
from app.models.scan import ScanHistoryBPOM, ScanHistoryOCR
from app.models.user import User
import json

router = APIRouter(prefix="/api/scan", tags=["Scan"])

@router.post("/bpom", response_model=ScanResponse)
async def scan_bpom(
    request: BPOMRequest, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    x_session_id: Optional[str] = Header(None)
):
    session_id = x_session_id or "guest"
    user_id = current_user.id if current_user else None

    cached_data = crud_scan.get_bpom_cache(db, request.bpom_number)
    if cached_data:
        scan_record = crud_scan.create_bpom_history(db, user_id, cached_data, session_id)
        return {
            "found": True, 
            "message": "Data ditemukan (Cache)", 
            "data": cached_data,
            "scan_id": scan_record.id if scan_record else None
        }
    
    scraper = BPOMScraper()
    result = await scraper.search_bpom(request.bpom_number)
    
    if not result:
        return {
            "found": False,
            "message": f"Produk dengan kode {request.bpom_number} tidak ditemukan.",
            "data": None,
            "scan_id": None
        }
    
    crud_scan.create_bpom_cache(db, request.bpom_number, result)
    scan_record = crud_scan.create_bpom_history(db, user_id, result, session_id)
    
    return {
        "found": True, 
        "message": "Data ditemukan", 
        "data": result,
        "scan_id": scan_record.id if scan_record else None
    }

@router.post("/analyze")
async def analyze_ocr(
    request: AnalyzeImageRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    x_session_id: Optional[str] = Header(None)
):
    session_id = x_session_id or "guest"
    user_id = current_user.id if current_user else None

    if not request.image_base64:
        return {"success": False, "message": "Gambar tidak ditemukan."}

    service = GeminiService()
    result = await service.analyze_nutrition_image(request.image_base64)
    
    nutrition_data = result.get('nutrition')
    ai_analysis = result.get('summary')
    health_score = result.get('health_score')
    
    ocr_data_str = json.dumps(nutrition_data)

    scan_record = crud_scan.create_ocr_history(
        db=db, 
        user_id=user_id, 
        health_score=health_score, 
        ocr_data=ocr_data_str, 
        ai_analysis=ai_analysis,
        session_id=session_id 
    )
        
    return {
        "success": True, 
        "data": result,
        "scan_id": scan_record.id if scan_record else None
    }

@router.post("/ocr-text")
async def extract_text_only(
    request: AnalyzeImageRequest,
    current_user = Depends(get_current_user_optional)
):
    try:
        import pytesseract
        from PIL import Image
        import base64
        from io import BytesIO
        
        if "," in request.image_base64:
            img_data = request.image_base64.split(",")[1]
        else:
            img_data = request.image_base64
        
        image_bytes = base64.b64decode(img_data)
        image = Image.open(BytesIO(image_bytes))
        
        text = pytesseract.image_to_string(image, lang='ind+eng')
        
        return {"success": True, "text": text.strip()}
    except Exception as e:
        return {"success": False, "text": ""}

@router.post("/chat")
async def chat_product(request: ChatRequest):
    service = GeminiService()
    answer = await service.chat_about_product(request.product_context, request.question)
    return {"answer": answer}

@router.get("/bpom/{scan_id}")
def get_bpom_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(ScanHistoryBPOM).filter(
        ScanHistoryBPOM.id == scan_id,
        ScanHistoryBPOM.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan history tidak ditemukan")
    
    return {
        "success": True,
        "data": {
            "id": scan.id,
            "type": "bpom",
            "bpom_number": scan.bpom_number,
            "product_name": scan.product_name,
            "brand": scan.brand,
            "manufacturer": scan.manufacturer,
            "status": scan.status,
            "raw_response": scan.raw_response,
            "is_favorited": scan.is_favorited,
            "created_at": scan.created_at.isoformat()
        }
    }

@router.get("/ocr/{scan_id}")
def get_ocr_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(ScanHistoryOCR).filter(
        ScanHistoryOCR.id == scan_id,
        ScanHistoryOCR.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan history tidak ditemukan")
    
    return {
        "success": True,
        "data": {
            "id": scan.id,
            "type": "ocr",
            "image_url": scan.image_url,
            "ocr_raw_data": scan.ocr_raw_data,
            "ai_analysis": scan.ai_analysis,
            "health_score": scan.health_score,
            "is_favorited": scan.is_favorited,
            "created_at": scan.created_at.isoformat()
        }
    }