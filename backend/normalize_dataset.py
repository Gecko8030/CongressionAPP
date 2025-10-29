import os
import shutil
from pathlib import Path
import random

SOURCE_DIR = "/Users/havishkunchanapalli/Downloads/Data Congressional APP"
TARGET_DIR = Path("data_normalized")

# Mapping from messy folder names -> normalized class names
FOLDER_MAP = {
    "Healthy _ DONE": "healthy",
    "Sheath_blight _ DONE": "sheath_blight",
    "Rice_blast _ DONE": "rice_blast",
    "fall_armyworm": "fall_armyworm",
    "brown_spot _DONE": "brown_spot",
    "Rice Leaffolder": "leaf_folder",
}

CLASSES = [
    "healthy",
    "sheath_blight",
    "rice_blast",
    "fall_armyworm",
    "brown_spot",
    "leaf_folder",
]

SPLITS = {"train": 0.7, "val": 0.15, "test": 0.15}

def ensure_dirs():
    for split in SPLITS.keys():
        for cls in CLASSES:
            (TARGET_DIR / split / cls).mkdir(parents=True, exist_ok=True)

def collect_images():
    all_items = []
    for messy, clean in FOLDER_MAP.items():
        src = Path(SOURCE_DIR) / messy
        if not src.exists():
            continue
        imgs = []
        for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.bmp"):
            imgs.extend(src.rglob(ext))
        all_items.append((clean, imgs))
    return all_items

def split_and_copy():
    random.seed(42)
    ensure_dirs()
    items = collect_images()
    for clean, imgs in items:
        imgs = list(imgs)
        random.shuffle(imgs)
        n = len(imgs)
        n_train = int(n * SPLITS["train"])
        n_val = int(n * SPLITS["val"])
        train_imgs = imgs[:n_train]
        val_imgs = imgs[n_train:n_train+n_val]
        test_imgs = imgs[n_train+n_val:]

        def _copy(files, split):
            dest_dir = TARGET_DIR / split / clean
            for p in files:
                dest = dest_dir / p.name
                try:
                    if not dest.exists():
                        shutil.copy2(p, dest)
                except Exception:
                    pass

        _copy(train_imgs, "train")
        _copy(val_imgs, "val")
        _copy(test_imgs, "test")

if __name__ == "__main__":
    print("Normalizing dataset...")
    split_and_copy()
    print("Done. Output in:", TARGET_DIR.resolve())




