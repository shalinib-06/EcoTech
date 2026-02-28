from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import shutil
import os
from datetime import datetime
import uuid

from ai_engine import (
    full_ai_decision, 
    analyze_image, 
    get_user_progress, 
    update_user_progress,
    get_global_leaderboard,
    get_nearby_retailers,
    DEVICE_CONFIGS,
    BRAND_PREMIUMS,
    CONDITION_FACTORS
)

app = FastAPI(
    title="EcoTech Device Evaluator API",
    description="AI-powered e-waste management and device evaluation system",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Request/Response Models
class DeviceInput(BaseModel):
    device_type: str
    brand: str
    age: int
    condition: int
    user_id: Optional[str] = "default"

class PickupRequest(BaseModel):
    user_id: Optional[str] = "default"
    address: str
    zipcode: str
    retailer_id: int
    pickup_date: str
    pickup_time: str
    device_type: str
    additional_notes: Optional[str] = ""

class UserChoiceRequest(BaseModel):
    user_id: Optional[str] = "default"
    evaluation_id: str
    chosen_option: str  # "Resell", "Repair", or "Recycle"

# Endpoints
@app.get("/")
def root():
    return {
        "message": "Welcome to EcoTech Device Evaluator API",
        "version": "1.0.0",
        "endpoints": {
            "evaluate": "/evaluate",
            "analyze_image": "/analyze-image",
            "progress": "/progress/{user_id}",
            "leaderboard": "/leaderboard",
            "retailers": "/retailers",
            "schedule_pickup": "/schedule-pickup",
            "device_options": "/device-options"
        }
    }

@app.get("/device-options")
def get_device_options():
    """Get available device types, brands, and condition options"""
    return {
        "device_types": list(DEVICE_CONFIGS.keys()),
        "brands": list(BRAND_PREMIUMS.keys()),
        "conditions": [
            {"value": k, "name": v["name"], "description": v["description"]} 
            for k, v in CONDITION_FACTORS.items()
        ]
    }

@app.post("/evaluate")
def evaluate_device(input_data: DeviceInput):
    """Evaluate a device and get AI recommendation"""
    try:
        result = full_ai_decision(input_data.dict())
        
        # Generate evaluation ID
        result["evaluation_id"] = str(uuid.uuid4())
        
        # Update user progress
        progress = update_user_progress(input_data.user_id, result)
        result["user_progress"] = {
            "eco_points": progress["eco_points"],
            "level": progress["level"],
            "devices_evaluated": progress["devices_evaluated"]
        }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_device_image(file: UploadFile = File(...)):
    """Analyze uploaded device image"""
    try:
        # Save uploaded file
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.{file_extension}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze image
        result = analyze_image(file_path)
        
        # Clean up
        try:
            os.remove(file_path)
        except:
            pass
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress/{user_id}")
def get_progress(user_id: str = "default"):
    """Get user progress and statistics"""
    progress = get_user_progress(user_id)
    
    # Calculate additional stats
    level_progress = (progress["eco_points"] % 100) / 100 * 100
    next_level_points = (progress["level"]) * 100
    
    return {
        **progress,
        "level_progress": level_progress,
        "next_level_points": next_level_points,
        "points_to_next_level": next_level_points - progress["eco_points"]
    }

@app.get("/leaderboard")
def get_leaderboard():
    """Get global leaderboard"""
    return {
        "leaderboard": get_global_leaderboard(),
        "updated_at": datetime.now().isoformat()
    }

@app.get("/retailers")
def get_retailers(zipcode: Optional[str] = None):
    """Get nearby retailers for pickup"""
    return {
        "retailers": get_nearby_retailers(zipcode),
        "zipcode": zipcode
    }

@app.post("/schedule-pickup")
def schedule_pickup(request: PickupRequest):
    """Schedule a pickup for recycling"""
    try:
        # In production, this would save to database and send notifications
        pickup_id = str(uuid.uuid4())[:8].upper()
        
        return {
            "success": True,
            "pickup_id": pickup_id,
            "message": f"Pickup scheduled successfully! Your confirmation ID is {pickup_id}",
            "details": {
                "pickup_id": pickup_id,
                "address": request.address,
                "zipcode": request.zipcode,
                "retailer_id": request.retailer_id,
                "scheduled_date": request.pickup_date,
                "scheduled_time": request.pickup_time,
                "device_type": request.device_type,
                "status": "confirmed",
                "eco_points_earned": 25
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user-choice")
def record_user_choice(request: UserChoiceRequest):
    """Record user's final choice after evaluation"""
    progress = get_user_progress(request.user_id)
    
    # Award bonus points for making a decision
    bonus_points = {
        "Resell": 15,
        "Repair": 20,
        "Recycle": 25
    }.get(request.chosen_option, 10)
    
    progress["eco_points"] += bonus_points
    progress["points_history"].append({
        "date": datetime.now().isoformat(),
        "points": bonus_points,
        "action": f"Chose to {request.chosen_option.lower()} device"
    })
    
    return {
        "success": True,
        "bonus_points": bonus_points,
        "total_points": progress["eco_points"],
        "message": f"Great choice! You earned {bonus_points} bonus eco points for choosing to {request.chosen_option.lower()}."
    }

@app.get("/stats/global")
def get_global_stats():
    """Get global platform statistics"""
    return {
        "total_devices_evaluated": 15847,
        "total_co2_saved": 423560,
        "total_materials_recovered": 89420,
        "active_users": 3254,
        "top_recycled_devices": [
            {"device": "Smartphone", "count": 6234},
            {"device": "Laptop", "count": 3892},
            {"device": "Tablet", "count": 2156},
            {"device": "Desktop", "count": 1834},
            {"device": "Other", "count": 1731}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
