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
            Berperanlah sebagai ahli gizi profesional dan ramah. Analisis gambar ini (Label Gizi/Komposisi/Fisik Produk).
            
            Ekstrak data dan berikan penilaian kesehatan dalam format JSON valid (tanpa markdown).
            
            Struktur JSON Wajib:
            {
                "nutrition": {
                    "calories": 0, "protein": 0, "fat": 0, "carbs": 0, "sugar": 0, "sodium": 0, "fiber": 0
                },
                "analysis": {
                    "health_score": 0, // Skala 0-100 (100=Sangat Sehat/Alami)
                    "grade": "C", // Grade: A (Sangat Sehat), B (Baik), C (Cukup), D (Kurang), E (Hindari)
                    "summary": "Ringkasan analisis 2 kalimat yang edukatif dan mudah dipahami.",
                    "pros": ["Poin positif 1", "Poin positif 2"], // Maksimal 2 poin singkat
                    "cons": ["Poin negatif 1", "Poin negatif 2"], // Maksimal 2 poin singkat
                    "ingredients": "Daftar bahan utama yang terdeteksi..."
                },
                "warnings": ["Peringatan Alergen/Bahan"] // Contoh: "Tinggi Gula", "Mengandung Pemanis Buatan"
            }
            
            Jika angka nutrisi tidak terlihat, estimasi berdasarkan jenis produk (misal: "Keripik Kentang" biasanya tinggi lemak/garam).
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image]
            )
            text = self._clean_response(response.text)
            return json.loads(text)

        except Exception as e:
            print(f"Gemini Vision Error: {e}")
            return {
                "nutrition": {"calories": 0},
                "analysis": {
                    "health_score": 0, "grade": "?", 
                    "summary": "Gagal menganalisis gambar. Pastikan koneksi internet lancar atau gambar jelas.",
                    "pros": [], "cons": []
                },
                "error": str(e)
            }

    async def chat_about_product(self, product_context: str, user_question: str):
        """Fitur Tanya Jawab tentang Produk"""
        if not self.client: return "Maaf, layanan AI sedang tidak tersedia."

        prompt = f"""
        Kamu adalah asisten gizi LacakNutri.
        Konteks Produk: {product_context}
        Pertanyaan: "{user_question}"
        
        Instruksi:
        1. Jawab singkat (maks 3 kalimat) dan ramah dalam Bahasa Indonesia.
        2. JANGAN gunakan format markdown (seperti **teks** atau *teks*). Gunakan teks biasa saja.
        3. Fokus pada fakta kesehatan.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return self._clean_chat_output(response.text)
        except Exception as e:
            print(f"AI Chat Error: {e}")
            if "429" in str(e):
                return "Limit penggunaan AI tercapai. Mohon tunggu 1 menit sebelum bertanya lagi."
            return "Maaf, saya sedang mengalami gangguan koneksi."

    def _clean_response(self, text):
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r'^```(json)?|```$', '', text, flags=re.MULTILINE).strip()
        return text

    def _clean_chat_output(self, text):
        text = text.strip()
        text = text.replace("**", "").replace("*", "").replace("__", "")
        return text