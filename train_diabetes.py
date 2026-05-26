"""
Entrenamiento real del modelo de prediccion de diabetes (PIMA Indians Dataset).
Exporta el modelo final a ONNX para uso en ml-service.
"""
import os
import json
import urllib.request
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score,
    precision_score, recall_score, confusion_matrix
)
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

def load_pima_dataset():
    url = (
        "https://raw.githubusercontent.com/jbrownlee/Datasets/master/"
        "pima-indians-diabetes.data.csv"
    )
    print("Descargando dataset PIMA Indians Diabetes...")
    with urllib.request.urlopen(url, timeout=30) as r:
        raw = r.read().decode("utf-8")
    cols = FEATURE_NAMES + ["Outcome"]
    df = pd.read_csv(pd.io.common.StringIO(raw), header=None, names=cols)
    print(f"  {len(df)} muestras cargadas, {df['Outcome'].sum()} positivos ({df['Outcome'].mean()*100:.1f}%)")
    return df

def preprocess(df):
    # Reemplazar ceros imposibles fisiologicamente con la mediana de cada columna
    zero_invalid = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    df = df.copy()
    for col in zero_invalid:
        median_val = df.loc[df[col] != 0, col].median()
        df[col] = df[col].replace(0, median_val)
    X = df[FEATURE_NAMES].values.astype(np.float32)
    y = df["Outcome"].values
    return X, y

def train_and_evaluate(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", GradientBoostingClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.8,
            random_state=42
        ))
    ])

    # Cross-validation (5-fold estratificado)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    print("\nCross-validation (5-fold):")
    for metric in ["accuracy", "f1_macro", "roc_auc"]:
        scores = cross_val_score(pipeline, X, y, cv=cv, scoring=metric, n_jobs=-1)
        print(f"  {metric:15s}: {scores.mean():.4f} +/- {scores.std():.4f}")

    # Entrenamiento final
    pipeline.fit(X_train, y_train)

    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy":  float(accuracy_score(y_test, y_pred)),
        "f1_macro":  float(f1_score(y_test, y_pred, average="macro")),
        "auc_roc":   float(roc_auc_score(y_test, y_proba)),
        "precision": float(precision_score(y_test, y_pred, average="macro")),
        "recall":    float(recall_score(y_test, y_pred, average="macro")),
    }

    print("\nMetricas en test set (20% holdout):")
    for k, v in metrics.items():
        print(f"  {k:15s}: {v:.4f}")

    cm = confusion_matrix(y_test, y_pred)
    print(f"\nMatriz de confusion:\n{cm}")

    return pipeline, metrics

def export_to_onnx(pipeline, output_path):
    initial_type = [("float_input", FloatTensorType([None, len(FEATURE_NAMES)]))]
    onnx_model = convert_sklearn(
        pipeline,
        initial_types=initial_type,
        target_opset=17,
        options={"zipmap": False}
    )
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    size_kb = os.path.getsize(output_path) / 1024
    print(f"\nONNX exportado: {output_path} ({size_kb:.1f} KB)")

def verify_onnx(model_path):
    import onnxruntime as ort
    sess = ort.InferenceSession(model_path)
    dummy = np.random.rand(3, len(FEATURE_NAMES)).astype(np.float32)
    input_name = sess.get_inputs()[0].name
    out = sess.run(None, {input_name: dummy})
    print(f"Verificacion ONNX OK — output shapes: {[o.shape for o in out]}")
    print(f"  Labels: {out[0]}, Probas: {out[1][:, 1].round(3)}")

if __name__ == "__main__":
    df = load_pima_dataset()
    X, y = preprocess(df)
    pipeline, metrics = train_and_evaluate(X, y)

    output_path = os.path.join("ml-service", "models", "diabetes_model.onnx")
    export_to_onnx(pipeline, output_path)
    verify_onnx(output_path)

    metrics_path = os.path.join("ml-service", "models", "diabetes_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metricas guardadas en {metrics_path}")
