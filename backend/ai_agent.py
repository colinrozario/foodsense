import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

generation_config = {
  "temperature": 0.4,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 1024,
  "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
)

SAFE_PROMPT = """
You are a food safety expert assistant. Analyze the provided product information (ingredients, name, or image).
Your goal is to provide a simple, plain English verdict for a consumer.

Return ONLY a valid JSON object with this structure:
{
  "verdict": "SAFE" | "CAUTION" | "AVOID",
  "explanation": "A short, simple sentence explaining why (e.g., 'Contains high sugar and artificial colors').",
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "ingredients_analysis": [
    {"name": "ingredient_name", "status": "SAFE" | "RISKY", "reason": "brief reason"}
  ],
  "nutritional_highlights": {
     "sugar": "LOW" | "MODERATE" | "HIGH",
     "sodium": "LOW" | "MODERATE" | "HIGH",
     "processing": "NOVA1" | "NOVA4" 
  }
}

Rules based on 'Clean Health':
- High Sugar (>20g/100g) -> CAUTION or AVOID.
- Artificial Colors (Red 40, Yellow 5, etc.) -> CAUTION.
- Dangerous Preservatives (Nitrates, BHA/BHT) -> AVOID.
- Whole foods -> SAFE.

If the image or text is not a food product, set verdict to "UNKNOWN" and explanation to "I couldn't identify this as a food product."
"""

def analyze_text(text: str):
    try:
        chat_session = model.start_chat(history=[
            {"role": "user", "parts": [SAFE_PROMPT]}
        ])
        response = chat_session.send_message(f"Analyze this product properties/ingredients: {text}")
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing text: {e}")
        return {"verdict": "ERROR", "explanation": "Failed to analyze product."}

def analyze_image(image_bytes: bytes, mime_type: str = "image/jpeg"):
    try:
        # Create the image part
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        response = model.generate_content([SAFE_PROMPT, image_part, "Analyze this food label."])
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {"verdict": "ERROR", "explanation": "Failed to analyze image."}
