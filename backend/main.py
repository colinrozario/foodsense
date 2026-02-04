from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import httpx
import os
from ai_agent import analyze_text, analyze_image

app = FastAPI(title="foodsense.ai API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BarcodeRequest(BaseModel):
    barcode: str

@app.get("/")
def read_root():
    return {"status": "ok", "service": "foodsense.ai-backend"}

@app.post("/scan/barcode")
async def scan_barcode(request: BarcodeRequest):
    barcode = request.barcode
    print(f"Scanning barcode: {barcode}")
    
    # 1. Fetch from OpenFoodFacts
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=10.0)
            data = resp.json()
        except Exception as e:
            return {"verdict": "ERROR", "explanation": "Failed to connect to product database."}
            
    if data.get("status") != 1:
       
        return {"verdict": "UNKNOWN", "explanation": "Product not found in database. Try scanning the label photo."}
        
    product = data["product"]
    product_name = product.get("product_name", "Unknown Product")
    ingredients_text = product.get("ingredients_text", "")
    
    if not ingredients_text:
         
         brands = product.get("brands", "")
         categories = product.get("categories", "")
         ingredients_text = f"Product: {product_name}, Brand: {brands}, Categories: {categories}. (Ingredients list missing)"

  
    ai_result = analyze_text(ingredients_text)
    
  
    return {
        "product_name": product_name,
        "image_url": product.get("image_front_url"),
        **ai_result
    }

@app.post("/scan/image")
async def scan_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image API.")
    
    content = await file.read()
    
    # Analyze directly with Gemini Vision
    ai_result = analyze_image(content, mime_type=file.content_type)
    
    return {
        "product_name": "Scanned Label", 
        "image_url": None, # Could upload to S3 here in real app
        **ai_result
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
