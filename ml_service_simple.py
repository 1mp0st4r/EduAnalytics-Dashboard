#!/usr/bin/env python3
"""
Simplified ML Service for EduAnalytics Dashboard
No external dependencies required - uses only Python standard library
"""

import json
import math
import random
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class MLService:
    """Simplified ML service for risk assessment and predictions"""
    
    def __init__(self):
        self.risk_weights = {
            'attendance': 0.3,
            'performance': 0.25,
            'behavior': 0.2,
            'socioeconomic': 0.15,
            'family': 0.1
        }
    
    def calculate_risk_score(self, student_data):
        """Calculate risk score based on student data"""
        try:
            attendance = float(student_data.get('attendance', 85))
            performance = float(student_data.get('performance', 70))
            
            # Normalize scores (higher is better)
            attendance_score = max(0, min(100, attendance))
            performance_score = max(0, min(100, performance))
            
            # Calculate base risk (inverted scores)
            attendance_risk = (100 - attendance_score) / 100
            performance_risk = (100 - performance_score) / 100
            
            # Add some randomness for realistic variation
            behavior_risk = random.uniform(0.1, 0.4)
            socioeconomic_risk = random.uniform(0.2, 0.6)
            family_risk = random.uniform(0.1, 0.3)
            
            # Weighted risk calculation
            total_risk = (
                attendance_risk * self.risk_weights['attendance'] +
                performance_risk * self.risk_weights['performance'] +
                behavior_risk * self.risk_weights['behavior'] +
                socioeconomic_risk * self.risk_weights['socioeconomic'] +
                family_risk * self.risk_weights['family']
            )
            
            # Convert to 0-100 scale
            risk_score = min(100, max(0, total_risk * 100))
            
            # Determine risk level
            if risk_score >= 80:
                risk_level = 'Critical'
                dropout_probability = random.uniform(0.7, 0.95)
            elif risk_score >= 60:
                risk_level = 'High'
                dropout_probability = random.uniform(0.4, 0.7)
            elif risk_score >= 40:
                risk_level = 'Medium'
                dropout_probability = random.uniform(0.2, 0.4)
            else:
                risk_level = 'Low'
                dropout_probability = random.uniform(0.05, 0.2)
            
            return {
                'risk_score': round(risk_score, 1),
                'risk_level': risk_level,
                'dropout_probability': round(dropout_probability * 100, 1),
                'factors': {
                    'attendance_impact': round(attendance_risk * 100, 1),
                    'performance_impact': round(performance_risk * 100, 1),
                    'behavior_impact': round(behavior_risk * 100, 1),
                    'socioeconomic_impact': round(socioeconomic_risk * 100, 1),
                    'family_impact': round(family_risk * 100, 1)
                },
                'recommendations': self._get_recommendations(risk_level, attendance, performance)
            }
        except Exception as e:
            return {
                'error': f'Risk calculation failed: {str(e)}',
                'risk_score': 50,
                'risk_level': 'Medium',
                'dropout_probability': 25
            }
    
    def _get_recommendations(self, risk_level, attendance, performance):
        """Generate intervention recommendations"""
        recommendations = []
        
        if attendance < 75:
            recommendations.append({
                'type': 'attendance_intervention',
                'priority': 'high',
                'description': 'Implement attendance tracking and parental notifications',
                'estimated_effectiveness': 0.8
            })
        
        if performance < 60:
            recommendations.append({
                'type': 'academic_support',
                'priority': 'high',
                'description': 'Provide tutoring and study resources',
                'estimated_effectiveness': 0.75
            })
        
        if risk_level in ['High', 'Critical']:
            recommendations.append({
                'type': 'counseling',
                'priority': 'critical',
                'description': 'Individual counseling and mentorship',
                'estimated_effectiveness': 0.85
            })
        
        return recommendations
    
    def predict_dropouts(self, students_data, timeframe='6months'):
        """Predict dropout probability for multiple students"""
        predictions = []
        
        for student in students_data:
            risk_assessment = self.calculate_risk_score(student)
            
            # Adjust prediction based on timeframe
            timeframe_multiplier = {
                '1month': 0.1,
                '3months': 0.3,
                '6months': 0.6,
                '1year': 1.0
            }.get(timeframe, 0.6)
            
            predicted_dropout = risk_assessment['dropout_probability'] * timeframe_multiplier
            
            predictions.append({
                'student_id': student.get('id', 'unknown'),
                'student_name': student.get('name', 'Unknown'),
                'current_risk_level': risk_assessment['risk_level'],
                'predicted_dropout_probability': round(predicted_dropout, 1),
                'confidence': random.uniform(0.7, 0.95),
                'timeframe': timeframe,
                'interventions_needed': len(risk_assessment['recommendations'])
            })
        
        return predictions
    
    def generate_insights(self, students_data):
        """Generate analytical insights"""
        if not students_data:
            return {'error': 'No student data provided'}
        
        total_students = len(students_data)
        risk_distribution = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
        total_attendance = 0
        total_performance = 0
        
        for student in students_data:
            risk_assessment = self.calculate_risk_score(student)
            risk_distribution[risk_assessment['risk_level']] += 1
            total_attendance += float(student.get('attendance', 85))
            total_performance += float(student.get('performance', 70))
        
        avg_attendance = total_attendance / total_students
        avg_performance = total_performance / total_students
        
        return {
            'total_students': total_students,
            'risk_distribution': risk_distribution,
            'average_attendance': round(avg_attendance, 1),
            'average_performance': round(avg_performance, 1),
            'at_risk_students': risk_distribution['High'] + risk_distribution['Critical'],
            'critical_students': risk_distribution['Critical'],
            'insights': {
                'attendance_concern': avg_attendance < 80,
                'performance_concern': avg_performance < 70,
                'high_risk_percentage': round((risk_distribution['High'] + risk_distribution['Critical']) / total_students * 100, 1),
                'recommended_interventions': self._get_global_recommendations(risk_distribution, avg_attendance, avg_performance)
            }
        }
    
    def _get_global_recommendations(self, risk_distribution, avg_attendance, avg_performance):
        """Generate global intervention recommendations"""
        recommendations = []
        
        if risk_distribution['Critical'] > 0:
            recommendations.append({
                'type': 'emergency_intervention',
                'description': f'Immediate intervention needed for {risk_distribution["Critical"]} critical risk students',
                'priority': 'critical',
                'estimated_cost': risk_distribution['Critical'] * 1000
            })
        
        if avg_attendance < 80:
            recommendations.append({
                'type': 'attendance_program',
                'description': 'Implement school-wide attendance improvement program',
                'priority': 'high',
                'estimated_cost': 5000
            })
        
        if avg_performance < 70:
            recommendations.append({
                'type': 'academic_support',
                'description': 'Expand tutoring and academic support services',
                'priority': 'high',
                'estimated_cost': 8000
            })
        
        return recommendations

class MLRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for ML service"""
    
    def __init__(self, *args, **kwargs):
        self.ml_service = MLService()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        if path == '/health':
            self._send_json_response({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
        elif path == '/predictions':
            self._handle_predictions(query_params)
        elif path == '/insights':
            self._handle_insights(query_params)
        else:
            self._send_error(404, 'Endpoint not found')
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/risk-assessment':
            self._handle_risk_assessment()
        elif path == '/predict-dropouts':
            self._handle_predict_dropouts()
        elif path == '/generate-insights':
            self._handle_generate_insights()
        else:
            self._send_error(404, 'Endpoint not found')
    
    def _handle_predictions(self, query_params):
        """Handle predictions endpoint"""
        timeframe = query_params.get('timeframe', ['6months'])[0]
        
        # Mock student data for demonstration
        mock_students = [
            {'id': '1', 'name': 'John Doe', 'attendance': 85, 'performance': 75},
            {'id': '2', 'name': 'Jane Smith', 'attendance': 92, 'performance': 88},
            {'id': '3', 'name': 'Bob Johnson', 'attendance': 65, 'performance': 55}
        ]
        
        predictions = self.ml_service.predict_dropouts(mock_students, timeframe)
        self._send_json_response({
            'success': True,
            'data': predictions,
            'timeframe': timeframe,
            'timestamp': datetime.now().isoformat()
        })
    
    def _handle_insights(self, query_params):
        """Handle insights endpoint"""
        # Mock student data for demonstration
        mock_students = [
            {'id': '1', 'name': 'John Doe', 'attendance': 85, 'performance': 75},
            {'id': '2', 'name': 'Jane Smith', 'attendance': 92, 'performance': 88},
            {'id': '3', 'name': 'Bob Johnson', 'attendance': 65, 'performance': 55},
            {'id': '4', 'name': 'Alice Brown', 'attendance': 78, 'performance': 82},
            {'id': '5', 'name': 'Charlie Wilson', 'attendance': 88, 'performance': 91}
        ]
        
        insights = self.ml_service.generate_insights(mock_students)
        self._send_json_response({
            'success': True,
            'data': insights,
            'timestamp': datetime.now().isoformat()
        })
    
    def _handle_risk_assessment(self):
        """Handle risk assessment POST request"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            student_data = json.loads(post_data.decode('utf-8'))
            
            risk_assessment = self.ml_service.calculate_risk_score(student_data)
            
            self._send_json_response({
                'success': True,
                'data': risk_assessment,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self._send_error(400, f'Invalid request: {str(e)}')
    
    def _handle_predict_dropouts(self):
        """Handle predict dropouts POST request"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            students_data = request_data.get('students', [])
            timeframe = request_data.get('timeframe', '6months')
            
            predictions = self.ml_service.predict_dropouts(students_data, timeframe)
            
            self._send_json_response({
                'success': True,
                'data': predictions,
                'timeframe': timeframe,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self._send_error(400, f'Invalid request: {str(e)}')
    
    def _handle_generate_insights(self):
        """Handle generate insights POST request"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            students_data = request_data.get('students', [])
            insights = self.ml_service.generate_insights(students_data)
            
            self._send_json_response({
                'success': True,
                'data': insights,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self._send_error(400, f'Invalid request: {str(e)}')
    
    def _send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))
    
    def _send_error(self, status_code, message):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_response = {
            'success': False,
            'error': message,
            'timestamp': datetime.now().isoformat()
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_ml_service(port=8001):
    """Start the ML service server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MLRequestHandler)
    
    print(f"🚀 Starting Simplified ML Service on http://localhost:{port}")
    print(f"📊 Health Check: http://localhost:{port}/health")
    print(f"🔮 Predictions: http://localhost:{port}/predictions")
    print(f"📈 Insights: http://localhost:{port}/insights")
    print("💡 Using simplified algorithms (no external dependencies)")
    print("To stop the service, press Ctrl+C")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down ML service...")
        httpd.server_close()

if __name__ == '__main__':
    start_ml_service()
