from google import genai
from google.genai import types
from app.core.config import settings
import json
import re
import base64
from io import BytesIO
from PIL import Image

class GeminiService:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            print("Warning: GEMINI_API_KEY not set")
            self.client = None
        else:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def analyze_nutrition_image(self, image_base64: str):
        if not self.client: return None

        try:
            if "," in image_base64: image_base64 = image_base64.split(",")[1]
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_bytes))

            prompt = """
            Analisis gambar label nutrisi/komposisi ini secara mendalam.
            
            Output WAJIB JSON valid (tanpa markdown):
            {
                "nutrition": {
                    "calories": "angka/0", "protein": "angka/0", "fat": "angka/0",
                    "sugar": "angka/0", "sodium": "angka/0", "carbs": "angka/0"
                },
                "micronutrients": ["Vitamin C: 10%", "Kalsium: 20%"], 
                "ingredients": "Daftar bahan utama...",
                "additives": ["Pengawet (E202)", "Pewarna (E102)"],
                "diet_tags": ["Halal?", "Vegan?", "Gluten-Free?"],
                "analysis": "Analisis kesehatan detail (maks 3 kalimat).",
                "health_score": 8,
                "warnings": ["Tinggi Gula", "Mengandung Pemanis Buatan"]
            }
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image]
            )
            text = self._clean_response(response.text)
            return json.loads(text)

        except Exception as e:
            print(f"Gemini Vision Error: {e}")
            return None

    async def chat_about_product(self, product_context: str, user_question: str):
        """Fitur Tanya Jawab tentang Produk"""
        if not self.client: return "Maaf, layanan AI sedang tidak tersedia."

        prompt = f"""
        Kamu adalah asisten ahli gizi LacakNutri.
        
        Konteks Produk (Hasil Scan):
        {product_context}
        
        Pertanyaan User: "{user_question}"
        
        Jawab dengan ramah, singkat, dan edukatif dalam Bahasa Indonesia.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            return "Maaf, saya tidak dapat menjawab saat ini."

    def _clean_response(self, text):
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r'^```(json)?|```$', '', text, flags=re.MULTILINE).strip()
        return text