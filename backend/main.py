from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from services.prediction import PredictionService
from services.supabase_client import get_supabase_client
from services.weather import WeatherService
from services.risk_calculator import RiskCalculator

load_dotenv()

app = FastAPI(title="CropIntel AR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prediction_service = PredictionService()
weather_service = WeatherService()
risk_calculator = RiskCalculator()

class ReportCreate(BaseModel):
    crop: str
    county: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_id: str

class AlertResponse(BaseModel):
    id: int
    county: str
    crop: str
    risk_score: float
    message: str
    temperature: Optional[float]
    humidity: Optional[float]
    conditions: Optional[str]
    updated_at: str

@app.get("/")
async def root():
    return {"message": "CropIntel AR API", "version": "1.0.0"}

@app.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size must be less than 5MB")

    try:
        contents = await file.read()
        result = await prediction_service.predict(contents)

        return {
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "all_predictions": result.get("all_predictions", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/report")
async def create_report(
    file: UploadFile = File(...),
    crop: str = None,
    county: str = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    user_id: str = None,
):
    if not all([crop, county, user_id]):
        raise HTTPException(status_code=400, detail="crop, county, and user_id are required")

    try:
        supabase = get_supabase_client()

        contents = await file.read()
        prediction_result = await prediction_service.predict(contents)

        file_path = f"{user_id}/{file.filename}"
        upload_result = supabase.storage.from_("crop-images").upload(
            file_path,
            contents,
            {"content-type": file.content_type}
        )

        image_url = supabase.storage.from_("crop-images").get_public_url(file_path)

        report_data = {
            "user_id": user_id,
            "crop": crop,
            "county": county,
            "image_url": image_url,
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
            "latitude": latitude,
            "longitude": longitude,
            "status": "pending"
        }

        result = supabase.table("reports").insert(report_data).execute()

        return {
            "report_id": result.data[0]["id"],
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
            "image_url": image_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report creation failed: {str(e)}")

@app.get("/alerts/{county}")
async def get_county_alerts(county: str):
    try:
        supabase = get_supabase_client()
        result = supabase.table("alerts").select("*").eq("county", county).execute()

        return {"alerts": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@app.get("/alerts")
async def get_all_alerts():
    try:
        supabase = get_supabase_client()
        result = supabase.table("alerts").select("*").order("risk_score", desc=True).execute()

        return {"alerts": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@app.post("/compute-risk-daily")
async def compute_daily_risk():
    try:
        counties = ["Lonoke", "Stuttgart", "Poinsett", "Jefferson", "Arkansas", "Mississippi"]
        crops = ["rice", "soy", "cotton"]

        updated_count = 0

        for county in counties:
            weather_data = await weather_service.get_county_weather(county)

            for crop in crops:
                risk_score = risk_calculator.calculate_risk(
                    crop=crop,
                    temperature=weather_data.get("temperature", 75),
                    humidity=weather_data.get("humidity", 65),
                    conditions=weather_data.get("conditions", "partly_cloudy")
                )

                message = risk_calculator.get_risk_message(crop, risk_score)

                supabase = get_supabase_client()
                result = supabase.table("alerts").update({
                    "risk_score": risk_score,
                    "message": message,
                    "temperature": weather_data.get("temperature"),
                    "humidity": weather_data.get("humidity"),
                    "conditions": weather_data.get("conditions"),
                    "updated_at": "now()"
                }).eq("county", county).eq("crop", crop).execute()

                updated_count += len(result.data)

        return {"message": f"Updated {updated_count} alerts", "counties": len(counties)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk computation failed: {str(e)}")

@app.get("/reports/{report_id}")
async def get_report(report_id: str):
    try:
        supabase = get_supabase_client()
        result = supabase.table("reports").select("*").eq("id", report_id).maybeSingle().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Report not found")

        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
