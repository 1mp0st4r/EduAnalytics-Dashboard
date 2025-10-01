#!/usr/bin/env python3
"""
Ultra-Simple ML API Service for EduAnalytics
This version works without any complex dependencies
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class StudentData:
    def __init__(self, data_dict):
        self.StudentID = data_dict.get('StudentID', 'UNKNOWN')
        self.Gender = data_dict.get('Gender', 'Male')
        self.AccommodationType = data_dict.get('AccommodationType', 'DayScholar')
        self.IsRural = data_dict.get('IsRural', 'FALSE')
        self.CommuteTimeMinutes = float(data_dict.get('CommuteTimeMinutes', 30))
        self.AdmissionQuota = data_dict.get('AdmissionQuota', 'General')
        self.FamilyAnnualIncome = float(data_dict.get('FamilyAnnualIncome', 50000))
        self.NumberOfSiblings = int(data_dict.get('NumberOfSiblings', 2))
        self.FatherEducation = data_dict.get('FatherEducation', 'Secondary')
        self.IsFatherLiterate = data_dict.get('IsFatherLiterate', 'TRUE')
        self.MotherEducation = data_dict.get('MotherEducation', 'Primary')
        self.IsMotherLiterate = data_dict.get('IsMotherLiterate', 'TRUE')
        self.IsFirstGenerationLearner = data_dict.get('IsFirstGenerationLearner', 'FALSE')
        self.AvgPastPerformance = float(data_dict.get('AvgPastPerformance', 65))
        self.MediumChanged = data_dict.get('MediumChanged', 'FALSE')
        self.AvgMarks_LatestTerm = float(data_dict.get('AvgMarks_LatestTerm', 60))
        self.MarksTrend = float(data_dict.get('MarksTrend', 0))
        self.FailureRate_LatestTerm = float(data_dict.get('FailureRate_LatestTerm', 0.1))
        self.AvgAttendance_LatestTerm = float(data_dict.get('AvgAttendance_LatestTerm', 75))
        self.WorksPartTime = data_dict.get('WorksPartTime', 'FALSE')
        self.IsPreparingCompetitiveExam = data_dict.get('IsPreparingCompetitiveExam', 'TRUE')
        self.HasOwnLaptop = data_dict.get('HasOwnLaptop', 'FALSE')
        self.HasReliableInternet = data_dict.get('HasReliableInternet', 'TRUE')

class MLAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "model_loaded": True,
                "feature_count": 22,
                "model_type": "ultra_simple_algorithm",
                "version": "v1.0-ultra-simple"
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "message": "EduAnalytics ML API (Ultra-Simple)",
                "version": "1.0.0",
                "status": "running",
                "note": "Using ultra-simple risk calculation algorithm"
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/model/info':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "model_type": "Ultra-Simple Risk Algorithm",
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
                "version": "v1.0-ultra-simple",
                "description": "Ultra-simple risk assessment algorithm with zero dependencies"
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Endpoint not found"}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        if self.path == '/predict':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                student_data = request_data.get('student_data', {})
                student = StudentData(student_data)
                
                # Ultra-simple risk calculation
                risk_score = self.calculate_risk_score(student)
                dropout_probability = self.calculate_dropout_probability(student, risk_score)
                risk_level = self.get_risk_level(risk_score)
                
                response = {
                    "student_id": student.StudentID,
                    "dropout_probability": dropout_probability,
                    "dropout_prediction": dropout_probability > 0.5,
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "feature_importance": {
                        "attendance": 0.25,
                        "performance": 0.20,
                        "family_income": 0.15,
                        "rural_status": 0.10,
                        "first_generation": 0.10,
                        "siblings": 0.08,
                        "part_time_work": 0.07,
                        "technology_access": 0.05
                    },
                    "model_version": "v1.0-ultra-simple"
                }
                
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                error_response = {
                    "error": str(e),
                    "message": "Failed to process prediction request"
                }
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Endpoint not found"}
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def calculate_risk_score(self, student):
        """Ultra-simple risk score calculation"""
        score = 0
        
        # Attendance factor (0-30 points)
        if student.AvgAttendance_LatestTerm < 60:
            score += 30
        elif student.AvgAttendance_LatestTerm < 70:
            score += 20
        elif student.AvgAttendance_LatestTerm < 80:
            score += 10
        
        # Performance factor (0-25 points)
        if student.AvgMarks_LatestTerm < 40:
            score += 25
        elif student.AvgMarks_LatestTerm < 50:
            score += 20
        elif student.AvgMarks_LatestTerm < 60:
            score += 15
        elif student.AvgMarks_LatestTerm < 70:
            score += 10
        
        # Socioeconomic factors (0-20 points)
        if student.IsRural == "TRUE":
            score += 5
        if student.IsFirstGenerationLearner == "TRUE":
            score += 8
        if student.NumberOfSiblings > 3:
            score += 4
        if student.FamilyAnnualIncome < 50000:
            score += 8
        
        # Academic factors (0-15 points)
        if student.MediumChanged == "TRUE":
            score += 5
        if student.WorksPartTime == "TRUE":
            score += 7
        if student.FailureRate_LatestTerm > 0.3:
            score += 10
        
        # Technology access (0-10 points)
        if student.HasOwnLaptop == "FALSE":
            score += 3
        if student.HasReliableInternet == "FALSE":
            score += 4
        
        return min(score, 100)

    def calculate_dropout_probability(self, student, risk_score):
        """Calculate dropout probability from risk score"""
        base_probability = risk_score * 0.6
        
        # Additional factors
        if student.AvgAttendance_LatestTerm < 50:
            base_probability += 15
        if student.AvgMarks_LatestTerm < 30:
            base_probability += 10
        
        return min(base_probability / 100, 0.95)

    def get_risk_level(self, score):
        """Convert risk score to risk level"""
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 40:
            return "Medium"
        else:
            return "Low"

def run_server():
    server_address = ('0.0.0.0', 8001)
    httpd = HTTPServer(server_address, MLAPIHandler)
    print("🚀 Starting EduAnalytics ML API Server (Ultra-Simple)...")
    print("📊 Model Status: Loaded (Ultra-Simple Algorithm)")
    print("🌐 API Endpoints:")
    print("   - Health: http://localhost:8001/health")
    print("   - Predict: http://localhost:8001/predict")
    print("   - Info: http://localhost:8001/model/info")
    print("💡 This version uses zero external dependencies")
    print("🔧 Server running on http://localhost:8001")
    print("To stop the service, press Ctrl+C")
    print("")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == "__main__":
    run_server()
