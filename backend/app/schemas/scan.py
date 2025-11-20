from pydantic import BaseModel
from typing import Optional

class BPOMData(BaseModel):
    bpom_number: str
    product_name: str
    brand: Optional[str] = None
    manufacturer: Optional[str] = None
    address: Optional[str] = None
    issued_date: Optional[str] = None
    expired_date: Optional[str] = None
    composition: Optional[str] = None
    packaging: Optional[str] = None
    status: Optional[str] = None
    qr_code: Optional[str] = None

class ScanResponse(BaseModel):
    found: bool
    message: str
    data: Optional[BPOMData] = None