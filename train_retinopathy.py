"""
Entrenamiento del modelo de retinopatia diabetica sobre dataset sintetico.
Genera imagenes con patrones visuales por clase, entrena MobileNetV2 (backbone
congelado + cabeza de clasificacion), exporta a ONNX y cuantiza a INT8.
"""
import os
import json
import time
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score,
    precision_score, recall_score, confusion_matrix
)
from sklearn.preprocessing import label_binarize

CLASSES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]
NUM_CLASSES = len(CLASSES)
IMG_SIZE = 224
SAMPLES_PER_CLASS = 120  # 600 total → rapido en CPU
BATCH_SIZE = 32
EPOCHS = 25
LR = 1e-3
SEED = 42

torch.manual_seed(SEED)
np.random.seed(SEED)


# ---------------------------------------------------------------------------
# Generacion de imagenes sinteticas de retina
# ---------------------------------------------------------------------------

def make_retina_bg(rng, size=IMG_SIZE):
    """Fondo circular tipo fondo ocular con gradiente naranja-rojizo."""
    img = np.zeros((size, size, 3), dtype=np.float32)
    cx, cy = size // 2, size // 2
    radius = int(size * 0.46)
    Y, X = np.ogrid[:size, :size]
    dist = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
    mask = dist <= radius
    # Gradiente de color (simulando reflejo del fondo ocular)
    norm_dist = np.clip(dist / radius, 0, 1)
    img[..., 0] = mask * (0.6 + 0.2 * (1 - norm_dist) + rng.uniform(-0.05, 0.05, (size, size)))
    img[..., 1] = mask * (0.3 + 0.1 * (1 - norm_dist) + rng.uniform(-0.04, 0.04, (size, size)))
    img[..., 2] = mask * (0.1 + 0.05 * (1 - norm_dist) + rng.uniform(-0.02, 0.02, (size, size)))
    return np.clip(img, 0, 1), mask, cx, cy, radius


def add_vessels(img, rng, mask, cx, cy, radius):
    """Agrega lineas oscuras simulando vasos sanguineos."""
    n_vessels = rng.integers(3, 8)
    for _ in range(n_vessels):
        angle = rng.uniform(0, 2 * np.pi)
        length = rng.integers(int(radius * 0.3), int(radius * 0.7))
        width = rng.integers(1, 3)
        x0, y0 = cx, cy
        dx, dy = int(np.cos(angle) * length), int(np.sin(angle) * length)
        x1, y1 = x0 + dx, y0 + dy
        # Dibujar linea (Bresenham simplificado)
        steps = max(abs(dx), abs(dy))
        if steps == 0:
            continue
        for s in range(steps):
            px = int(x0 + dx * s / steps)
            py = int(y0 + dy * s / steps)
            for w in range(-width, width + 1):
                for ww in range(-width, width + 1):
                    if 0 <= px + w < img.shape[0] and 0 <= py + ww < img.shape[1]:
                        img[px + w, py + ww] *= 0.6
    return img


def add_microaneurysms(img, rng, mask, n=5):
    """Pequenos puntos oscuro-rojizos = microaneurismas."""
    positions = np.argwhere(mask)
    if len(positions) == 0:
        return img
    chosen = positions[rng.choice(len(positions), size=min(n, len(positions)), replace=False)]
    for (py, px) in chosen:
        r = rng.integers(2, 5)
        Y, X = np.ogrid[:img.shape[0], :img.shape[1]]
        spot = (X - px) ** 2 + (Y - py) ** 2 <= r ** 2
        img[spot, 0] = np.clip(img[spot, 0] * 0.5 + 0.2, 0, 1)
        img[spot, 1] = img[spot, 1] * 0.3
        img[spot, 2] = img[spot, 2] * 0.1
    return img


def add_hemorrhages(img, rng, mask, n=8, large=False):
    """Manchas rojas irregulares = hemorragias."""
    positions = np.argwhere(mask)
    if len(positions) == 0:
        return img
    chosen = positions[rng.choice(len(positions), size=min(n, len(positions)), replace=False)]
    for (py, px) in chosen:
        r = rng.integers(6 if large else 3, 14 if large else 8)
        Y, X = np.ogrid[:img.shape[0], :img.shape[1]]
        spot = (X - px) ** 2 + (Y - py) ** 2 <= r ** 2
        img[spot, 0] = np.clip(img[spot, 0] * 0.3 + 0.6, 0, 1)
        img[spot, 1] = img[spot, 1] * 0.1
        img[spot, 2] = img[spot, 2] * 0.05
    return img


def add_exudates(img, rng, mask, n=6):
    """Manchas brillantes amarillo-blancas = exudados."""
    positions = np.argwhere(mask)
    if len(positions) == 0:
        return img
    chosen = positions[rng.choice(len(positions), size=min(n, len(positions)), replace=False)]
    for (py, px) in chosen:
        r = rng.integers(3, 8)
        Y, X = np.ogrid[:img.shape[0], :img.shape[1]]
        spot = (X - px) ** 2 + (Y - py) ** 2 <= r ** 2
        img[spot, 0] = np.clip(img[spot, 0] + 0.4, 0, 1)
        img[spot, 1] = np.clip(img[spot, 1] + 0.35, 0, 1)
        img[spot, 2] = np.clip(img[spot, 2] + 0.1, 0, 1)
    return img


def add_neovascularization(img, rng, mask, cx, cy, radius):
    """Patron de neovascularizacion (redes vasculares finas, clase 4)."""
    n_branches = rng.integers(3, 7)
    for _ in range(n_branches):
        angle = rng.uniform(0, 2 * np.pi)
        base_x = cx + int(np.cos(angle) * radius * 0.4)
        base_y = cy + int(np.sin(angle) * radius * 0.4)
        sub_branches = rng.integers(2, 5)
        for _ in range(sub_branches):
            sub_angle = angle + rng.uniform(-0.8, 0.8)
            length = rng.integers(15, 40)
            for s in range(length):
                px = int(base_x + np.cos(sub_angle) * s)
                py = int(base_y + np.sin(sub_angle) * s)
                if 0 <= px < img.shape[0] and 0 <= py < img.shape[1]:
                    img[px, py, 0] = min(img[px, py, 0] + 0.3, 1.0)
                    img[px, py, 1] = max(img[px, py, 1] - 0.1, 0.0)
    return img


def generate_image(label, rng):
    img, mask, cx, cy, radius = make_retina_bg(rng)
    img = add_vessels(img, rng, mask, cx, cy, radius)

    if label == 0:   # No DR
        pass
    elif label == 1: # Mild — microaneurismas
        img = add_microaneurysms(img, rng, mask, n=rng.integers(3, 8))
    elif label == 2: # Moderate — microaneurismas + hemorragias pequenas + exudados
        img = add_microaneurysms(img, rng, mask, n=rng.integers(5, 12))
        img = add_hemorrhages(img, rng, mask, n=rng.integers(4, 10))
        img = add_exudates(img, rng, mask, n=rng.integers(3, 7))
    elif label == 3: # Severe — hemorragias grandes + exudados abundantes
        img = add_hemorrhages(img, rng, mask, n=rng.integers(10, 20), large=True)
        img = add_exudates(img, rng, mask, n=rng.integers(8, 15))
        img = add_microaneurysms(img, rng, mask, n=rng.integers(10, 20))
    elif label == 4: # Proliferative — neovascularizacion + todo lo anterior
        img = add_hemorrhages(img, rng, mask, n=rng.integers(15, 25), large=True)
        img = add_exudates(img, rng, mask, n=rng.integers(10, 18))
        img = add_neovascularization(img, rng, mask, cx, cy, radius)
        img = add_microaneurysms(img, rng, mask, n=rng.integers(15, 25))

    return (img * 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Dataset PyTorch
# ---------------------------------------------------------------------------

class SyntheticRetina(Dataset):
    def __init__(self, n_per_class, transform=None, seed=42):
        self.transform = transform
        rng = np.random.default_rng(seed)
        self.images, self.labels = [], []
        for cls in range(NUM_CLASSES):
            for _ in range(n_per_class):
                self.images.append(generate_image(cls, rng))
                self.labels.append(cls)
        idx = rng.permutation(len(self.images))
        self.images = [self.images[i] for i in idx]
        self.labels = [self.labels[i] for i in idx]

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img = self.images[idx]
        label = self.labels[idx]
        if self.transform:
            from PIL import Image as PILImage
            img = PILImage.fromarray(img)
            img = self.transform(img)
        return img, label


# ---------------------------------------------------------------------------
# Modelo
# ---------------------------------------------------------------------------

def build_model():
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    # Congelar backbone
    for param in model.features.parameters():
        param.requires_grad = False
    # Reemplazar cabeza de clasificacion
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, NUM_CLASSES)
    )
    return model


# ---------------------------------------------------------------------------
# Entrenamiento
# ---------------------------------------------------------------------------

def train():
    device = torch.device("cpu")

    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    print(f"Generando dataset sintetico ({SAMPLES_PER_CLASS} imgs/clase × {NUM_CLASSES} clases)...")
    t0 = time.time()
    full_ds = SyntheticRetina(SAMPLES_PER_CLASS, transform=None, seed=SEED)
    n_train = int(0.8 * len(full_ds))
    n_val   = len(full_ds) - n_train

    train_idx = list(range(n_train))
    val_idx   = list(range(n_train, len(full_ds)))

    class SubsetWithTransform(Dataset):
        def __init__(self, ds, indices, transform):
            self.ds = ds
            self.indices = indices
            self.transform = transform
        def __len__(self): return len(self.indices)
        def __getitem__(self, i):
            img, lbl = self.ds[self.indices[i]]
            if self.transform:
                from PIL import Image as PILImage
                img = PILImage.fromarray(img)
                img = self.transform(img)
            return img, lbl

    train_ds = SubsetWithTransform(full_ds, train_idx, train_tf)
    val_ds   = SubsetWithTransform(full_ds, val_idx, val_tf)
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    print(f"  Dataset listo en {time.time()-t0:.1f}s  (train={len(train_ds)}, val={len(val_ds)})")

    model = build_model().to(device)
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()), lr=LR
    )
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=8, gamma=0.5)
    criterion = nn.CrossEntropyLoss()

    best_val_acc = 0.0
    print(f"\nEntrenando {EPOCHS} epochs en CPU...")
    for epoch in range(1, EPOCHS + 1):
        model.train()
        train_loss = 0.0
        for imgs, lbls in train_loader:
            imgs, lbls = imgs.to(device), lbls.to(device)
            optimizer.zero_grad()
            loss = criterion(model(imgs), lbls)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
        scheduler.step()

        model.eval()
        all_preds, all_lbls, all_probs = [], [], []
        with torch.no_grad():
            for imgs, lbls in val_loader:
                imgs = imgs.to(device)
                logits = model(imgs)
                probs  = torch.softmax(logits, dim=1).cpu().numpy()
                preds  = logits.argmax(dim=1).cpu().numpy()
                all_preds.extend(preds)
                all_lbls.extend(lbls.numpy())
                all_probs.extend(probs)

        val_acc = accuracy_score(all_lbls, all_preds)
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), "best_retina.pt")

        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:3d}/{EPOCHS} | loss={train_loss/len(train_loader):.4f} | val_acc={val_acc:.4f}")

    # Cargar mejor modelo
    model.load_state_dict(torch.load("best_retina.pt", map_location="cpu"))
    model.eval()

    # Metricas finales
    all_preds, all_lbls, all_probs = [], [], []
    with torch.no_grad():
        for imgs, lbls in val_loader:
            logits = model(imgs.to(device))
            probs  = torch.softmax(logits, dim=1).cpu().numpy()
            preds  = logits.argmax(dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_lbls.extend(lbls.numpy())
            all_probs.extend(probs)

    all_probs = np.array(all_probs)
    y_bin = label_binarize(all_lbls, classes=list(range(NUM_CLASSES)))
    metrics = {
        "accuracy":  float(accuracy_score(all_lbls, all_preds)),
        "f1_macro":  float(f1_score(all_lbls, all_preds, average="macro")),
        "auc_roc":   float(roc_auc_score(y_bin, all_probs, multi_class="ovr", average="macro")),
        "precision": float(precision_score(all_lbls, all_preds, average="macro", zero_division=0)),
        "recall":    float(recall_score(all_lbls, all_preds, average="macro")),
    }

    print("\nMetricas finales (val set):")
    for k, v in metrics.items():
        print(f"  {k:15s}: {v:.4f}")
    print(f"\nMatriz de confusion:\n{confusion_matrix(all_lbls, all_preds)}")

    return model, metrics


# ---------------------------------------------------------------------------
# Exportacion ONNX + cuantizacion INT8
# ---------------------------------------------------------------------------

def export_onnx(model, output_path_fp32, output_path_int8):
    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE)
    os.makedirs(os.path.dirname(output_path_fp32), exist_ok=True)

    torch.onnx.export(
        model, dummy, output_path_fp32,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=17,
        do_constant_folding=True
    )
    print(f"\nONNX FP32 exportado: {output_path_fp32} ({os.path.getsize(output_path_fp32)/1024:.1f} KB)")

    # Cuantizacion INT8
    from onnxruntime.quantization import quantize_dynamic, QuantType
    quantize_dynamic(output_path_fp32, output_path_int8, weight_type=QuantType.QInt8)
    print(f"ONNX INT8 exportado: {output_path_int8} ({os.path.getsize(output_path_int8)/1024:.1f} KB)")


def verify_onnx(model_path):
    import onnxruntime as ort
    sess = ort.InferenceSession(model_path)
    dummy = np.random.rand(2, 3, IMG_SIZE, IMG_SIZE).astype(np.float32)
    out = sess.run(None, {"input": dummy})
    preds = np.argmax(out[0], axis=1)
    print(f"Verificacion ONNX OK — predicciones: {[CLASSES[p] for p in preds]}")


if __name__ == "__main__":
    model, metrics = train()

    fp32_path = os.path.join("dl-service", "models", "retinopathy_model_fp32.onnx")
    int8_path  = os.path.join("dl-service", "models", "retinopathy_model_int8.onnx")
    export_onnx(model, fp32_path, int8_path)
    verify_onnx(int8_path)

    metrics_path = os.path.join("dl-service", "models", "retinopathy_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metricas guardadas en {metrics_path}")

    # Limpiar checkpoint temporal
    if os.path.exists("best_retina.pt"):
        os.remove("best_retina.pt")

    print("\nListo.")
