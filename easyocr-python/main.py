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
        
        # Extract CCCD/CMND Number (12 or 9 digits)
        cccd_match = re.search(r'\b\d{12}\b|\b\d{9}\b', full_text)
        cccd_number = cccd_match.group() if cccd_match else None
        
        # Extract Name (after "Họ và tên" or "Họ và tên Full name:" and before "Ngày sinh")
        name_match = re.search(r'Họ và tên(?: Full name)?[:\s]+(.*?)(?=\s*Ngày sinh|\s*$)', full_text, re.IGNORECASE)
        name = name_match.group(1).strip().title() if name_match else None
        
        if cccd_number or name:
            response_data = {"status": "success", "raw_text": full_text}
            if cccd_number:
                response_data["cccd_number"] = cccd_number
            if name:
                response_data["name"] = name
            return response_data
        else:
            return {"status": "not_found", "message": "Không tìm thấy thông tin", "raw_text": full_text}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
