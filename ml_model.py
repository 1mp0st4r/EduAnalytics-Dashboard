#!/usr/bin/env python3
"""
EduAnalytics ML Model Integration Service
Integrates the Jupyter notebook model with the Next.js application
"""

import pandas as pd
import numpy as np
import json
import sys
import os
from typing import Dict, List, Any
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

class EduAnalyticsMLModel:
    def __init__(self, model_path: str = None):
        """
        Initialize the ML model for dropout prediction
        
        Args:
            model_path: Path to saved model file (optional)
        """
        self.model = None
        self.feature_columns = [
            'Gender', 'AdmissionQuota', 'AccommodationType', 'IsRural', 'CommuteTimeMinutes',
            'FamilyAnnualIncome', 'NumberOfSiblings', 'FatherEducation', 'IsFatherLiterate', 
            'MotherEducation', 'IsMotherLiterate', 'IsFirstGenerationLearner', 'AvgPastPerformance', 
            'MediumChanged', 'AvgMarks_LatestTerm', 'MarksTrend', 'FailureRate_LatestTerm',
            'AvgAttendance_LatestTerm', 'WorksPartTime', 'IsPreparingCompetitiveExam',
            'HasOwnLaptop', 'HasReliableInternet'
        ]
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.train_model()
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess the data for ML model training/prediction
        
        Args:
            df: Raw dataframe
            
        Returns:
            Processed dataframe
        """
        # Create a copy to avoid modifying original
        processed_df = df.copy()
        
        # Handle categorical variables
        gender_mapping = {'Male': 1, 'Female': 0, 'Other': 0.5}
        processed_df['Gender'] = processed_df['Gender'].map(gender_mapping).fillna(0.5)
        
        # Accommodation type mapping
        accommodation_mapping = {
            'Hostel': 1, 'DayScholar': 0, 'PG': 0.5, 'Own House': 0.8
        }
        processed_df['AccommodationType'] = processed_df['AccommodationType'].map(accommodation_mapping).fillna(0)
        
        # Admission quota mapping
        quota_mapping = {
            'General': 0, 'OBC': 0.3, 'SC': 0.6, 'ST': 0.8, 'EWS': 0.4
        }
        processed_df['AdmissionQuota'] = processed_df['AdmissionQuota'].map(quota_mapping).fillna(0)
        
        # Education level mapping
        education_mapping = {
            'No Formal Education': 0,
            'Primary': 1,
            'Secondary': 2,
            'Higher Secondary': 3,
            'Graduate': 4,
            'Post Graduate': 5,
            'Doctorate': 6
        }
        processed_df['FatherEducation'] = processed_df['FatherEducation'].map(education_mapping).fillna(0)
        processed_df['MotherEducation'] = processed_df['MotherEducation'].map(education_mapping).fillna(0)
        
        # Boolean columns
        boolean_columns = [
            'IsRural', 'IsFatherLiterate', 'IsMotherLiterate', 'IsFirstGenerationLearner',
            'MediumChanged', 'WorksPartTime', 'IsPreparingCompetitiveExam',
            'HasOwnLaptop', 'HasReliableInternet', 'IsDropout'
        ]
        
        for col in boolean_columns:
            if col in processed_df.columns:
                processed_df[col] = processed_df[col].astype(str).str.upper().map({'TRUE': 1, 'FALSE': 0}).fillna(0)
        
        # Numeric columns - handle missing values
        numeric_columns = [
            'Age', 'CommuteTimeMinutes', 'FamilyAnnualIncome', 'NumberOfSiblings',
            'AvgPastPerformance', 'AvgMarks_LatestTerm', 'MarksTrend',
            'FailureRate_LatestTerm', 'AvgAttendance_LatestTerm'
        ]
        
        for col in numeric_columns:
            if col in processed_df.columns:
                processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce').fillna(0)
        
        return processed_df
    
    def train_model(self, csv_path: str = "final_synthetic_dropout_data_rajasthan.csv"):
        """
        Train the ML model using the CSV data
        
        Args:
            csv_path: Path to the CSV file
        """
        try:
            # Load data
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                print(f"✅ Loaded {len(df)} records from {csv_path}")
            else:
                print(f"❌ CSV file not found: {csv_path}")
                return
            
            # Preprocess data
            processed_df = self.preprocess_data(df)
            
            # Prepare features and target
            X = processed_df[self.feature_columns]
            y = processed_df['IsDropout']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            )
            
            self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            print(f"✅ Model trained successfully!")
            print(f"📊 Accuracy: {accuracy:.3f}")
            print(f"📈 Training samples: {len(X_train)}")
            print(f"📉 Test samples: {len(X_test)}")
            
            # Save model
            self.save_model("eduanalytics_model.pkl")
            
        except Exception as e:
            print(f"❌ Error training model: {str(e)}")
    
    def predict_dropout_risk(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict dropout risk for a single student
        
        Args:
            student_data: Dictionary containing student features
            
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            return {"error": "Model not trained or loaded"}
        
        try:
            # Convert to DataFrame
            df = pd.DataFrame([student_data])
            
            # Preprocess
            processed_df = self.preprocess_data(df)
            
            # Get features
            X = processed_df[self.feature_columns]
            
            # Make prediction
            dropout_probability = self.model.predict_proba(X)[0][1]
            dropout_prediction = self.model.predict(X)[0]
            
            # Get feature importance
            feature_importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            
            # Determine risk level
            if dropout_probability >= 0.8:
                risk_level = "Critical"
            elif dropout_probability >= 0.6:
                risk_level = "High"
            elif dropout_probability >= 0.4:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            # Calculate risk score (0-100)
            risk_score = int(dropout_probability * 100)
            
            return {
                "dropout_probability": float(dropout_probability),
                "dropout_prediction": bool(dropout_prediction),
                "risk_level": risk_level,
                "risk_score": risk_score,
                "feature_importance": feature_importance,
                "model_version": "v1.0"
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}
    
    def batch_predict(self, students_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict dropout risk for multiple students
        
        Args:
            students_data: List of student data dictionaries
            
        Returns:
            List of prediction results
        """
        results = []
        for student_data in students_data:
            result = self.predict_dropout_risk(student_data)
            result["student_id"] = student_data.get("StudentID", "unknown")
            results.append(result)
        
        return results
    
    def save_model(self, filepath: str):
        """Save the trained model to file"""
        try:
            joblib.dump(self.model, filepath)
            print(f"✅ Model saved to {filepath}")
        except Exception as e:
            print(f"❌ Error saving model: {str(e)}")
    
    def load_model(self, filepath: str):
        """Load a trained model from file"""
        try:
            self.model = joblib.load(filepath)
            print(f"✅ Model loaded from {filepath}")
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")

def main():
    """Main function for testing the ML model"""
    print("🚀 EduAnalytics ML Model Integration")
    print("=" * 50)
    
    # Initialize model
    ml_model = EduAnalyticsMLModel()
    
    # Test with sample data
    sample_student = {
        "StudentID": "TEST_001",
        "Gender": "Male",
        "AccommodationType": "DayScholar",
        "IsRural": "TRUE",
        "CommuteTimeMinutes": 45,
        "AdmissionQuota": "General",
        "FamilyAnnualIncome": 50000,
        "NumberOfSiblings": 2,
        "FatherEducation": "Secondary",
        "IsFatherLiterate": "TRUE",
        "MotherEducation": "Primary",
        "IsMotherLiterate": "TRUE",
        "IsFirstGenerationLearner": "FALSE",
        "AvgPastPerformance": 65,
        "MediumChanged": "FALSE",
        "AvgMarks_LatestTerm": 58,
        "MarksTrend": -5,
        "FailureRate_LatestTerm": 0.2,
        "AvgAttendance_LatestTerm": 72,
        "WorksPartTime": "FALSE",
        "IsPreparingCompetitiveExam": "TRUE",
        "HasOwnLaptop": "FALSE",
        "HasReliableInternet": "TRUE"
    }
    
    # Make prediction
    result = ml_model.predict_dropout_risk(sample_student)
    
    print("\n📊 Sample Prediction Result:")
    print(json.dumps(result, indent=2))
    
    print("\n✅ ML Model Integration Ready!")

if __name__ == "__main__":
    main()
