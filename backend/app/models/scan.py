from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, JSON, SmallInteger
from app.core.database import Base

class ScanHistoryBPOM(Base):
    __tablename__ = "scan_history_bpom"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=False, index=True)
    bpom_number = Column(String(50), nullable=False, index=True)
    product_name = Column(String(255))
    brand = Column(String(255))
    manufacturer = Column(String(255))
    status = Column(String(50))
    raw_response = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScanHistoryOCR(Base):
    __tablename__ = "scan_history_ocr"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    ocr_raw_data = Column(JSON) 
    ai_analysis = Column(Text)
    health_score = Column(SmallInteger)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BPOMCache(Base):
    __tablename__ = "bpom_cache"

    id = Column(Integer, primary_key=True, index=True)
    bpom_number = Column(String(50), unique=True, nullable=False, index=True)
    data = Column(JSON, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())