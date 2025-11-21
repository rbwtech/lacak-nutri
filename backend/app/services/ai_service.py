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

            # Prompt "Wah"
            prompt = """
            Berperanlah sebagai ahli gizi. Analisis gambar produk ini.
            
            Output WAJIB JSON valid saja. Jangan ada teks lain.
            Struktur JSON:
            {
                "nutrition": {
                    "calories": 0, "protein": 0, "fat": 0, "carbs": 0, "sugar": 0, "sodium": 0
                },
                "analysis": {
                    "health_score": 85, 
                    "grade": "B", 
                    "summary": "Ringkasan analisis 2 kalimat yang menarik dan edukatif.",
                    "pros": ["Poin positif 1", "Poin positif 2"], 
                    "cons": ["Poin negatif 1", "Poin negatif 2"],
                    "ingredients": "Daftar bahan utama..."
                },
                "warnings": ["Tinggi Gula", "Pemanis Buatan"]
            }
            Jika data tidak terbaca, estimasi berdasarkan jenis produk.
            """
            response = self.client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=[prompt, image]
            )
            
            json_str = self._extract_json(response.text)
            return json.loads(json_str)

        except Exception as e:
            print(f"Gemini Error: {e}")
            return {
                "nutrition": {"calories": 0},
                "analysis": {
                    "health_score": 0, "grade": "?", 
                    "summary": "Gagal memproses. Coba foto lebih jelas atau cek koneksi.",
                    "pros": [], "cons": []
                },
                "warnings": []
            }

    async def chat_about_product(self, product_context: str, user_question: str):
        if not self.client: return "Maaf, layanan AI sedang tidak tersedia."

        prompt = f"""
        Kamu asisten gizi LacakNutri.
        Data Produk: {product_context}
        User: "{user_question}"
        
        Jawab singkat (max 3 kalimat), ramah, edukatif.
        PENTING: Jangan gunakan format bold (**) atau italic (*). Plain text saja.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return self._clean_chat_output(response.text)
        except Exception as e:
            if "429" in str(e): return "Limit AI tercapai. Tunggu sebentar."
            return "Maaf, terjadi kesalahan koneksi AI."

    def _extract_json(self, text):
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return match.group(0)
        return "{}"

    def _clean_chat_output(self, text):
        text = text.strip()
        text = text.replace("**", "").replace("*", "").replace("__", "")
        return text