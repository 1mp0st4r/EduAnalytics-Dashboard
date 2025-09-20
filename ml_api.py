#!/usr/bin/env python3
"""
EduAnalytics ML API Service
FastAPI service to integrate ML model with Next.js application
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import uvicorn
from ml_model import EduAnalyticsMLModel

app = FastAPI(title="EduAnalytics ML API", version="1.0.0")

# Initialize ML model
ml_model = EduAnalyticsMLModel()

class StudentData(BaseModel):
    StudentID: str
    Gender: str
    AccommodationType: str
    IsRural: str
    CommuteTimeMinutes: float
    AdmissionQuota: str
    FamilyAnnualIncome: float
    NumberOfSiblings: int
    FatherEducation: str
    IsFatherLiterate: str
    MotherEducation: str
    IsMotherLiterate: str
    IsFirstGenerationLearner: str
    AvgPastPerformance: float
    MediumChanged: str
    AvgMarks_LatestTerm: float
    MarksTrend: float
    FailureRate_LatestTerm: float
    AvgAttendance_LatestTerm: float
    WorksPartTime: str
    IsPreparingCompetitiveExam: str
    HasOwnLaptop: str
    HasReliableInternet: str

class PredictionRequest(BaseModel):
    student_data: StudentData

class BatchPredictionRequest(BaseModel):
    students_data: List[StudentData]

class PredictionResponse(BaseModel):
    student_id: str
    dropout_probability: float
    dropout_prediction: bool
    risk_level: str
    risk_score: int
    feature_importance: Dict[str, float]
    model_version: str

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    total_students: int
    model_version: str

@app.get("/")
async def root():
    return {
        "message": "EduAnalytics ML API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": ml_model.model is not None,
        "feature_count": len(ml_model.feature_columns)
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_single_student(request: PredictionRequest):
    """
    Predict dropout risk for a single student
    """
    try:
        # Convert Pydantic model to dict
        student_dict = request.student_data.dict()
        
        # Make prediction
        result = ml_model.predict_dropout_risk(student_dict)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return PredictionResponse(
            student_id=student_dict["StudentID"],
            dropout_probability=result["dropout_probability"],
            dropout_prediction=result["dropout_prediction"],
            risk_level=result["risk_level"],
            risk_score=result["risk_score"],
            feature_importance=result["feature_importance"],
            model_version=result["model_version"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch_students(request: BatchPredictionRequest):
    """
    Predict dropout risk for multiple students
    """
    try:
        # Convert Pydantic models to dicts
        students_dicts = [student.dict() for student in request.students_data]
        
        # Make batch prediction
        results = ml_model.batch_predict(students_dicts)
        
        # Convert to response format
        predictions = []
        for result in results:
            if "error" not in result:
                predictions.append(PredictionResponse(
                    student_id=result["student_id"],
                    dropout_probability=result["dropout_probability"],
                    dropout_prediction=result["dropout_prediction"],
                    risk_level=result["risk_level"],
                    risk_score=result["risk_score"],
                    feature_importance=result["feature_importance"],
                    model_version=result["model_version"]
                ))
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_students=len(predictions),
            model_version="v1.0"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/info")
async def get_model_info():
    """
    Get information about the loaded ML model
    """
    return {
        "model_type": "RandomForestClassifier",
        "feature_count": len(ml_model.feature_columns),
        "features": ml_model.feature_columns,
        "model_loaded": ml_model.model is not None,
        "version": "v1.0"
    }

@app.post("/model/retrain")
async def retrain_model():
    """
    Retrain the ML model with fresh data
    """
    try:
        ml_model.train_model()
        return {
            "message": "Model retrained successfully",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting EduAnalytics ML API Server...")
    print("📊 Model Status:", "Loaded" if ml_model.model is not None else "Training...")
    print("🌐 API Documentation: http://localhost:8001/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        reload=True
    )
