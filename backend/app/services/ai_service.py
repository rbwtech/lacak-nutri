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
        """Menganalisis GAMBAR Label Nutrisi langsung dengan Gemini Vision"""
        
        if not self.client:
            return None

        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_bytes))

            prompt = """
            Kamu adalah ahli gizi. Analisis gambar label nilai gizi ini.
            Tugasmu:
            1. Baca tabel 'Informasi Nilai Gizi' atau 'Nutrition Facts' pada gambar.
            2. Ekstrak angka untuk: Energi/Kalori, Protein, Lemak Total, Gula, Garam/Natrium.
            3. Baca Komposisi/Ingredients jika terlihat.
            4. Berikan skor kesehatan (1-10) berdasarkan kandungan gula, garam, dan lemak.

            Output JSON (Strict):
            {
                "nutrition": {
                    "calories": "angka/0",
                    "protein": "angka/0",
                    "fat": "angka/0",
                    "sugar": "angka/0",
                    "sodium": "angka/0"
                },
                "ingredients": "Daftar bahan utama (string)",
                "analysis": "Analisis singkat maksimal 2 kalimat.",
                "health_score": 8
            }
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image]
            )
            
            text = response.text.strip()
            if text.startswith("```"):
                text = re.sub(r'^```(json)?|```$', '', text, flags=re.MULTILINE).strip()
            
            return json.loads(text)

        except Exception as e:
            print(f"Gemini Vision Error: {e}")
            return None