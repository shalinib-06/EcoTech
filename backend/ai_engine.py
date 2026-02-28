import joblib
import numpy as np
import pandas as pd
import random
import os
import json
from pathlib import Path

# Get the base path for models
BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"
TECHDIVATHON_DIR = BASE_DIR.parent / "techdivathon"

# Load models with error handling
def load_model_safe(path):
    try:
        return joblib.load(path)
    except Exception as e:
        print(f"Warning: Could not load model at {path}: {e}")
        return None

# Load backend models
resale_model = load_model_safe(MODELS_DIR / "resale_model.pkl")
recycle_profit_model = load_model_safe(MODELS_DIR / "recycle_profit_model.pkl")
recycle_score_model = load_model_safe(MODELS_DIR / "recycle_score_model.pkl")

# Load techdivathon models
market_price_model = load_model_safe(TECHDIVATHON_DIR / "market_price_model.pkl")
market_encoders = load_model_safe(TECHDIVATHON_DIR / "market_encoders.pkl")
resale_encoders = load_model_safe(TECHDIVATHON_DIR / "resale_encoders.pkl")
recycle_classifier = load_model_safe(TECHDIVATHON_DIR / "recycle_classifier.pkl")
recycle_encoders = load_model_safe(TECHDIVATHON_DIR / "recycle_encoders.pkl")

# Load component labels
try:
    with open(TECHDIVATHON_DIR / "component_labels.json") as f:
        component_labels = json.load(f)
        component_labels_reverse = {v: k for k, v in component_labels.items()}
except:
    component_labels = {}
    component_labels_reverse = {}

# Try to load TensorFlow model for image classification
component_model = None
try:
    import tensorflow as tf
    component_model = tf.keras.models.load_model(TECHDIVATHON_DIR / "component_classifier.keras")
except Exception as e:
    print(f"Warning: Could not load TensorFlow model: {e}")

# Device type configurations
DEVICE_CONFIGS = {
    "smartphone": {
        "base_value": 15000,
        "depreciation_rate": 0.15,
        "repair_base": 2000,
        "materials": {"gold": (0.02, 0.05), "silver": (0.2, 0.5), "copper": (8, 15), "aluminum": (5, 12), "lithium": (3, 8)},
        "co2_factor": 70,
        "weight_kg": 0.2
    },
    "laptop": {
        "base_value": 45000,
        "depreciation_rate": 0.12,
        "repair_base": 4000,
        "materials": {"gold": (0.1, 0.3), "silver": (0.5, 1.5), "copper": (50, 150), "aluminum": (100, 300), "lithium": (15, 40)},
        "co2_factor": 350,
        "weight_kg": 2.5
    },
    "tablet": {
        "base_value": 25000,
        "depreciation_rate": 0.14,
        "repair_base": 3000,
        "materials": {"gold": (0.03, 0.08), "silver": (0.3, 0.8), "copper": (15, 40), "aluminum": (30, 80), "lithium": (8, 20)},
        "co2_factor": 120,
        "weight_kg": 0.5
    },
    "smartwatch": {
        "base_value": 12000,
        "depreciation_rate": 0.18,
        "repair_base": 1500,
        "materials": {"gold": (0.01, 0.03), "silver": (0.1, 0.3), "copper": (3, 8), "aluminum": (5, 15), "lithium": (1, 3)},
        "co2_factor": 25,
        "weight_kg": 0.05
    },
    "desktop": {
        "base_value": 55000,
        "depreciation_rate": 0.10,
        "repair_base": 5000,
        "materials": {"gold": (0.2, 0.5), "silver": (1, 3), "copper": (200, 500), "aluminum": (300, 800), "steel": (1000, 3000)},
        "co2_factor": 500,
        "weight_kg": 10
    },
    "television": {
        "base_value": 35000,
        "depreciation_rate": 0.12,
        "repair_base": 4500,
        "materials": {"gold": (0.05, 0.15), "silver": (0.3, 1), "copper": (100, 300), "aluminum": (200, 500), "plastic": (500, 1500)},
        "co2_factor": 300,
        "weight_kg": 15
    },
    "gaming_console": {
        "base_value": 40000,
        "depreciation_rate": 0.13,
        "repair_base": 3500,
        "materials": {"gold": (0.08, 0.2), "silver": (0.4, 1), "copper": (80, 200), "aluminum": (100, 250), "plastic": (200, 500)},
        "co2_factor": 200,
        "weight_kg": 3.5
    },
    "headphones": {
        "base_value": 8000,
        "depreciation_rate": 0.20,
        "repair_base": 800,
        "materials": {"gold": (0.005, 0.02), "silver": (0.05, 0.15), "copper": (5, 15), "aluminum": (10, 30), "plastic": (20, 60)},
        "co2_factor": 15,
        "weight_kg": 0.3
    },
    "camera": {
        "base_value": 50000,
        "depreciation_rate": 0.11,
        "repair_base": 5000,
        "materials": {"gold": (0.05, 0.15), "silver": (0.3, 0.8), "copper": (30, 80), "aluminum": (80, 200), "glass": (50, 150)},
        "co2_factor": 150,
        "weight_kg": 0.8
    },
    "printer": {
        "base_value": 15000,
        "depreciation_rate": 0.15,
        "repair_base": 2500,
        "materials": {"gold": (0.02, 0.06), "silver": (0.1, 0.3), "copper": (40, 100), "aluminum": (60, 150), "plastic": (300, 800)},
        "co2_factor": 100,
        "weight_kg": 5
    }
}

# Brand premium factors
BRAND_PREMIUMS = {
    "apple": 1.35,
    "samsung": 1.15,
    "google": 1.10,
    "sony": 1.12,
    "microsoft": 1.08,
    "dell": 1.05,
    "hp": 1.02,
    "lenovo": 1.03,
    "asus": 1.05,
    "lg": 1.02,
    "oneplus": 1.08,
    "xiaomi": 0.95,
    "realme": 0.90,
    "oppo": 0.92,
    "vivo": 0.90,
    "nokia": 0.95,
    "motorola": 0.93,
    "huawei": 0.88,
    "other": 0.85
}

# Condition descriptions and factors
CONDITION_FACTORS = {
    5: {"name": "Excellent", "factor": 1.0, "description": "Like new, no visible wear"},
    4: {"name": "Good", "factor": 0.75, "description": "Minor scratches, fully functional"},
    3: {"name": "Fair", "factor": 0.50, "description": "Visible wear, works well"},
    2: {"name": "Poor", "factor": 0.30, "description": "Significant wear, some issues"},
    1: {"name": "Very Poor", "factor": 0.15, "description": "Major damage, limited function"}
}

def calculate_age_depreciation(age_years, depreciation_rate):
    """Calculate depreciation based on age"""
    return (1 - depreciation_rate) ** age_years

def get_material_composition(device_type, condition):
    """Get estimated material composition for a device"""
    config = DEVICE_CONFIGS.get(device_type, DEVICE_CONFIGS["smartphone"])
    materials = {}
    condition_factor = CONDITION_FACTORS.get(condition, CONDITION_FACTORS[3])["factor"]
    
    for material, (min_val, max_val) in config["materials"].items():
        # Random value weighted by condition
        base_amount = random.uniform(min_val, max_val)
        recoverable = base_amount * (0.5 + condition_factor * 0.5)
        materials[material] = round(recoverable, 2)
    
    return materials

def calculate_environmental_impact(device_type, condition, decision):
    """Calculate environmental impact metrics"""
    config = DEVICE_CONFIGS.get(device_type, DEVICE_CONFIGS["smartphone"])
    
    # Base CO2 savings from not manufacturing new
    co2_base = config["co2_factor"]
    weight = config["weight_kg"]
    
    # Adjust based on decision
    if decision == "Resell":
        co2_saved = int(co2_base * 0.9)  # High savings from reuse
        materials_recovered = int(weight * 1000 * 0.1)  # Minimal material recovery
        landfill_diverted = round(weight * 0.95, 2)
        circularity_score = random.randint(85, 98)
    elif decision == "Repair":
        co2_saved = int(co2_base * 0.7)  # Good savings from extended life
        materials_recovered = int(weight * 1000 * 0.15)
        landfill_diverted = round(weight * 0.90, 2)
        circularity_score = random.randint(75, 90)
    else:  # Recycle
        co2_saved = int(co2_base * 0.4)  # Moderate savings
        materials_recovered = int(weight * 1000 * 0.6)  # High material recovery
        landfill_diverted = round(weight * 0.85, 2)
        circularity_score = random.randint(60, 80)
    
    return {
        "co2_saved": co2_saved,
        "materials_recovered": materials_recovered,
        "landfill_diverted": landfill_diverted,
        "circularity_score": circularity_score,
        "trees_equivalent": round(co2_saved / 21, 1),  # Average tree absorbs 21kg CO2/year
        "water_saved": int(weight * 200),  # Liters of water saved
        "energy_saved": int(co2_saved * 2.5)  # kWh equivalent
    }

def generate_explanation(decision, device_type, brand, age, condition, resale_value, repair_cost, recycle_value):
    """Generate detailed explanation for the recommendation"""
    condition_name = CONDITION_FACTORS.get(condition, CONDITION_FACTORS[3])["name"]
    
    explanations = {
        "Resell": f"""Based on our AI analysis, **reselling** your {brand.title()} {device_type.replace('_', ' ')} is the optimal choice.

**Why Resell?**
• Your device is in **{condition_name}** condition with strong market demand
• Age of {age} year(s) is within the optimal resale window
• Estimated resale value of ₹{resale_value:,.0f} provides excellent return
• {brand.title()} devices maintain premium value in secondary markets

**Benefits:**
✓ Maximum financial return for your device
✓ Extends device lifecycle, reducing e-waste
✓ Helps someone access technology affordably
✓ Highest environmental impact score""",

        "Repair": f"""Based on our AI analysis, **repairing** your {brand.title()} {device_type.replace('_', ' ')} is the recommended path.

**Why Repair?**
• Repair cost of ₹{repair_cost:,.0f} is justified by potential value gain
• Post-repair resale value could reach ₹{resale_value:,.0f}
• Device core components are still valuable
• {condition_name} condition issues are typically repairable

**Benefits:**
✓ Cost-effective way to restore device value
✓ Significantly extends device lifespan
✓ Reduces demand for new manufacturing
✓ Strong circularity contribution""",

        "Recycle": f"""Based on our AI analysis, **recycling** your {brand.title()} {device_type.replace('_', ' ')} is the most responsible choice.

**Why Recycle?**
• Device condition ({condition_name}) limits resale/repair viability
• At {age} years old, technology may be significantly outdated
• Valuable materials can be recovered: gold, silver, copper, and more
• Estimated material recovery value: ₹{recycle_value:,.0f}

**Benefits:**
✓ Prevents hazardous materials from entering landfills
✓ Recovers precious metals for new products
✓ Reduces mining and environmental degradation
✓ Responsible end-of-life management"""
    }
    
    return explanations.get(decision, "Based on our analysis, this is the recommended option for your device.")

def full_ai_decision(data):
    """
    Complete AI decision engine for device evaluation
    """
    device_type = data.get("device_type", "smartphone").lower().replace(" ", "_")
    brand = data.get("brand", "other").lower()
    age = data.get("age", 2)
    condition = data.get("condition", 3)
    
    # Get device configuration
    config = DEVICE_CONFIGS.get(device_type, DEVICE_CONFIGS["smartphone"])
    brand_premium = BRAND_PREMIUMS.get(brand, BRAND_PREMIUMS["other"])
    condition_factor = CONDITION_FACTORS.get(condition, CONDITION_FACTORS[3])["factor"]
    
    # Calculate base values
    base_value = config["base_value"] * brand_premium
    age_depreciation = calculate_age_depreciation(age, config["depreciation_rate"])
    
    # Calculate resale value
    if resale_model is not None:
        try:
            resale_value = float(resale_model.predict([[age, condition]])[0])
        except:
            resale_value = base_value * age_depreciation * condition_factor
    else:
        resale_value = base_value * age_depreciation * condition_factor
    
    # Ensure reasonable minimum
    resale_value = max(500, resale_value)
    
    # Calculate repair cost
    repair_base = config["repair_base"]
    repair_multiplier = (5 - condition) / 3  # Higher cost for worse condition
    repair_cost = int(repair_base * repair_multiplier * random.uniform(0.8, 1.3))
    repair_cost = max(500, repair_cost)
    
    # Calculate post-repair value
    post_repair_value = resale_value * 1.4 if condition <= 3 else resale_value * 1.15
    
    # Calculate recycle value
    materials = get_material_composition(device_type, condition)
    # Material prices in INR per gram
    material_prices = {
        "gold": 5500,
        "silver": 75,
        "copper": 0.8,
        "aluminum": 0.18,
        "lithium": 50,
        "steel": 0.05,
        "plastic": 0.02,
        "glass": 0.01
    }
    
    recycle_value = sum(amount * material_prices.get(material, 0.1) 
                        for material, amount in materials.items())
    recycle_value = int(recycle_value * random.uniform(0.85, 1.15))
    recycle_value = max(200, recycle_value)
    
    # AI Decision Logic
    decision_scores = {
        "Resell": 0,
        "Repair": 0,
        "Recycle": 0
    }
    
    # Condition-based scoring
    if condition >= 4:
        decision_scores["Resell"] += 40
        decision_scores["Repair"] += 10
        decision_scores["Recycle"] += 5
    elif condition == 3:
        decision_scores["Resell"] += 20
        decision_scores["Repair"] += 30
        decision_scores["Recycle"] += 15
    elif condition == 2:
        decision_scores["Resell"] += 5
        decision_scores["Repair"] += 25
        decision_scores["Recycle"] += 30
    else:
        decision_scores["Resell"] += 0
        decision_scores["Repair"] += 10
        decision_scores["Recycle"] += 45
    
    # Age-based scoring
    if age <= 2:
        decision_scores["Resell"] += 25
        decision_scores["Repair"] += 20
    elif age <= 4:
        decision_scores["Resell"] += 15
        decision_scores["Repair"] += 25
        decision_scores["Recycle"] += 10
    else:
        decision_scores["Repair"] += 10
        decision_scores["Recycle"] += 25
    
    # Value-based scoring
    if resale_value > repair_cost * 2:
        decision_scores["Resell"] += 20
    if post_repair_value - repair_cost > resale_value:
        decision_scores["Repair"] += 20
    if recycle_value > resale_value * 0.3 and condition <= 2:
        decision_scores["Recycle"] += 15
    
    # Brand premium impact
    if brand_premium > 1.1:
        decision_scores["Resell"] += 10
        decision_scores["Repair"] += 10
    
    # Get decision
    decision = max(decision_scores, key=decision_scores.get)
    
    # Calculate confidence
    total_score = sum(decision_scores.values())
    confidence = (decision_scores[decision] / total_score * 100) if total_score > 0 else 75
    confidence = min(98, max(65, confidence + random.uniform(-5, 5)))
    
    # Get environmental impact
    impact = calculate_environmental_impact(device_type, condition, decision)
    
    # Generate explanation
    explanation = generate_explanation(
        decision, device_type, brand, age, condition,
        resale_value, repair_cost, recycle_value
    )
    
    # Calculate eco points for this evaluation
    eco_points = int(impact["co2_saved"] * 0.5 + impact["circularity_score"] * 0.3 + 10)
    
    return {
        "decision": decision,
        "confidence": round(confidence, 1),
        "resale_value": round(resale_value, 0),
        "repair_cost": repair_cost,
        "post_repair_value": round(post_repair_value, 0),
        "recycle_value": recycle_value,
        "materials": materials,
        "impact": impact,
        "explanation": explanation,
        "eco_points_earned": eco_points,
        "device_info": {
            "type": device_type,
            "brand": brand,
            "age": age,
            "condition": condition,
            "condition_name": CONDITION_FACTORS.get(condition, CONDITION_FACTORS[3])["name"]
        },
        "alternatives": {
            "Resell": {
                "value": round(resale_value, 0),
                "score": decision_scores["Resell"]
            },
            "Repair": {
                "cost": repair_cost,
                "potential_value": round(post_repair_value, 0),
                "score": decision_scores["Repair"]
            },
            "Recycle": {
                "value": recycle_value,
                "score": decision_scores["Recycle"]
            }
        }
    }

def analyze_image(image_path):
    """Analyze uploaded device image using the component classifier"""
    if component_model is None:
        return {
            "success": False,
            "message": "Image analysis model not available",
            "predicted_components": []
        }
    
    try:
        from tensorflow.keras.preprocessing import image
        
        IMG_SIZE = 224
        img = image.load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        prediction = component_model.predict(img_array)
        
        # Get top 5 predictions
        top_indices = np.argsort(prediction[0])[-5:][::-1]
        components = []
        
        for idx in top_indices:
            if idx in component_labels_reverse:
                components.append({
                    "component": component_labels_reverse[idx],
                    "confidence": round(float(prediction[0][idx]) * 100, 2)
                })
        
        return {
            "success": True,
            "predicted_components": components,
            "primary_component": components[0] if components else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "predicted_components": []
        }

# User progress tracking (in-memory for demo, use database in production)
user_progress = {}

def get_user_progress(user_id="default"):
    """Get or create user progress data"""
    if user_id not in user_progress:
        user_progress[user_id] = {
            "eco_points": 0,
            "devices_evaluated": 0,
            "total_co2_saved": 0,
            "level": 1,
            "points_history": [],
            "badges": [],
            "evaluations": []
        }
    return user_progress[user_id]

def update_user_progress(user_id, evaluation_result):
    """Update user progress after evaluation"""
    progress = get_user_progress(user_id)
    
    points = evaluation_result.get("eco_points_earned", 10)
    co2 = evaluation_result.get("impact", {}).get("co2_saved", 0)
    
    progress["eco_points"] += points
    progress["devices_evaluated"] += 1
    progress["total_co2_saved"] += co2
    
    # Update level
    progress["level"] = 1 + progress["eco_points"] // 100
    
    # Add to history
    from datetime import datetime
    progress["points_history"].append({
        "date": datetime.now().isoformat(),
        "points": points,
        "action": f"Evaluated {evaluation_result.get('device_info', {}).get('type', 'device')}"
    })
    
    # Check for badges
    check_badges(progress)
    
    return progress

def check_badges(progress):
    """Check and award badges based on progress"""
    badges = progress.get("badges", [])
    badge_ids = [b["id"] for b in badges]
    
    # Common badges
    if "first_eval" not in badge_ids and progress["devices_evaluated"] >= 1:
        badges.append({"id": "first_eval", "name": "First Step", "rarity": "common", "description": "Evaluated your first device"})
    
    if "eco_starter" not in badge_ids and progress["eco_points"] >= 50:
        badges.append({"id": "eco_starter", "name": "Eco Starter", "rarity": "common", "description": "Earned 50 eco points"})
    
    # Rare badges
    if "carbon_saver" not in badge_ids and progress["total_co2_saved"] >= 100:
        badges.append({"id": "carbon_saver", "name": "Carbon Saver", "rarity": "rare", "description": "Saved 100kg of CO2"})
    
    if "device_master" not in badge_ids and progress["devices_evaluated"] >= 10:
        badges.append({"id": "device_master", "name": "Device Master", "rarity": "rare", "description": "Evaluated 10 devices"})
    
    if "level_5" not in badge_ids and progress["level"] >= 5:
        badges.append({"id": "level_5", "name": "Rising Star", "rarity": "rare", "description": "Reached level 5"})
    
    # Epic badges
    if "eco_champion" not in badge_ids and progress["eco_points"] >= 500:
        badges.append({"id": "eco_champion", "name": "Eco Champion", "rarity": "epic", "description": "Earned 500 eco points"})
    
    if "planet_guardian" not in badge_ids and progress["total_co2_saved"] >= 500:
        badges.append({"id": "planet_guardian", "name": "Planet Guardian", "rarity": "epic", "description": "Saved 500kg of CO2"})
    
    if "level_10" not in badge_ids and progress["level"] >= 10:
        badges.append({"id": "level_10", "name": "Eco Legend", "rarity": "epic", "description": "Reached level 10"})
    
    progress["badges"] = badges

# Simulated global leaderboard
def get_global_leaderboard():
    """Get global leaderboard data"""
    leaderboard = [
        {"rank": 1, "name": "EcoWarrior23", "points": 2450, "level": 25, "co2_saved": 1230},
        {"rank": 2, "name": "GreenTech_Pro", "points": 2180, "level": 22, "co2_saved": 980},
        {"rank": 3, "name": "RecycleKing", "points": 1890, "level": 19, "co2_saved": 875},
        {"rank": 4, "name": "SustainableLife", "points": 1720, "level": 18, "co2_saved": 820},
        {"rank": 5, "name": "TechSaver99", "points": 1580, "level": 16, "co2_saved": 760},
        {"rank": 6, "name": "CircularEco", "points": 1420, "level": 15, "co2_saved": 690},
        {"rank": 7, "name": "GreenDevice", "points": 1350, "level": 14, "co2_saved": 645},
        {"rank": 8, "name": "EarthFirst", "points": 1280, "level": 13, "co2_saved": 610},
        {"rank": 9, "name": "ReuseMaster", "points": 1150, "level": 12, "co2_saved": 550},
        {"rank": 10, "name": "EcoTechie", "points": 1080, "level": 11, "co2_saved": 520},
    ]
    return leaderboard

# Retailer data for pickup scheduling
RETAILERS = [
    {"id": 1, "name": "EcoRecycle Hub - Central", "address": "123 Green Street, Downtown", "rating": 4.8, "distance": 2.5},
    {"id": 2, "name": "TechTrade Center", "address": "456 Tech Park Road", "rating": 4.6, "distance": 3.8},
    {"id": 3, "name": "GreenEarth Electronics", "address": "789 Sustainability Ave", "rating": 4.9, "distance": 5.2},
    {"id": 4, "name": "CircularTech Store", "address": "321 Recycle Lane", "rating": 4.5, "distance": 4.1},
    {"id": 5, "name": "EcoMart Electronics", "address": "654 Environment Blvd", "rating": 4.7, "distance": 6.3},
]

def get_nearby_retailers(zipcode=None):
    """Get list of nearby retailers based on zipcode"""
    retailers = RETAILERS.copy()
    # Simulate distance calculation based on zipcode
    if zipcode:
        for r in retailers:
            r["distance"] = round(random.uniform(1.5, 8.0), 1)
    retailers.sort(key=lambda x: x["distance"])
    return retailers
