from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.bpom_endpoint import BPOMScraper
from app.services.ai_service import GeminiService
from app.schemas.scan import BPOMRequest, ScanResponse, AnalyzeImageRequest, ChatRequest
from app.dependencies import get_current_user_optional 
from app.crud import scan as crud_scan 

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
        crud_scan.create_bpom_history(db, cached_data, session_id, user_id)
        return {"found": True, "message": "Data ditemukan (Cache)", "data": cached_data}

    # 2. Scrape Live
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
    crud_scan.create_bpom_history(db, result, session_id, user_id)
    
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

    if not request.image_base64:
        return {"success": False, "message": "Gambar tidak ditemukan."}

    service = GeminiService()
    result = await service.analyze_nutrition_image(request.image_base64)
    
    if not result:
        return {"success": False, "message": "Gagal menganalisis gambar dengan AI."}
    
    # Simpan History OCR
    crud_scan.create_ocr_history(db, result, session_id, user_id)
        
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