from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import OwnerAuthorizationCode, User
import secrets

OWNER_ID = 26
OWNER_PHONE = "6285182381003"
OWNER_EMAIL = "lacaknutri@rbwtech.io" 

def get_owner_user(db: Session) -> User | None:
    return db.query(User).filter(User.id == OWNER_ID).first()

def create_authorization_code(db: Session, lifetime_minutes: int = 120) -> str:
    db.query(OwnerAuthorizationCode).filter(
        OwnerAuthorizationCode.user_id == OWNER_ID,
        OwnerAuthorizationCode.expires_at < datetime.now()
    ).delete()
    
    code = secrets.token_hex(4).upper() # Menghasilkan 8 karakter hex
    expires_at = datetime.now() + timedelta(minutes=lifetime_minutes)
    
    db_code = OwnerAuthorizationCode(
        user_id=OWNER_ID,
        code=code,
        expires_at=expires_at
    )
    db.add(db_code)
    db.commit()
    db.refresh(db_code)
    return code

def verify_authorization_code(db: Session, user_id: int, code: str) -> bool:
    if user_id != OWNER_ID:
        return False
        
    db_code = db.query(OwnerAuthorizationCode).filter(
        OwnerAuthorizationCode.user_id == user_id,
        OwnerAuthorizationCode.code == code.upper(),
        OwnerAuthorizationCode.is_used == False
    ).first()
    
    if not db_code:
        return False
        
    if db_code.expires_at < datetime.now():
        db_code.is_used = True
        db.commit()
        return False 

    db_code.is_used = True
    db.commit()
    return True