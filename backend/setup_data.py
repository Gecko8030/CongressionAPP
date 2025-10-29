"""
Dataset Setup Helper Script

This script helps you organize and validate your training dataset.
"""

import os
import shutil
from pathlib import Path
from collections import Counter
import random

CLASS_NAMES = [
    "healthy",
    "sheath_blight",
    "rice_blast",
    "fall_armyworm",
    "brown_spot",
    "leaf_folder"
]

def create_directory_structure():
    """Create the required directory structure."""
    data_dir = Path("data")
    
    for split in ['train', 'val', 'test']:
        for class_name in CLASS_NAMES:
            dir_path = data_dir / split / class_name
            dir_path.mkdir(parents=True, exist_ok=True)
    
    print("✓ Created directory structure:")
    print("  data/")
    print("  ├── train/")
    print("  │   ├── healthy/")
    print("  │   ├── sheath_blight/")
    print("  │   ├── rice_blast/")
    print("  │   ├── fall_armyworm/")
    print("  │   ├── brown_spot/")
    print("  │   └── leaf_folder/")
    print("  ├── val/")
    print("  │   └── (same structure)")
    print("  └── test/")
    print("      └── (same structure)")

def split_dataset(source_dir, train_pct=0.7, val_pct=0.15, test_pct=0.15):
    """
    Split a flat dataset into train/val/test folders.
    
    Usage:
        If you have all images in 'my_images/', run:
        python setup_data.py my_images/
    """
    if not os.path.exists(source_dir):
        print(f"Error: Source directory '{source_dir}' not found!")
        print("Usage: python setup_data.py <source_directory>")
        return
    
    print(f"\nSplitting dataset from: {source_dir}")
    
    # Find all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    files = []
    for ext in image_extensions:
        files.extend(Path(source_dir).glob(f"*{ext}"))
        files.extend(Path(source_dir).glob(f"**/*{ext}"))
    
    print(f"Found {len(files)} images")
    
    # Shuffle
    random.shuffle(files)
    
    # Split
    total = len(files)
    train_end = int(total * train_pct)
    val_end = train_end + int(total * val_pct)
    
    train_files = files[:train_end]
    val_files = files[train_end:val_end]
    test_files = files[val_end:]
    
    print(f"Train: {len(train_files)} images")
    print(f"Val: {len(val_files)} images")
    print(f"Test: {len(test_files)} images")
    
    # Copy files
    print("\nCopying files...")
    for file in train_files:
        dest = Path("data/train") / file.name
        shutil.copy2(file, dest)
    
    for file in val_files:
        dest = Path("data/val") / file.name
        shutil.copy2(file, dest)
    
    for file in test_files:
        dest = Path("data/test") / file.name
        shutil.copy2(file, dest)
    
    print("✓ Dataset split complete!")

def validate_dataset(data_dir="data"):
    """Validate dataset structure and show statistics."""
    print(f"\nValidating dataset in '{data_dir}'...")
    
    stats = {}
    for split in ['train', 'val', 'test']:
        stats[split] = {}
        split_dir = Path(data_dir) / split
        
        for class_name in CLASS_NAMES:
            class_dir = split_dir / class_name
            if class_dir.exists():
                count = len(list(class_dir.glob("*.jpg")) + list(class_dir.glob("*.png")))
                stats[split][class_name] = count
            else:
                stats[split][class_name] = 0
    
    # Print statistics
    print("\nDataset Statistics:")
    print("=" * 60)
    for split in ['train', 'val', 'test']:
        print(f"\n{split.upper()}:")
        for class_name in CLASS_NAMES:
            count = stats[split][class_name]
            print(f"  {class_name:20s}: {count:4d} images")
        print(f"  {'TOTAL':20s}: {sum(stats[split].values()):4d} images")
    
    # Check if dataset is ready for training
    total_train = sum(stats['train'].values())
    total_val = sum(stats['val'].values())
    total_test = sum(stats['test'].values())
    
    print("\n" + "=" * 60)
    if total_train > 0 and total_val > 0:
        print("✓ Dataset is ready for training!")
        print(f"  Total images: {total_train + total_val + total_test}")
        print(f"  Train: {total_train}, Val: {total_val}, Test: {total_test}")
    else:
        print("⚠ Dataset needs more images")
    
    return stats

def copy_from_class_folders(source_dir):
    """
    Copy images from folders named by class (if you already have them organized).
    
    Example structure:
    source_dir/
    ├── healthy/
    ├── sheath_blight/
    ├── rice_blast/
    ├── fall_armyworm/
    ├── brown_spot/
    └── leaf_folder/
    """
    print(f"\nOrganizing dataset from: {source_dir}")
    
    for class_name in CLASS_NAMES:
        class_dir = Path(source_dir) / class_name
        
        if class_dir.exists():
            # Get all images
            images = []
            for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
                images.extend(class_dir.glob(f"*{ext}"))
            
            print(f"{class_name}: {len(images)} images")
            
            if len(images) == 0:
                continue
            
            # Shuffle and split
            random.shuffle(images)
            total = len(images)
            
            train_end = int(total * 0.7)
            val_end = train_end + int(total * 0.15)
            
            # Copy to train, val, test folders
            for i, img in enumerate(images):
                if i < train_end:
                    dest = Path("data/train") / class_name / img.name
                elif i < val_end:
                    dest = Path("data/val") / class_name / img.name
                else:
                    dest = Path("data/test") / class_name / img.name
                
                shutil.copy2(img, dest)
    
    print("✓ Dataset organized!")

if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("Crop Disease Dataset Setup")
    print("=" * 60)
    
    # Create directory structure
    create_directory_structure()
    
    # If source directory provided, organize it
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
        
        if any((Path(source_dir) / class_name).exists() for class_name in CLASS_NAMES):
            # Organized by class
            copy_from_class_folders(source_dir)
        else:
            # Flat directory
            split_dataset(source_dir)
    
    # Validate dataset
    validate_dataset()
    
    print("\nNext steps:")
    print("1. Add your labeled images to the appropriate folders")
    print("2. Run: python train_model.py")
    print("\nFor more help:")
    print("- Read: TRAINING_GUIDE.md")
    print("- Quick setup: SETUP_TRAINING.md")



