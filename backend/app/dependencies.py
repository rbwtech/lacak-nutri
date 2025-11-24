from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from typing import Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.models.user import User 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None: return None
        
        user = crud_user.get_user_by_email(db, email=email)
        return user
    except JWTError:
        return None
    
async def verify_recaptcha_v3(
    recaptcha_token: str = Header(..., alias="X-Recaptcha-Token")
):
    if not settings.RECAPTCHA_SECRET_KEY:
        return True # Skip if debug/no key

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": settings.RECAPTCHA_SECRET_KEY,
                "response": recaptcha_token
            }
        )
        result = response.json()

        if not result.get("success") or result.get("score", 0) < 0.5:
            print(f"Bot detected! Score: {result.get('score')}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Aktivitas mencurigakan terdeteksi. Akses ditolak."
            )
            
    return True