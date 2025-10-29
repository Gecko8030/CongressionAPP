# CropIntel AR Backend

FastAPI backend for CropIntel AR crop disease detection system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file in the backend directory with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. (Optional) Add your trained model:
Place your `.tflite` model file in `models/crop_disease_model.tflite`

## Running the Server

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

### POST /predict
Upload an image for disease prediction.
- **Input**: Multipart form data with `file` field
- **Output**: JSON with prediction, confidence, and all predictions
- **Max file size**: 5MB
- **Supported formats**: image/jpeg, image/png, image/webp

### POST /report
Create a disease report with image upload.
- **Input**: Multipart form data with:
  - `file`: Image file
  - `crop`: Crop type (rice, soy, cotton)
  - `county`: Arkansas county name
  - `user_id`: User identifier
  - `latitude`: Optional GPS latitude
  - `longitude`: Optional GPS longitude
- **Output**: Report ID, prediction, confidence, and image URL

### GET /alerts
Get all county risk alerts.
- **Output**: JSON array of alerts with risk scores and weather data

### GET /alerts/{county}
Get risk alerts for a specific county.
- **Input**: County name in path
- **Output**: JSON array of alerts for that county

### POST /compute-risk-daily
Compute daily risk scores for all counties (cron job).
- **Output**: Number of alerts updated

### GET /reports/{report_id}
Get a specific report by ID.
- **Input**: Report UUID in path
- **Output**: Report details

## Model Training

To train your own model:

1. Collect and label Arkansas crop disease images
2. Use the `train_model.ipynb` notebook (create separately)
3. Export to TensorFlow Lite format
4. Place the `.tflite` file in the `models/` directory
5. Update the `model_path` in `services/prediction.py`

## Testing

The prediction service includes a mock prediction mode that activates if no model is found. This generates random but consistent predictions for testing.

## Architecture

```
backend/
├── main.py                    # FastAPI application and routes
├── requirements.txt           # Python dependencies
├── services/
│   ├── supabase_client.py    # Supabase connection
│   ├── prediction.py         # ML model inference
│   ├── weather.py            # NWS weather API integration
│   └── risk_calculator.py    # Disease risk computation
└── models/                    # ML model files (not included)
```

## Weather Integration

The weather service uses the National Weather Service API (api.weather.gov) to fetch:
- Temperature
- Humidity
- Conditions (cloudy, rainy, etc.)

This data is used to compute disease risk scores based on optimal conditions for:
- Sheath blight
- Rice blast
- Fall armyworm

## Risk Calculation

Risk scores (0-1) are computed based on:
1. **Temperature**: Distance from optimal range for disease
2. **Humidity**: Comparison to minimum threshold
3. **Conditions**: Weather favorability (rainy, cloudy, etc.)

Risk levels:
- **HIGH (0.7-1.0)**: Immediate action recommended
- **MODERATE (0.5-0.69)**: Close monitoring required
- **LOW-MODERATE (0.3-0.49)**: Regular observation
- **LOW (0-0.29)**: Standard practices
