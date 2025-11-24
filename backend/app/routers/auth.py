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
    """Mengirim email reset password dengan template HTML profesional."""
    
    subject = "Reset Password - LacakNutri"
    
    logo_url = f"{settings.FRONTEND_BASE_URL}/lacaknutri.png" 
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Reset CSS dasar untuk email */
            body {{ margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }}
            .header {{ background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%); padding: 40px 20px; text-align: center; }}
            .logo {{ width: 80px; height: 80px; background-color: white; border-radius: 50%; padding: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); object-fit: contain; }}
            .content {{ padding: 40px 30px; color: #334155; text-align: center; }}
            .h1 {{ font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }}
            .text {{ font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px; }}
            .button {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%); color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 94, 98, 0.4); transition: all 0.3s ease; }}
            .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
            .link {{ color: #FF9966; word-break: break-all; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="{logo_url}" alt="LacakNutri Logo" class="logo">
            </div>
            
            <div class="content">
                <div class="h1">Lupa Kata Sandi?</div>
                <p class="text">
                    Jangan khawatir, kami menerima permintaan untuk mereset kata sandi akun <strong>LacakNutri</strong> Anda.
                    Klik tombol di bawah ini untuk membuat kata sandi baru.
                </p>
                
                <a href="{reset_link}" class="button">
                    Reset Kata Sandi Saya
                </a>
                
                <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
                    Tautan ini hanya berlaku selama <strong>30 menit</strong>.
                </p>
                
                <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">Atau salin tautan ini ke browser Anda:</p>
                    <a href="{reset_link}" class="link" style="font-size: 12px;">{reset_link}</a>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; {datetime.now().year} LacakNutri by Trio WakwaW. All rights reserved.</p>
                <p>Email ini dikirim secara otomatis, mohon jangan dibalas.</p>
            </div>
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