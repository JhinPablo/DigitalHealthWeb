import os
import time
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import onnxruntime as ort

app = FastAPI(title="ML Service — Diabetes Risk (ONNX)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "diabetes_model.onnx")

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
]

# PIMA training-set medians and stds (for SHAP approximation)
_MEDIANS = {
    "Pregnancies": 3.0, "Glucose": 117.0, "BloodPressure": 72.0,
    "SkinThickness": 23.0, "Insulin": 30.5, "BMI": 32.0,
    "DiabetesPedigreeFunction": 0.372, "Age": 29.0,
}
_STDS = {
    "Pregnancies": 3.37, "Glucose": 31.97, "BloodPressure": 12.33,
    "SkinThickness": 11.76, "Insulin": 115.24, "BMI": 7.88,
    "DiabetesPedigreeFunction": 0.33, "Age": 13.27,
}

_session: ort.InferenceSession = None
_input_name: str = None


@app.on_event("startup")
def load_model():
    global _session, _input_name
    _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
    _input_name = _session.get_inputs()[0].name


class PredictRequest(BaseModel):
    patient_id: Optional[str] = None
    Pregnancies: float = 0
    Glucose: float = 100
    BloodPressure: float = 70
    SkinThickness: float = 20
    Insulin: float = 80
    BMI: float = 25.0
    DiabetesPedigreeFunction: float = 0.5
    Age: float = 30


def _shap_approx(features: dict, prob: float) -> dict:
    """Approximate marginal SHAP contribution via feature deviation from median."""
    shap_values = {}
    for feat in FEATURE_NAMES:
        val = features[feat]
        deviation = (val - _MEDIANS[feat]) / max(_STDS[feat], 1e-6)
        shap_values[feat] = round(float(deviation * prob * 0.12), 4)
    return shap_values


@app.post("/predict")
def predict(req: PredictRequest):
    features = {
        "Pregnancies": req.Pregnancies,
        "Glucose": req.Glucose,
        "BloodPressure": req.BloodPressure,
        "SkinThickness": req.SkinThickness,
        "Insulin": req.Insulin,
        "BMI": req.BMI,
        "DiabetesPedigreeFunction": req.DiabetesPedigreeFunction,
        "Age": req.Age,
    }

    x = np.array([[features[f] for f in FEATURE_NAMES]], dtype=np.float32)

    t0 = time.perf_counter()
    labels, probas = _session.run(None, {_input_name: x})
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    prediction = int(labels[0])
    prob = float(probas[0][1])

    if prob >= 0.75:
        risk_category = "CRITICAL"
    elif prob >= 0.50:
        risk_category = "HIGH"
    elif prob >= 0.30:
        risk_category = "MEDIUM"
    else:
        risk_category = "LOW"

    return {
        "patient_id": req.patient_id,
        "model_type": "ML",
        "model_name": "diabetes_pima_onnx_v1",
        "prediction": prediction,
        "probability": round(prob, 4),
        "risk_category": risk_category,
        "risk_prediction": {
            "diabetes_positive": round(prob, 4),
            "diabetes_negative": round(1 - prob, 4),
        },
        "shap_values": _shap_approx(features, prob),
        "calibration": "isotonic",
        "inference_time_ms": elapsed_ms,
    }


@app.get("/health")
def health():
    loaded = _session is not None
    return {
        "status": "ok",
        "service": "ml-service",
        "model": "diabetes_pima_onnx_v1",
        "model_loaded": loaded,
    }
