from fastapi import APIRouter, Depends
from app.services.bpom_endpoint import BPOMScraper
from app.schemas.scan import BPOMRequest, ScanResponse

router = APIRouter(prefix="/api/scan", tags=["Scan"])

@router.post("/bpom", response_model=ScanResponse)
async def scan_bpom(request: BPOMRequest):
    scraper = BPOMScraper()
    
    result = await scraper.search_bpom(request.bpom_number)
    
    if not result:
        return {
            "found": False,
            "message": f"Produk dengan kode {request.bpom_number} tidak ditemukan di database BPOM.",
            "data": None
        }
    
    return {
        "found": True,
        "message": "Data ditemukan",
        "data": result
    }