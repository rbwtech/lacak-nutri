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
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY not configured")
            self.client = None
        else:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def analyze_nutrition_image(self, image_base64: str):
        if not self.client:
            raise Exception("API Key tidak tersedia")

        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_bytes))
        
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        logger.info(f"Processing image: {image.size}, {image.mode}")

        prompt = """Analisis label nutrisi produk ini secara profesional.

OUTPUT HARUS JSON VALID TANPA MARKDOWN:

{
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
    "potassium": 250,
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

        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[prompt, image]
                )
                break
            except ClientError as e:
                if e.status_code == 429 and attempt < max_retries - 1:
                    wait_time = 10 * (attempt + 1)
                    logger.warning(f"Rate limit, retry in {wait_time}s")
                    await asyncio.sleep(wait_time)
                else:
                    raise

        logger.info(f"AI Response length: {len(response.text)}")
        
        json_str = self._extract_json(response.text)
        data = json.loads(json_str)
        
        if not data.get("health_score"):
            data["health_score"] = self._calculate_fallback_score(data)
        if not data.get("grade"):
            data["grade"] = self._score_to_grade(data["health_score"])
        if not data.get("summary"):
            data["summary"] = "Analisis nutrisi berhasil dilakukan."
        
        return {
            "nutrition": {
                "calories": data.get("calories", 0),
                "protein": data.get("protein", 0),
                "fat": data.get("fat", 0),
                "carbs": data.get("carbs", 0),
                "sugar": data.get("sugar", 0),
                "sodium": data.get("sodium", 0),
                "fiber": data.get("fiber", 0),
                "cholesterol": data.get("cholesterol", 0),
                "calcium": data.get("calcium", 0),
                "iron": data.get("iron", 0),
                "potassium": data.get("potassium", 0)
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
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text.strip().replace("**", "").replace("*", "")
        except ClientError as e:
            if e.status_code == 429:
                return "Quota tercapai. Coba lagi nanti."
            logger.error(f"Chat error: {e}")
            return "Terjadi kesalahan koneksi."

    def _extract_json(self, text):
        text = re.sub(r'```(?:json)?\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        raise ValueError("Invalid AI response format")