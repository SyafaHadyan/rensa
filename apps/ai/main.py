from fastapi import APIRouter, FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import uuid
import os

from nsfw_detector.model import Model

app = FastAPI()
router = APIRouter(prefix="/api")

# Load NSFW model once
nsfw_model = Model()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/nsfw/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_filename = f"temp_{uuid.uuid4()}.jpg"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run prediction
        result = nsfw_model.predict(temp_filename)

        # Delete temp file
        os.remove(temp_filename)

        return JSONResponse(result)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


app.include_router(router)
