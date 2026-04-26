from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reader = easyocr.Reader(['vi', 'en']) 

@app.post("/api/ocr/extract-cccd")
async def extract_cccd(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        results = reader.readtext(image_bytes, detail=0)
        full_text = " ".join(results)
        
        match = re.search(r'\b\d{12}\b', full_text)
        if not match:
            match = re.search(r'\b\d{9}\b', full_text)
        
        if match:
            return {"status": "success", "cccd_number": match.group(), "raw_text": full_text}
        else:
            return {"status": "not_found", "message": "Không tìm thấy số CCCD", "raw_text": full_text}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
