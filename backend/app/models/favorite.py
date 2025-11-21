from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_type = Column(Enum('bpom', 'nutrition'), nullable=False)
    bpom_number = Column(String(100))
    product_name = Column(String(255), nullable=False)
    product_data = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())