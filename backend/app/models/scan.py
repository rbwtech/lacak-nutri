from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, SmallInteger, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ScanHistoryBPOM(Base):
    __tablename__ = "scan_history_bpom"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    bpom_number = Column(String(50), nullable=False, index=True)
    product_name = Column(String(255), nullable=True)
    brand = Column(String(255), nullable=True)
    manufacturer = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)
    raw_response = Column(JSON, nullable=True)
    is_favorited = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScanHistoryOCR(Base):
    __tablename__ = "scan_history_ocr"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    product_name = Column(String(255), nullable=True)
    image_data = Column(Text, nullable=True)
    ocr_raw_data = Column(JSON, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    health_score = Column(SmallInteger, nullable=True)
    grade = Column(String(2), nullable=True)
    is_favorited = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BPOMCache(Base):
    __tablename__ = "bpom_cache"

    id = Column(Integer, primary_key=True, index=True)
    bpom_number = Column(String(50), unique=True, nullable=False, index=True)
    data = Column(JSON, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())