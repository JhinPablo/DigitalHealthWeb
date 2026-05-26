import io
import os
import time
import uuid
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageFilter, ImageDraw
import onnxruntime as ort

app = FastAPI(title="DL Service — Retinopathy Detection (ONNX)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH  = os.path.join(os.path.dirname(__file__), "models", "retinopathy_model_int8.onnx")
MINIO_ENDPOINT  = os.getenv("MINIO_ENDPOINT",  "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET    = os.getenv("MINIO_BUCKET",    "medical-images")
MINIO_SECURE    = os.getenv("MINIO_SECURE",    "false").lower() == "true"

IMG_SIZE = 224
_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

SEVERITY_LABELS = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative DR",
}

_session: ort.InferenceSession = None
_input_name: str = None


@app.on_event("startup")
def load_model():
    global _session, _input_name
    _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
    _input_name = _session.get_inputs()[0].name


def _preprocess(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0        # [H, W, 3]
    arr = (arr - _MEAN) / _STD                            # normalize
    arr = arr.transpose(2, 0, 1)[np.newaxis, ...]         # [1, 3, H, W]
    return arr


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)


def get_minio_client():
    from minio import Minio
    client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)
    return client


def generate_gradcam(image_bytes: bytes, severity: int) -> bytes:
    """Overlay a heatmap on the image — color intensity reflects predicted severity."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size

    heatmap = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(heatmap)

    cx = w // 2
    cy = h // 2
    max_r = min(w, h) // 3
    base_alpha = 40 + severity * 18  # more severe → more visible heatmap

    for r in range(max_r, 0, -2):
        alpha = int(base_alpha * (1 - r / max_r))
        ratio = r / max_r
        red   = 255
        green = int(255 * ratio * max(0, 1 - severity * 0.15))
        blue  = 0
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, alpha))

    heatmap = heatmap.filter(ImageFilter.GaussianBlur(radius=15))
    result = img.copy()
    result.paste(heatmap, (0, 0), heatmap)

    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()


@app.post("/predict")
async def predict(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
):
    image_bytes = await file.read()

    x = _preprocess(image_bytes)

    t0 = time.perf_counter()
    (logits,) = _session.run(None, {_input_name: x})
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    probs   = _softmax(logits[0])
    severity = int(np.argmax(probs))
    confidence = float(probs[severity])

    risk_score = severity / 4.0
    if risk_score >= 0.75:
        risk_category = "CRITICAL"
    elif risk_score >= 0.50:
        risk_category = "HIGH"
    elif risk_score >= 0.25:
        risk_category = "MEDIUM"
    else:
        risk_category = "LOW"

    gradcam_bytes = generate_gradcam(image_bytes, severity)
    gradcam_key   = f"gradcam/{patient_id}/{uuid.uuid4().hex[:8]}_gradcam.png"
    gradcam_url   = None
    try:
        client = get_minio_client()
        client.put_object(
            MINIO_BUCKET, gradcam_key,
            io.BytesIO(gradcam_bytes), len(gradcam_bytes),
            content_type="image/png",
        )
        gradcam_url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{gradcam_key}"
    except Exception as e:
        print(f"MinIO upload error: {e}")

    return {
        "patient_id": patient_id,
        "model_type": "DL",
        "model_name": "retinopathy_synthetic_int8_onnx_v1",
        "prediction": severity,
        "severity_label": SEVERITY_LABELS[severity],
        "confidence": round(confidence, 4),
        "risk_score": round(risk_score, 4),
        "risk_category": risk_category,
        "risk_prediction": {
            label: round(float(probs[i]), 4)
            for i, label in SEVERITY_LABELS.items()
        },
        "gradcam_url": gradcam_url,
        "gradcam_key": gradcam_key,
        "inference_time_ms": elapsed_ms,
    }


@app.get("/health")
def health():
    loaded = _session is not None
    return {
        "status": "ok",
        "service": "dl-service",
        "model": "retinopathy_synthetic_int8_onnx_v1",
        "model_loaded": loaded,
    }
