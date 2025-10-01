#!/usr/bin/env python3
"""
Simplified ML API Service for EduAnalytics
This version works without pandas/scikit-learn compilation issues
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn
import json

app = FastAPI(title="EduAnalytics ML API (Simple)", version="1.0.0")

class StudentData(BaseModel):
    StudentID: str
    Gender: str = "Male"
    AccommodationType: str = "DayScholar"
    IsRural: str = "FALSE"
    CommuteTimeMinutes: float = 30
    AdmissionQuota: str = "General"
    FamilyAnnualIncome: float = 50000
    NumberOfSiblings: int = 2
    FatherEducation: str = "Secondary"
    IsFatherLiterate: str = "TRUE"
    MotherEducation: str = "Primary"
    IsMotherLiterate: str = "TRUE"
    IsFirstGenerationLearner: str = "FALSE"
    AvgPastPerformance: float = 65
    MediumChanged: str = "FALSE"
    AvgMarks_LatestTerm: float = 60
    MarksTrend: float = 0
    FailureRate_LatestTerm: float = 0.1
    AvgAttendance_LatestTerm: float = 75
    WorksPartTime: str = "FALSE"
    IsPreparingCompetitiveExam: str = "TRUE"
    HasOwnLaptop: str = "FALSE"
    HasReliableInternet: str = "TRUE"

class PredictionRequest(BaseModel):
    student_data: StudentData

class PredictionResponse(BaseModel):
    student_id: str
    dropout_probability: float
    dropout_prediction: bool
    risk_level: str
    risk_score: int
    feature_importance: Dict[str, float]
    model_version: str

@app.get("/")
async def root():
    return {
        "message": "EduAnalytics ML API (Simplified)",
        "version": "1.0.0",
        "status": "running",
        "note": "Using simplified risk calculation algorithm"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "feature_count": 22,
        "model_type": "simplified_algorithm"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_single_student(request: PredictionRequest):
    """
    Predict dropout risk for a single student using simplified algorithm
    """
    try:
        student_dict = request.student_data.dict()
        
        # Simplified risk calculation algorithm
        risk_score = calculate_risk_score(student_dict)
        dropout_probability = calculate_dropout_probability(student_dict, risk_score)
        risk_level = get_risk_level(risk_score)
        
        # Feature importance (simplified)
        feature_importance = {
            "attendance": 0.25,
            "performance": 0.20,
            "family_income": 0.15,
            "rural_status": 0.10,
            "first_generation": 0.10,
            "siblings": 0.08,
            "part_time_work": 0.07,
            "technology_access": 0.05
        }
        
        return PredictionResponse(
            student_id=student_dict["StudentID"],
            dropout_probability=dropout_probability,
            dropout_prediction=dropout_probability > 0.5,
            risk_level=risk_level,
            risk_score=risk_score,
            feature_importance=feature_importance,
            model_version="v1.0-simplified"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_risk_score(student: Dict[str, Any]) -> int:
    """Simplified risk score calculation"""
    score = 0
    
    # Attendance factor (0-30 points)
    attendance = float(student.get("AvgAttendance_LatestTerm", 75))
    if attendance < 60:
        score += 30
    elif attendance < 70:
        score += 20
    elif attendance < 80:
        score += 10
    
    # Performance factor (0-25 points)
    performance = float(student.get("AvgMarks_LatestTerm", 60))
    if performance < 40:
        score += 25
    elif performance < 50:
        score += 20
    elif performance < 60:
        score += 15
    elif performance < 70:
        score += 10
    
    # Socioeconomic factors (0-20 points)
    if student.get("IsRural", "FALSE") == "TRUE":
        score += 5
    if student.get("IsFirstGenerationLearner", "FALSE") == "TRUE":
        score += 8
    siblings = int(student.get("NumberOfSiblings", 2))
    if siblings > 3:
        score += 4
    income = float(student.get("FamilyAnnualIncome", 50000))
    if income < 50000:
        score += 8
    
    # Academic factors (0-15 points)
    if student.get("MediumChanged", "FALSE") == "TRUE":
        score += 5
    if student.get("WorksPartTime", "FALSE") == "TRUE":
        score += 7
    failure_rate = float(student.get("FailureRate_LatestTerm", 0.1))
    if failure_rate > 0.3:
        score += 10
    
    # Technology access (0-10 points)
    if student.get("HasOwnLaptop", "FALSE") == "FALSE":
        score += 3
    if student.get("HasReliableInternet", "FALSE") == "FALSE":
        score += 4
    
    return min(score, 100)

def calculate_dropout_probability(student: Dict[str, Any], risk_score: int) -> float:
    """Calculate dropout probability from risk score"""
    base_probability = risk_score * 0.6
    
    # Additional factors
    attendance = float(student.get("AvgAttendance_LatestTerm", 75))
    performance = float(student.get("AvgMarks_LatestTerm", 60))
    
    if attendance < 50:
        base_probability += 15
    if performance < 30:
        base_probability += 10
    
    return min(base_probability / 100, 0.95)

def get_risk_level(score: int) -> str:
    """Convert risk score to risk level"""
    if score >= 80:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"

@app.get("/model/info")
async def get_model_info():
    """Get information about the simplified ML model"""
    return {
        "model_type": "Simplified Risk Algorithm",
        "feature_count": 22,
        "features": [
            "Gender", "AccommodationType", "IsRural", "CommuteTimeMinutes",
            "AdmissionQuota", "FamilyAnnualIncome", "NumberOfSiblings",
            "FatherEducation", "IsFatherLiterate", "MotherEducation",
            "IsMotherLiterate", "IsFirstGenerationLearner", "AvgPastPerformance",
            "MediumChanged", "AvgMarks_LatestTerm", "MarksTrend",
            "FailureRate_LatestTerm", "AvgAttendance_LatestTerm",
            "WorksPartTime", "IsPreparingCompetitiveExam",
            "HasOwnLaptop", "HasReliableInternet"
        ],
        "model_loaded": True,
        "version": "v1.0-simplified",
        "description": "Simplified risk assessment algorithm for immediate deployment"
    }

if __name__ == "__main__":
    print("🚀 Starting EduAnalytics ML API Server (Simplified)...")
    print("📊 Model Status: Loaded (Simplified Algorithm)")
    print("🌐 API Documentation: http://localhost:8001/docs")
    print("💡 This version uses a simplified algorithm to avoid compilation issues")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        reload=True
    )
