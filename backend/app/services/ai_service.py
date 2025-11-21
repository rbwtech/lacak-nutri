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

        prompt = """Kamu adalah ahli nutrisi profesional. Analisis label nutrisi pada gambar ini secara detail.

WAJIB output JSON valid tanpa markdown, tanpa backticks, tanpa teks apapun selain JSON:

{
    "calories": 150,
    "protein": 3.5,
    "fat": 2.0,
    "carbs": 28.0,
    "sugar": 15.0,
    "sodium": 120,
    "fiber": 1.5,
    "cholesterol": 5,
    "calcium": 80,
    "iron": 2,
    "potassium": 200,
    "health_score": 65,
    "grade": "B",
    "summary": "Produk ini mengandung karbohidrat tinggi dengan gula yang cukup signifikan. Protein dan serat rendah.",
    "pros": ["Rendah lemak", "Mengandung kalsium"],
    "cons": ["Tinggi gula", "Rendah protein"],
    "ingredients": "Tepung terigu, gula, susu skim, minyak nabati",
    "warnings": ["Tinggi Gula"]
}

PENTING:
- Baca semua angka nutrisi dengan teliti
- health_score: 0-100 (semakin tinggi semakin sehat)
- grade: A/B/C/D/E
- summary: 2-3 kalimat analisis objektif
- pros/cons: masing-masing 2-3 poin
- ingredients: list komposisi yang terbaca
- warnings: array peringatan (Tinggi Gula/Garam/Lemak, Pemanis Buatan, dll)
- Jika data tidak terbaca jelas, estimasi logis berdasarkan jenis produk"""

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

        logger.info(f"AI Response: {response.text[:200]}")
        
        json_str = self._extract_json(response.text)
        data = json.loads(json_str)
        
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
            "health_score": data.get("health_score", 0),
            "grade": data.get("grade", "?"),
            "summary": data.get("summary", ""),
            "pros": data.get("pros", []),
            "cons": data.get("cons", []),
            "ingredients": data.get("ingredients", ""),
            "warnings": data.get("warnings", [])
        }

    async def chat_about_product(self, product_context: str, user_question: str):
        if not self.client:
            return "AI tidak tersedia"

        prompt = f"""Kamu asisten nutrisi LacakNutri yang ramah.

Konteks Produk: {product_context}

User bertanya: "{user_question}"

Jawab singkat (max 3 kalimat), edukatif, tanpa bold/italic. Plain text."""
        
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