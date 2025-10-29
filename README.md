# CropIntel AR

AI-powered crop disease detection system for Arkansas farmers, featuring real-time disease identification, county-level risk alerts, and weather-based predictions.

## Features

- **Instant Disease Detection**: Upload or capture crop images for AI-powered disease diagnosis in under 1 second
- **Real-Time Risk Alerts**: County-level disease risk scores updated daily using NWS weather data
- **Arkansas-Specific**: Trained on rice, soybean, and cotton diseases common to Arkansas
- **PWA Support**: Install as a mobile app with offline diagnosis capabilities
- **Web Push Notifications**: Get alerts when disease risk exceeds 65% in your county
- **MobileNetV3 Model**: Lightweight ML model optimized for mobile devices (75%+ accuracy)

## Technology Stack

### Frontend
- **Next.js 13**: React framework with app directory
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Service Workers**: PWA functionality and offline support

### Backend
- **FastAPI**: High-performance Python web framework
- **TensorFlow Lite**: Optimized ML inference
- **ONNX Runtime**: Alternative model format support
- **NWS API**: Real-time weather data integration

### Database & Storage
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Secure data access policies
- **Storage**: Image uploads and management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account (free tier works)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the FastAPI server:
```bash
python main.py
```

Visit `http://localhost:8000/docs` for API documentation

## Database Schema

The application uses three main tables:

### `reports`
- User-submitted disease reports with images
- ML model predictions and confidence scores
- GPS coordinates and expert feedback
- Status tracking (pending, reviewed, resolved)

### `alerts`
- County-level risk alerts
- Daily updates based on weather conditions
- Temperature, humidity, and weather data
- Computed risk scores (0-1)

### `user_profiles`
- Farmer information and preferences
- Notification settings
- Primary crops and farm details

All tables include Row Level Security policies to ensure data privacy.

## API Endpoints

### Disease Detection
- `POST /predict` - Upload image for disease prediction
- `POST /report` - Create full report with image and metadata

### Alerts
- `GET /alerts` - Get all county alerts
- `GET /alerts/{county}` - Get alerts for specific county
- `POST /compute-risk-daily` - Trigger daily risk computation (cron job)

### Reports
- `GET /reports/{report_id}` - Get specific report details

## ML Model

The system uses MobileNetV3-Small trained on Arkansas crop disease images:

### Detected Diseases
- **Sheath Blight** (Rice): Oval lesions with gray-green centers
- **Rice Blast** (Rice): Diamond-shaped lesions with brown margins
- **Fall Armyworm** (Rice, Soy, Cotton): Defoliation and whorl damage

### Model Performance
- Architecture: MobileNetV3-Small (224x224 input)
- Format: TensorFlow Lite (.tflite)
- Accuracy: 75%+ macro-F1 score
- Inference Time: <1 second on CPU
- Size: Optimized for mobile devices

To train your own model, collect labeled images and use the notebook structure described in `backend/README.md`.

## Risk Calculation

Disease risk scores (0-1) are computed daily based on:

1. **Temperature**: Proximity to optimal range for disease development
2. **Humidity**: Comparison to minimum threshold for each disease
3. **Weather Conditions**: Favorability (rainy, cloudy, clear, etc.)

### Risk Levels
- **HIGH (0.7-1.0)**: Immediate action recommended
- **MODERATE (0.5-0.69)**: Close monitoring required
- **LOW-MODERATE (0.3-0.49)**: Regular observation
- **LOW (0-0.29)**: Standard practices sufficient

## Arkansas Coverage

### Counties Monitored
- Lonoke (Rice - 425,000 acres)
- Stuttgart (Rice - 380,000 acres)
- Poinsett (Rice - 310,000 acres)
- Jefferson (Soy - 290,000 acres)
- Arkansas (Rice - 340,000 acres)
- Mississippi (Cotton - 270,000 acres)

### Total Production
- Rice: 1.43M acres
- Soybeans: 3.02M acres
- Cotton: 640,000 acres

## PWA Features

### Offline Capabilities
- Service worker caches core pages
- Offline disease diagnosis (if model cached)
- Background sync for reports

### Installation
Users can install CropIntel AR as a mobile app:
- iOS: Safari > Share > Add to Home Screen
- Android: Chrome > Menu > Add to Home Screen

### Push Notifications
Register for notifications to receive alerts when:
- Disease risk exceeds 65% in your county
- New diseases are detected in your area
- Expert feedback is added to your reports

## Data Sources

- **UAEX**: University of Arkansas Extension Service disease databases
- **USDA**: United States Department of Agriculture crop statistics
- **NWS**: National Weather Service (api.weather.gov) for real-time weather data
- **Local Agronomists**: Expert validation and feedback

## Production Deployment

### Frontend
Deploy to Vercel, Netlify, or any Next.js-compatible platform:
```bash
npm run build
npm run start
```

### Backend
Deploy FastAPI to:
- Railway
- Render
- AWS EC2/ECS
- Google Cloud Run

Ensure environment variables are set in production.

### Daily Risk Computation
Set up a cron job to call `/compute-risk-daily`:
```bash
# Every day at 6 AM
0 6 * * * curl -X POST https://your-api.com/compute-risk-daily
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (build must succeed)
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For questions or issues:
- Create an issue on GitHub
- Contact the development team
- Consult the backend README for API-specific questions

## Acknowledgments

- Arkansas farmers for field testing and feedback
- UAEX for disease data and expertise
- National Weather Service for weather API
- MobileNet team at Google for the model architecture
