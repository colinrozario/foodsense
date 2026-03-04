import os
import easyocr
from typing import Dict, Any

print("Initializing local OCR model (EasyOCR). This might take a moment if it's downloading models...")
# Initialize EasyOCR reader for English. Set GPU to False to ensure compatibility everywhere.
reader = easyocr.Reader(['en'], gpu=False)

def analyze_text(text: str) -> Dict[str, Any]:
    if not text:
        return {"verdict": "UNKNOWN", "explanation": "No ingredients text provided for analysis."}
        
    text_lower = text.lower()
    
    # Rule-based logic engine
    risks = []
    
    # 1. Artificial Colors
    colors = ["red 40", "yellow 5", "yellow 6", "blue 1", "artificial color", "caramel color"]
    for c in colors:
        if c in text_lower:
            risks.append({"name": c.title(), "status": "CAUTION", "reason": "Artificial color, may cause sensitivities."})
            
    # 2. Preservatives & Additives
    preservatives = ["bha", "bht", "nitrate", "nitrite", "sodium benzoate", "potassium sorbate", "msg", "monosodium glutamate", "tbhq"]
    for p in preservatives:
        if p in text_lower:
            status = "AVOID" if p in ["bha", "bht", "nitrate", "nitrite", "tbhq"] else "CAUTION"
            risks.append({"name": p.title(), "status": status, "reason": "Chemical preservative or additive."})
            
    # 3. Hidden Sugars
    sugars = ["high fructose corn syrup", "corn syrup", "dextrose", "maltodextrin", "sucrose", "fructose", "cane sugar", "agave"]
    sugar_count = 0
    for s in sugars:
        if s in text_lower:
            sugar_count += 1
            risks.append({"name": s.title(), "status": "CAUTION", "reason": "Added sugar/sweetener."})
            
    # Determine Overall Verdict
    verdict = "SAFE"
    explanation = "This product appears to have clean ingredients."
    risk_level = "LOW"
    
    if any(r["status"] == "AVOID" for r in risks):
        verdict = "AVOID"
        explanation = "Contains harmful preservatives or additives. Best to avoid."
        risk_level = "HIGH"
    elif len(risks) >= 3 or sugar_count >= 2:
        verdict = "CAUTION"
        explanation = "Contains multiple additives or processed sugars. Consume in moderation."
        risk_level = "MEDIUM"
    elif len(risks) > 0:
        verdict = "CAUTION"
        explanation = "Contains some artificial ingredients or added sugars."
        risk_level = "MEDIUM"
        
    # If no ingredients were flagged but text isn't empty, it's considered safe enough
    if len(risks) == 0:
        risks.append({"name": "Whole Ingredients", "status": "SAFE", "reason": "No major harmful additives detected."})
        
    return {
        "verdict": verdict,
        "explanation": explanation,
        "risk_level": risk_level,
        "ingredients_analysis": risks,
        "nutritional_highlights": {
             "sugar": "HIGH" if sugar_count >= 2 else ("MODERATE" if sugar_count == 1 else "LOW"),
             "sodium": "UNKNOWN",
             "processing": "NOVA4" if (len(risks) > 1 and verdict != "SAFE") else "NOVA1" 
        }
    }

def analyze_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    try:
        # EasyOCR can directly read image bytes
        print("Extracting text from image using Local OCR...")
        result = reader.readtext(image_bytes, detail=0)
        extracted_text = " ".join(result)
        print(f"Extracted Text: {extracted_text}")
        
        return analyze_text(extracted_text)
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {"verdict": "ERROR", "explanation": "Failed to extract text from image."}
