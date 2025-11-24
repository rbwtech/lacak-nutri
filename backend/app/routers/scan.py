from fastapi import APIRouter, HTTPException, Depends, Header, status
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
from datetime import date

router = APIRouter(prefix="/api/scan", tags=["Scan"])

MAX_FREE_OCR_SCANS_PER_DAY = 10

@router.post("/bpom", response_model=ScanResponse)
async def scan_bpom(
    request: BPOMRequest, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
    x_session_id: Optional[str] = Header(None)
):
    session_id = x_session_id or "guest"
    user_id = current_user.id if current_user else None

    # Cek Cache
    cached_data = crud_scan.get_bpom_cache(db, request.bpom_number)
    if cached_data:
        history = crud_scan.create_bpom_history(db, user_id, cached_data, session_id)
        response_data = cached_data.copy()
        response_data['id'] = history.id 
        return {"found": True, "message": "Data ditemukan (Cache)", "data": response_data}

    try:
        scraper = BPOMScraper()
        result = await scraper.search_bpom(request.bpom_number)
    except Exception as e:
        return {
            "found": False,
            "message": f"Gagal terhubung ke server BPOM atau waktu habis. Silakan coba lagi.",
            "data": None
        }
    
    if not result:
        return {
            "found": False,
            "message": f"Produk dengan kode {request.bpom_number} tidak ditemukan.",
            "data": None
        }
    
    crud_scan.create_bpom_cache(db, request.bpom_number, result)
    history = crud_scan.create_bpom_history(db, user_id, result, session_id)
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

    if not (current_user and getattr(current_user, 'role', '') == 'admin'):
        scan_count_today = crud_scan.get_daily_ocr_scans_count(db, user_id, session_id)
        
        if scan_count_today >= MAX_FREE_OCR_SCANS_PER_DAY:
            limit = MAX_FREE_OCR_SCANS_PER_DAY
            detail_msg = f"Batas harian {limit}x Analisis AI tercapai."
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=detail_msg
            )
    
    try:
        service = GeminiService()
        language_from_request = getattr(request, 'language', None)
        if current_user and getattr(current_user, 'locale', None):
            language = current_user.locale.split('-')[0].lower()
        elif language_from_request:
            language = language_from_request
        else:
            language = 'id'
            
        result = await service.analyze_nutrition_image(request.image_base64, language=language)
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

    user_allergies = []
    if current_user:
        user_allergies = [allergy.name.lower() for allergy in current_user.allergies]
    
    ingredients = result.get('ingredients') or ""
    ingredients_text = ingredients.lower()
    detected_allergens = [
        allergy.capitalize() 
        for allergy in user_allergies 
        if allergy in ingredients_text
    ]

    nutrition_data = result.get('nutrition')
    ai_analysis = result.get('summary')
    product_name = request.product_name
    image_data = request.image_base64
    pros = result.get('pros')
    cons = result.get('cons')
    warnings = detected_allergens
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
    
    result['id'] = history.id
    result['warnings'] = warnings
        
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
    try:
        if not request.question or not request.question.strip():
            return {"answer": "Silakan ajukan pertanyaan."}

        context = request.product_context
        if not context or context == "null" or context == "{}":
             return {"answer": "Maaf, saya tidak memiliki data produk yang cukup untuk menjawab pertanyaan ini. Silakan scan ulang produk."}

        service = GeminiService()
        language = getattr(request, 'language', 'id')
        
        answer = await service.chat_about_product(
            context, 
            request.question, 
            language=language
        ) 

        if answer.startswith("Quota") or answer.startswith("Terjadi kesalahan") or answer.startswith("Maaf, terjadi kesalahan tak terduga"):
            return {"answer": answer} 

        return {"answer": answer}
        
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return {"answer": f"Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Coba lagi. (Detail Server: {type(e).__name__})"}

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