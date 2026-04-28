import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter

app = FastAPI(title="Docling Microservice")

# Allow CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DocumentConverter globally so models are loaded once
converter = DocumentConverter()

@app.post("/extract")
async def extract_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Save the uploaded file temporarily
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Convert the document using Docling
        result = converter.convert(temp_path)
        
        # Extract markdown representation, which is excellent for LLM parsing
        markdown_text = result.document.export_to_markdown()
        
        return {
            "success": True,
            "filename": file.filename,
            "text": markdown_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docling error: {str(e)}")
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
