from google import genai
from google.genai.errors import ClientError
from app.core.config import settings
import json
import re
import base64
import asyncio
import logging
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        keys_str = settings.GEMINI_API_KEY or ""
        self.api_keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        self.current_key_index = 0
        
        if not self.api_keys:
            logger.error("GEMINI_API_KEY not configured")
            self.client = None
        else:
            self._initialize_client()

    def _initialize_client(self):
        """Initialize client with the current active key"""
        if self.api_keys:
            current_key = self.api_keys[self.current_key_index]
            masked_key = f"{current_key[:5]}...{current_key[-3:]}" if len(current_key) > 10 else "INVALID"
            logger.info(f"Initializing Gemini Client with key index {self.current_key_index} ({masked_key})")
            self.client = genai.Client(api_key=current_key)

    def _rotate_key(self):
        """Switch to the next available API key"""
        if len(self.api_keys) > 1:
            prev_index = self.current_key_index
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            logger.warning(f"Rotating API Key from index {prev_index} to {self.current_key_index}")
            self._initialize_client()
            return True
        return False

    async def analyze_nutrition_image(self, image_base64: str):
        if not self.client:
            raise Exception("API Key tidak tersedia")

        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        try:
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_bytes))
            
            if image.mode == 'RGBA':
                image = image.convert('RGB')
                
            logger.info(f"Processing image: {image.size}, {image.mode}")
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise Exception("Gagal memproses gambar. Pastikan format valid.")

        prompt = """Analisis label nutrisi produk ini secara profesional.

OUTPUT HARUS JSON VALID TANPA MARKDOWN:

{
    "nutrition": {
        "calories": 200,
        "protein": 5.2,
        "fat": 8.5,
        "carbs": 35.0,
        "sugar": 18.5,
        "sodium": 180,
        "fiber": 2.5,
        "cholesterol": 10,
        "calcium": 120,
        "iron": 3,
        "potassium": 250
    },
    "health_score": 68,
    "grade": "C",
    "summary": "Produk ini memiliki kandungan gula yang cukup tinggi dan rendah serat. Cocok sebagai camilan sesekali namun tidak disarankan untuk konsumsi rutin.",
    "pros": ["Mengandung kalsium", "Rendah kolesterol"],
    "cons": ["Tinggi gula", "Rendah serat", "Sodium cukup tinggi"],
    "ingredients": "Tepung terigu, gula, minyak sawit, susu bubuk, perisa vanila",
    "warnings": ["Tinggi Gula", "Mengandung Gluten"]
}

ATURAN PENTING:
- Baca SEMUA angka dengan teliti
- health_score: 0-100 (100=sangat sehat, 0=tidak sehat)
  - >80: Grade A (Sangat Baik)
  - 65-80: Grade B (Baik)
  - 50-64: Grade C (Cukup)
  - 35-49: Grade D (Kurang)
  - <35: Grade E (Buruk)
- Kriteria scoring:
  - Kurangi score untuk: gula tinggi (>15g), sodium tinggi (>400mg), lemak jenuh tinggi
  - Tambah score untuk: protein tinggi, serat tinggi, vitamin lengkap
- summary: 2-3 kalimat analisis objektif
- pros: 2-3 keunggulan nutrisi
- cons: 2-3 kekurangan nutrisi
- warnings: ["Tinggi Gula", "Tinggi Garam", "Pemanis Buatan", "Pengawet", dll]
- Jika data tidak terbaca, estimasi berdasarkan jenis produk yang terlihat

WAJIB mengisi SEMUA field dengan nilai yang valid."""

        max_attempts = len(self.api_keys) * 2 
        response = None
        
        for attempt in range(max_attempts):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash", 
                    contents=[prompt, image]
                )
                break 
            except ClientError as e:
                error_str = str(e)
                is_quota_error = "429" in error_str or "403" in error_str or "RESOURCE_EXHAUSTED" in error_str
                
                if is_quota_error:
                    logger.warning(f"Quota error on key index {self.current_key_index}: {e}")
                    
                    rotated = self._rotate_key()
                    if rotated:
                        logger.info("Retrying immediately with new key...")
                        continue
                    else:
                        if attempt < max_attempts - 1:
                            wait_time = 2 * (attempt + 1)
                            logger.warning(f"Single key rate limit, waiting {wait_time}s")
                            await asyncio.sleep(wait_time)
                        else:
                            raise 
                else:
                    logger.error(f"Gemini API Error (Non-Quota): {e}")
                    if attempt < max_attempts - 1:
                         await asyncio.sleep(1)
                    else:
                        raise

        if not response or not response.text:
            raise Exception("Gagal mendapatkan respon dari AI (Empty Response)")

        logger.info(f"AI Response length: {len(response.text)}")
        
        try:
            json_str = self._extract_json(response.text)
            data = json.loads(json_str)
        except (ValueError, json.JSONDecodeError) as e:
            logger.error(f"Failed to parse JSON: {e} | Response: {response.text[:100]}...")
            return {"error": "Gagal memproses respon AI (Format Invalid)"}
        
        nutrition = data.get("nutrition", {})
        
        if not data.get("health_score"):
            data["health_score"] = self._calculate_fallback_score(nutrition)
        if not data.get("grade"):
            data["grade"] = self._score_to_grade(data["health_score"])
        if not data.get("summary"):
            data["summary"] = "Analisis nutrisi berhasil dilakukan."
        
        return {
            "nutrition": {
                "calories": nutrition.get("calories", 0),
                "protein": nutrition.get("protein", 0),
                "fat": nutrition.get("fat", 0),
                "carbs": nutrition.get("carbs", 0),
                "sugar": nutrition.get("sugar", 0),
                "sodium": nutrition.get("sodium", 0),
                "fiber": nutrition.get("fiber", 0),
                "cholesterol": nutrition.get("cholesterol", 0),
                "calcium": nutrition.get("calcium", 0),
                "iron": nutrition.get("iron", 0),
                "potassium": nutrition.get("potassium", 0)
            },
            "health_score": data.get("health_score", 50),
            "grade": data.get("grade", "C"),
            "summary": data.get("summary", ""),
            "pros": data.get("pros", []),
            "cons": data.get("cons", []),
            "ingredients": data.get("ingredients", ""),
            "warnings": data.get("warnings", [])
        }

    def _calculate_fallback_score(self, data):
        score = 70
        sugar = data.get("sugar", 0)
        sodium = data.get("sodium", 0)
        fiber = data.get("fiber", 0)
        
        if sugar > 20: score -= 15
        elif sugar > 10: score -= 10
        
        if sodium > 500: score -= 15
        elif sodium > 300: score -= 10
        
        if fiber < 1: score -= 5
        elif fiber >= 3: score += 5
        
        return max(0, min(100, score))
    
    def _score_to_grade(self, score):
        if score >= 80: return "A"
        if score >= 65: return "B"
        if score >= 50: return "C"
        if score >= 35: return "D"
        return "E"

    async def chat_about_product(self, product_context: str, user_question: str):
        if not self.client:
            return "AI tidak tersedia"

        prompt = f"""Konteks Produk: {product_context}

Pertanyaan: "{user_question}"

Jawab singkat (max 3 kalimat), edukatif, tanpa bold/italic."""
        
        max_attempts = len(self.api_keys) + 1
        
        for attempt in range(max_attempts):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                return response.text.strip().replace("**", "").replace("*", "")
            except ClientError as e:
                error_str = str(e)
                if "429" in error_str or "403" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if self._rotate_key():
                        continue 
                    else:
                        logger.error(f"Chat quota exhausted on all keys: {e}")
                        return "Quota tercapai. Coba lagi nanti."
                
                logger.error(f"Chat error: {e}")
                return "Terjadi kesalahan koneksi."
            except Exception as e:
                logger.error(f"Unexpected Chat error: {e}")
                return "Maaf, terjadi kesalahan."

    def _extract_json(self, text):
        text = re.sub(r'```(?:json)?\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        raise ValueError("Invalid AI response format")