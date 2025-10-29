# How to Prepare Your Dataset

I can help you organize your dataset and set up training, but I need you to provide the data in one of these ways:

## 📁 Option 1: Manual Organization (Recommended)

### Step 1: Prepare Your Folders
Create folders for each disease class on your computer:

```
my_dataset/
├── healthy/           # Healthy crop images
├── sheath_blight/     # Sheath blight images
├── rice_blast/        # Rice blast images
├── fall_armyworm/     # Fall armyworm images
├── brown_spot/        # Brown spot images
└── leaf_folder/       # Leaf folder images
```

### Step 2: Place Your Images
Add at least 100+ images per class. For best results, aim for:
- 500+ images per class for good accuracy
- 1000+ images per class for excellent accuracy

### Step 3: Let Me Organize It
Tell me where your dataset is located, and I'll help you run this command:

```bash
cd backend
python setup_data.py /path/to/my_dataset
```

This will automatically:
- Split into train/val/test (70%/15%/15%)
- Organize into the correct folder structure
- Show you statistics about your dataset

### Step 4: Start Training
```bash
python train_model.py
```

---

## 📦 Option 2: Share as Zip/Archive

If you have your images in a zip file or folder:

1. **Extract/place** your images somewhere accessible
2. **Tell me the location** (file path)
3. I can help you run the organization script to set it up properly

### Example:
If you have a zip file, you could:
```bash
unzip my_crop_images.zip -d /tmp/my_images
cd backend
python setup_data.py /tmp/my_images
```

---

## 🔄 Option 3: Download from Kaggle/Datasets

If you don't have images yet, I can help you find and download public datasets:

### Plant Village Dataset:
- **Free and public domain**
- 38 classes of plant diseases
- Can be filtered to crop diseases

### Steps:
1. Search for "Plant Village dataset" on Kaggle
2. Download the dataset
3. Filter to crop-related diseases
4. Use the organization script to structure it

---

## 📊 Dataset Requirements

### Minimum Requirements:
- **100 images per class** (can work, but low accuracy)
- **6 classes total**
- **Good image quality** (clear, well-lit)
- **Proper labeling** (correct disease identification)

### Recommended:
- **500+ images per class**
- **High resolution** (at least 224x224)
- **Diverse images** (different angles, lighting, fields)
- **Balanced classes** (similar number of images in each)

### Total Dataset Size:
- **Minimum**: 600 images (100 per class)
- **Good**: 3,000 images (500 per class)
- **Excellent**: 6,000+ images (1000+ per class)

---

## 🎯 What I Can Help With

### I CAN:
✅ Create the directory structure for you  
✅ Organize your existing images into train/val/test  
✅ Validate and show statistics about your dataset  
✅ Guide you through the training process  
✅ Help troubleshoot training issues  
✅ Show you how to structure the data properly  

### I CANNOT:
❌ Access your computer files directly  
❌ Download datasets from the internet  
❌ Train the model for you (you need to run the training)  
❌ Upload/manage the images themselves  

---

## 🚀 Quick Start Example

Let's say you have images in a folder called `my_crop_images`:

### 1. Tell me the location of your images
For example: `my_crop_images/` contains your images

### 2. I'll help you run:
```bash
cd backend
python setup_data.py /path/to/my_crop_images
```

### 3. Then train:
```bash
python train_model.py
```

---

## 💬 What to Do Now

**If you have images ready:**
1. Organize them into folders by disease (or just put them all in one folder)
2. Tell me the location/path
3. I'll help you set it up!

**If you need to find images first:**
- Let me know and I can help you find free datasets
- Or guide you on where to collect images from

---

## 📝 Example Workflow

```
Your situation:
- You have images in: /Users/havishkunchanapalli/Pictures/CropDiseases/
- They're organized in subfolders by disease type

What I'll do:
1. Run: python setup_data.py /Users/havishkunchanapalli/Pictures/CropDiseases/
2. This creates: backend/data/train/, backend/data/val/, backend/data/test/
3. Splits images: 70% train, 15% val, 15% test
4. Shows you stats about the dataset
5. You run: python train_model.py
```

---

## 🆘 Having Issues?

- **"Where should I put my images?"** → Any location on your computer, just tell me the path
- **"My images aren't labeled"** → You'll need to organize them by disease type first
- **"I don't have enough images"** → We can start with what you have, or I can help find public datasets

**Tell me: Where are your images located? Or do you need help finding a dataset?**



