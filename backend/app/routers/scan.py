from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.bpom_endpoint import BPOMScraper
from app.schemas.scan import BPOMRequest, BPOMResponse

router = APIRouter(prefix="/api/scan", tags=["Scan"])

@router.post("/bpom", response_model=BPOMResponse)
async def scan_bpom(request: BPOMRequest):
    scraper = BPOMScraper()
    
    # 1. Cari data ke BPOM
    result = await scraper.search_bpom(request.bpom_number)
    
    if not result:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan di database BPOM")
    
    # 2. (TODO) Simpan ke Database History di sini (user_id optional)
    
    return result