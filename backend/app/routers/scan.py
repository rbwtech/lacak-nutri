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

    # 1. Cek Cache
    cached_data = crud_scan.get_bpom_cache(db, request.bpom_number)
    if cached_data:
        history = crud_scan.create_bpom_history(db, user_id, cached_data, session_id)
        
        response_data = cached_data.copy()
        response_data['id'] = history.id 
        
        return {"found": True, "message": "Data ditemukan (Cache)", "data": response_data}

    # 2. Scrape BPOM
    scraper = BPOMScraper()
    result = await scraper.search_bpom(request.bpom_number)
    
    if not result:
        return {
            "found": False,
            "message": f"Produk dengan kode {request.bpom_number} tidak ditemukan.",
            "data": None
        }
    
    # 3. Simpan Cache & History
    crud_scan.create_bpom_cache(db, request.bpom_number, result)
    history = crud_scan.create_bpom_history(db, user_id, result, session_id)
    
    # Inject ID ke dalam dictionary result
    result['id'] = history.id 
    
    return {"found": True, "message": "Data ditemukan", "data": result}

@router.post("/analyze")
async def analyze_ocr(
    request: AnalyzeImageRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    x_session_id: Optional[str] = Header(None)
):
    session_id = x_session_id or "guest"
    user_id = current_user.id if current_user else None

    service = GeminiService()
    result = await service.analyze_nutrition_image(request.image_base64)

    nutrition_data = result.get('nutrition')
    ai_analysis = result.get('summary')
    product_name = request.product_name
    image_data = request.image_base64
    pros=result.get('pros')
    cons=result.get('cons')
    ingredients=result.get('ingredients')
    warnings=result.get('warnings');
    health_score = result.get('health_score')
    grade = result.get('grade')
    ocr_data_str = json.dumps(nutrition_data)

    history = crud_scan.create_ocr_history(
        db=db, 
        user_id=user_id,
        product_name=product_name,
        image_data=image_data,
        pros=pros,
        cons=cons,
        ingredients=ingredients,
        warnings=warnings,
        health_score=health_score,
        grade=grade, 
        ocr_data=ocr_data_str, 
        ai_analysis=ai_analysis,
        session_id=session_id 
    )
    
    # Inject ID ke dalam data result
    result['id'] = history.id
        
    return {"success": True, "data": result}

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
            "product_name": scan.product_name,
            "image_data": scan.image_data,  
            "ocr_raw_data": scan.ocr_raw_data,
            "ai_analysis": scan.ai_analysis,
            "pros": scan.pros,
            "cons": scan.cons,
            "ingredients": scan.ingredients,
            "warnings": scan.warnings,
            "health_score": scan.health_score,
            "grade": scan.grade,  
            "is_favorited": scan.is_favorited,
            "created_at": scan.created_at.isoformat()
        }
    }