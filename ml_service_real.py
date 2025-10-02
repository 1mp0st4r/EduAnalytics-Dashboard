#!/usr/bin/env python3
"""
REAL ML Service for EduAnalytics Dashboard
Uses actual XGBoost model and SHAP analysis from Jupyter notebook
"""

import pandas as pd
import numpy as np
import json
import os
import sys
import joblib
import shap
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
from typing import Dict, List, Any, Optional

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from ml_model import EduAnalyticsMLModel
    ML_MODEL_AVAILABLE = True
except ImportError:
    ML_MODEL_AVAILABLE = False
    print("Warning: ml_model.py not available, using fallback")

class RealMLService:
    """Real ML service using actual XGBoost model and SHAP analysis"""
    
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_columns = [
            'Gender', 'AdmissionQuota', 'AccommodationType', 'IsRural', 'CommuteTimeMinutes',
            'FamilyAnnualIncome', 'NumberOfSiblings', 'FatherEducation', 'IsFatherLiterate', 
            'MotherEducation', 'IsMotherLiterate', 'IsFirstGenerationLearner', 'AvgPastPerformance', 
            'MediumChanged', 'AvgMarks_LatestTerm', 'MarksTrend', 'FailureRate_LatestTerm',
            'AvgAttendance_LatestTerm', 'WorksPartTime', 'IsPreparingCompetitiveExam',
            'HasOwnLaptop', 'HasReliableInternet'
        ]
        self.categorical_features = [
            'Gender', 'AdmissionQuota', 'AccommodationType', 'FatherEducation', 'MotherEducation'
        ]
        
        # Initialize the model
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize the real ML model"""
        try:
            if ML_MODEL_AVAILABLE:
                print("Loading real ML model...")
                self.ml_model = EduAnalyticsMLModel()
                self.model = self.ml_model.model
                
                # Create SHAP explainer if model is available
                if self.model is not None:
                    try:
                        self.explainer = shap.TreeExplainer(self.model)
                        print("✅ SHAP explainer initialized successfully")
                    except Exception as e:
                        print(f"Warning: Could not initialize SHAP explainer: {e}")
                        self.explainer = None
                else:
                    print("Warning: No trained model available")
            else:
                print("Warning: ML model not available, using simplified fallback")
                self.model = None
                self.explainer = None
        except Exception as e:
            print(f"Error initializing ML model: {e}")
            self.model = None
            self.explainer = None
    
    def preprocess_student_data(self, student_data: Dict) -> pd.DataFrame:
        """Preprocess student data for prediction"""
        try:
            # Create a DataFrame with the student data
            df_data = {}
            
            # Map student data to model features
            for feature in self.feature_columns:
                if feature in student_data:
                    df_data[feature] = [student_data[feature]]
                else:
                    # Provide default values for missing features
                    if feature in ['Gender', 'AdmissionQuota', 'AccommodationType']:
                        df_data[feature] = ['Unknown']
                    elif feature in ['FatherEducation', 'MotherEducation']:
                        df_data[feature] = ['Primary']
                    elif feature in ['IsRural', 'IsFatherLiterate', 'IsMotherLiterate', 
                                   'IsFirstGenerationLearner', 'MediumChanged', 'WorksPartTime',
                                   'IsPreparingCompetitiveExam', 'HasOwnLaptop', 'HasReliableInternet']:
                        df_data[feature] = [False]
                    else:
                        df_data[feature] = [0]
            
            df = pd.DataFrame(df_data)
            
            # Convert categorical features to appropriate types
            for feature in self.categorical_features:
                if feature in df.columns:
                    df[feature] = df[feature].astype('category')
            
            # Convert boolean features
            bool_features = ['IsRural', 'IsFatherLiterate', 'IsMotherLiterate', 
                           'IsFirstGenerationLearner', 'MediumChanged', 'WorksPartTime',
                           'IsPreparingCompetitiveExam', 'HasOwnLaptop', 'HasReliableInternet']
            
            for feature in bool_features:
                if feature in df.columns:
                    df[feature] = df[feature].astype(bool)
            
            # Convert numeric features
            numeric_features = ['CommuteTimeMinutes', 'FamilyAnnualIncome', 'NumberOfSiblings',
                              'AvgPastPerformance', 'AvgMarks_LatestTerm', 'MarksTrend',
                              'FailureRate_LatestTerm', 'AvgAttendance_LatestTerm']
            
            for feature in numeric_features:
                if feature in df.columns:
                    df[feature] = pd.to_numeric(df[feature], errors='coerce').fillna(0)
            
            return df
            
        except Exception as e:
            print(f"Error preprocessing student data: {e}")
            # Return minimal DataFrame if preprocessing fails
            return pd.DataFrame({col: [0] for col in self.feature_columns})
    
    def predict_dropout_risk(self, student_data: Dict) -> Dict[str, Any]:
        """Make real dropout risk prediction using trained model"""
        try:
            if self.model is None:
                return self._fallback_prediction(student_data)
            
            # Preprocess the data
            processed_data = self.preprocess_student_data(student_data)
            
            # Make prediction
            if hasattr(self.ml_model, 'predict_proba'):
                dropout_probability = self.ml_model.predict_proba(processed_data)[0][1]
            else:
                dropout_probability = self.model.predict_proba(processed_data)[0][1]
            
            # Generate SHAP explanation if available
            shap_values = None
            feature_importance = None
            
            if self.explainer is not None:
                try:
                    shap_values = self.explainer.shap_values(processed_data)
                    feature_importance = self._extract_feature_importance(shap_values, processed_data)
                except Exception as e:
                    print(f"Warning: Could not generate SHAP explanation: {e}")
                    feature_importance = self._generate_feature_importance_fallback(processed_data)
            else:
                feature_importance = self._generate_feature_importance_fallback(processed_data)
            
            # Determine risk level
            risk_level = self._determine_risk_level(dropout_probability)
            
            # Generate risk explanation
            risk_explanation = self._generate_risk_explanation(
                student_data, dropout_probability, feature_importance
            )
            
            return {
                'dropout_probability': float(dropout_probability),
                'risk_level': risk_level,
                'risk_score': int(dropout_probability * 100),
                'dropout_prediction': dropout_probability > 0.5,
                'feature_importance': feature_importance,
                'risk_explanation': risk_explanation,
                'model_version': 'xgboost_real_v1.0',
                'shap_available': self.explainer is not None,
                'prediction_timestamp': datetime.now().isoformat(),
                'data_source': 'REAL_ML_MODEL'
            }
            
        except Exception as e:
            print(f"Error in real prediction: {e}")
            return self._fallback_prediction(student_data)
    
    def _extract_feature_importance(self, shap_values: np.ndarray, processed_data: pd.DataFrame) -> Dict[str, float]:
        """Extract feature importance from SHAP values"""
        try:
            if len(shap_values.shape) > 1:
                shap_values = shap_values[0]  # Get first sample
            
            importance_dict = {}
            for i, feature in enumerate(processed_data.columns):
                if i < len(shap_values):
                    importance_dict[feature] = float(abs(shap_values[i]))
            
            # Sort by importance
            sorted_importance = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
            return sorted_importance
            
        except Exception as e:
            print(f"Error extracting feature importance: {e}")
            return self._generate_feature_importance_fallback(processed_data)
    
    def _generate_feature_importance_fallback(self, processed_data: pd.DataFrame) -> Dict[str, float]:
        """Generate feature importance when SHAP is not available"""
        # Simple heuristic-based feature importance
        importance_dict = {}
        
        for feature in processed_data.columns:
            value = processed_data[feature].iloc[0]
            
            if feature == 'AvgAttendance_LatestTerm':
                importance_dict[feature] = abs(100 - float(value)) / 100 * 0.3
            elif feature == 'AvgMarks_LatestTerm':
                importance_dict[feature] = abs(100 - float(value)) / 100 * 0.25
            elif feature == 'IsFirstGenerationLearner':
                importance_dict[feature] = 0.2 if bool(value) else 0.05
            elif feature == 'WorksPartTime':
                importance_dict[feature] = 0.15 if bool(value) else 0.02
            elif feature == 'MediumChanged':
                importance_dict[feature] = 0.15 if bool(value) else 0.02
            elif feature == 'FamilyAnnualIncome':
                importance_dict[feature] = max(0, (100000 - float(value)) / 100000) * 0.1
            else:
                importance_dict[feature] = 0.05
        
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    def _determine_risk_level(self, dropout_probability: float) -> str:
        """Determine risk level based on dropout probability"""
        if dropout_probability >= 0.7:
            return 'Critical'
        elif dropout_probability >= 0.5:
            return 'High'
        elif dropout_probability >= 0.3:
            return 'Medium'
        else:
            return 'Low'
    
    def _generate_risk_explanation(self, student_data: Dict, dropout_probability: float, 
                                 feature_importance: Dict) -> List[Dict]:
        """Generate detailed risk explanation"""
        explanations = []
        
        # Top 3 most important features
        top_features = list(feature_importance.keys())[:3]
        
        for feature in top_features:
            importance = feature_importance[feature]
            value = student_data.get(feature, 'Unknown')
            
            if feature == 'AvgAttendance_LatestTerm':
                if float(value) < 75:
                    explanations.append({
                        'factor': 'Attendance Rate',
                        'impact': 'High',
                        'description': f'Low attendance rate ({value}%) significantly increases dropout risk',
                        'recommendation': 'Implement attendance monitoring and family communication'
                    })
            
            elif feature == 'AvgMarks_LatestTerm':
                if float(value) < 60:
                    explanations.append({
                        'factor': 'Academic Performance',
                        'impact': 'High',
                        'description': f'Below-average performance ({value}%) indicates learning difficulties',
                        'recommendation': 'Provide additional academic support and tutoring'
                    })
            
            elif feature == 'IsFirstGenerationLearner':
                if bool(value):
                    explanations.append({
                        'factor': 'First Generation Learner',
                        'impact': 'Medium',
                        'description': 'Lack of family educational background increases risk',
                        'recommendation': 'Provide additional guidance and mentorship programs'
                    })
            
            elif feature == 'WorksPartTime':
                if bool(value):
                    explanations.append({
                        'factor': 'Part-time Employment',
                        'impact': 'Medium',
                        'description': 'Working part-time may impact academic focus',
                        'recommendation': 'Assess financial needs and provide support'
                    })
        
        return explanations
    
    def _fallback_prediction(self, student_data: Dict) -> Dict[str, Any]:
        """Fallback prediction when real model is not available"""
        print("Using fallback prediction - real model not available")
        
        # Simple heuristic-based prediction
        attendance = float(student_data.get('AvgAttendance_LatestTerm', 85))
        performance = float(student_data.get('AvgMarks_LatestTerm', 70))
        
        # Calculate basic risk score
        risk_score = 0
        if attendance < 75:
            risk_score += 30
        if performance < 60:
            risk_score += 25
        if student_data.get('IsFirstGenerationLearner', False):
            risk_score += 15
        if student_data.get('WorksPartTime', False):
            risk_score += 15
        if student_data.get('MediumChanged', False):
            risk_score += 10
        
        dropout_probability = min(risk_score / 100, 0.95)
        
        return {
            'dropout_probability': dropout_probability,
            'risk_level': self._determine_risk_level(dropout_probability),
            'risk_score': int(dropout_probability * 100),
            'dropout_prediction': dropout_probability > 0.5,
            'feature_importance': self._generate_feature_importance_fallback(
                self.preprocess_student_data(student_data)
            ),
            'risk_explanation': self._generate_risk_explanation(
                student_data, dropout_probability, {}
            ),
            'model_version': 'fallback_v1.0',
            'shap_available': False,
            'prediction_timestamp': datetime.now().isoformat(),
            'data_source': 'FALLBACK_ALGORITHM'
        }

class MLServiceHTTPHandler(BaseHTTPRequestHandler):
    """HTTP handler for the real ML service"""
    
    def __init__(self, *args, **kwargs):
        self.ml_service = RealMLService()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'service': 'EduAnalytics Real ML Service',
                'model_loaded': self.ml_service.model is not None,
                'shap_available': self.ml_service.explainer is not None,
                'timestamp': datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(response).encode())
        
        elif parsed_path.path == '/model-info':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'model_type': 'XGBoost' if self.ml_service.model is not None else 'Fallback',
                'features': self.ml_service.feature_columns,
                'shap_available': self.ml_service.explainer is not None,
                'version': 'real_v1.0'
            }
            
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/risk-assessment':
            self.handle_risk_assessment()
        elif self.path == '/predict':
            # Redirect /predict to /risk-assessment for compatibility
            self.handle_risk_assessment()
        else:
            self.send_response(404)
            self.end_headers()
    
    def handle_risk_assessment(self):
        """Handle risk assessment requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Extract student data
            if 'student_data' in request_data:
                student_data = request_data['student_data']
            else:
                student_data = request_data
            
            # Make prediction
            prediction_result = self.ml_service.predict_dropout_risk(student_data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(prediction_result).encode())
            
        except Exception as e:
            print(f"Error handling risk assessment: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': 'Internal server error',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_real_ml_service(port=8001):
    """Start the real ML service"""
    try:
        server = HTTPServer(('localhost', port), MLServiceHTTPHandler)
        print(f"🚀 Real ML Service starting on http://localhost:{port}")
        print("✅ Features:")
        print("   - Real XGBoost model integration")
        print("   - SHAP analysis for explanations")
        print("   - Feature importance extraction")
        print("   - Detailed risk explanations")
        print("   - Fallback for missing dependencies")
        print("\n📡 Available endpoints:")
        print(f"   - GET  http://localhost:{port}/health")
        print(f"   - GET  http://localhost:{port}/model-info")
        print(f"   - POST http://localhost:{port}/risk-assessment")
        print(f"   - POST http://localhost:{port}/predict (redirects to risk-assessment)")
        print("\n🔄 Starting server...")
        
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Real ML Service...")
        server.shutdown()
    except Exception as e:
        print(f"❌ Error starting Real ML Service: {e}")

if __name__ == "__main__":
    start_real_ml_service()
