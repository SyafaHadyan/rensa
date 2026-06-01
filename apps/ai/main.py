from fastapi import APIRouter, FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

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
        image_bytes = await file.read()

        result = nsfw_model.predict_bytes(image_bytes)

        return JSONResponse(result)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


app.include_router(router)
