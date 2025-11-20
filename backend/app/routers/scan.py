from fastapi import APIRouter
from app.services.bpom_endpoint import BPOMScraper
from app.services.ai_service import GeminiService
from app.schemas.scan import BPOMRequest, ScanResponse, AnalyzeImageRequest, ChatRequest

router = APIRouter(prefix="/api/scan", tags=["Scan"])

@router.post("/analyze")
async def analyze_ocr(request: AnalyzeImageRequest):
    if not request.image_base64:
        return {"success": False, "message": "Gambar tidak ditemukan."}

    service = GeminiService()
    result = await service.analyze_nutrition_image(request.image_base64)
    
    if not result:
        return {"success": False, "message": "Gagal menganalisis gambar dengan AI."}
        
    return {"success": True, "data": result}

@router.post("/chat")
async def chat_product(request: ChatRequest):
    service = GeminiService()
    answer = await service.chat_about_product(request.product_context, request.question)
    return {"answer": answer}

@router.post("/bpom", response_model=ScanResponse)
async def scan_bpom(request: BPOMRequest):
    scraper = BPOMScraper()
    result = await scraper.search_bpom(request.bpom_number)
    
    if not result:
        return {
            "found": False,
            "message": f"Produk dengan kode {request.bpom_number} tidak ditemukan.",
            "data": None
        }
    
    return {"found": True, "message": "Data ditemukan", "data": result}