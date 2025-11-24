from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import user as crud_user
from app.schemas import user as schemas
from app.core.security import verify_password, create_access_token, decode_token
from app.dependencies import get_current_user
from app.models.user import User
import httpx
from app.core.config import settings
from app.schemas.user import ForgotPasswordRequest, PasswordReset
from datetime import timedelta, datetime, timezone
import subprocess
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

async def verify_recaptcha(token: str):
    """Verifies the reCAPTCHA token against Google's API."""
    if not settings.RECAPTCHA_SECRET_KEY:
        return True
        
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": settings.RECAPTCHA_SECRET_KEY,
                "response": token
            }
        )
        response.raise_for_status()
        result = response.json()
        
        if not result.get("success") or result.get("score", 1.0) < 0.5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Verifikasi reCAPTCHA gagal. Harap coba lagi."
            )
        return True

def create_reset_token(email: str):
    """Creates a short-lived JWT (30 min) for password reset."""
    expire_minutes = 30
    to_encode = {"sub": email, "type": "reset"} 
    return create_access_token(to_encode, expires_delta=timedelta(minutes=expire_minutes))

def send_reset_email(recipient_email: str, reset_link: str):
    """Sends email via SMTP (Brevo) securely."""
    
    subject = "LacakNutri: Reset Kata Sandi Anda"
    
    # Template HTML
    body_html = f"""
    <html>
    <head>
        <style>
            .button {{
                display: inline-block;
                padding: 10px 20px;
                background-color: #FF9966;
                color: white !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
            }}
        </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #FF9966;">Permintaan Reset Password</h2>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun LacakNutri Anda.</p>
            <p style="margin: 25px 0;">
                <a href="{reset_link}" class="button">
                    Reset Kata Sandi Sekarang
                </a>
            </p>
            <p>Atau salin tautan ini ke browser Anda:</p>
            <p style="font-size: 12px; color: #666;">{reset_link}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><small>Tautan ini berlaku selama 30 menit. Jika Anda tidak merasa meminta reset password, abaikan email ini.</small></p>
        </div>
    </body>
    </html>
    """

    # Setup Email Message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.EMAIL_SENDER_NAME, settings.EMAIL_SENDER_ADDRESS))
    msg["To"] = recipient_email

    # Attach HTML body
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        # Koneksi ke SMTP Server Brevo
        print(f"Connecting to SMTP: {settings.SMTP_SERVER}:{settings.SMTP_PORT}...")
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls() 
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(
                settings.EMAIL_SENDER_ADDRESS, 
                recipient_email, 
                msg.as_string()
            )
        print(f"SUCCESS: Reset email sent to {recipient_email}")
        
    except smtplib.SMTPAuthenticationError:
        print("ERROR: SMTP Authentication failed. Check username/password.")
    except Exception as e:
        print(f"ERROR: Failed to send email via SMTP: {e}")

@router.post("/register", response_model=schemas.Token)
async def register(user_in: schemas.UserRegisterRequest, db: Session = Depends(get_db)): 
    await verify_recaptcha(user_in.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar.")

    user_create_data = schemas.UserCreate(
        email=user_in.email,
        name=user_in.name,
        password=user_in.password
    )
    
    new_user = crud_user.create_user(db, user=user_create_data)
    
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
async def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    await verify_recaptcha(user_in.recaptcha_token)

    user = crud_user.get_user_by_email(db, email=user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/forgot-password-request")
async def forgot_password_request(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    await verify_recaptcha(request.recaptcha_token)
    
    user = crud_user.get_user_by_email(db, email=request.email)
    
    if user:
        reset_token = create_reset_token(user.email)
        reset_link = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"
        send_reset_email(user.email, reset_link)

    return {"message": "Jika email terdaftar, instruksi reset password telah dikirim."}

@router.post("/reset-password")
async def reset_password(
    pass_data: PasswordReset,
    db: Session = Depends(get_db)
):
    try:
        payload = decode_token(pass_data.token) 
        token_type = payload.get("type")
        email = payload.get("sub")
        
        if token_type != "reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tautan reset tidak valid.")
            
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tautan reset tidak valid atau sudah kedaluwarsa.")
        
    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")
    
    if len(pass_data.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password baru minimal 8 karakter.")
        
    crud_user.update_password(db, db_user=user, new_password=pass_data.new_password)
    
    return {"message": "Kata sandi berhasil diatur ulang."}

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_user = crud_user.update_user(db, db_user=current_user, user_update=user_update)
    return updated_user

@router.post("/change-password")
def change_password(
    pass_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pass_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Password lama salah.")
    
    crud_user.update_password(db, db_user=current_user, new_password=pass_data.new_password)
    return {"message": "Password berhasil diubah"}