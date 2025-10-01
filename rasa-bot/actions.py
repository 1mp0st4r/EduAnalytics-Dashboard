#!/usr/bin/env python3
"""
Rasa Actions for EduAnalytics Chatbot
Custom actions to integrate with student data and provide personalized responses
"""

import requests
import logging
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import json

logger = logging.getLogger(__name__)

class StudentInfoAction(Action):
    """Action to fetch student information from the API"""
    
    def name(self) -> Text:
        return "StudentInfoAction"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get student ID from tracker or use default
        student_id = tracker.get_slot("student_id") or "RJ_2025"
        
        try:
            # Fetch student data from your API
            response = requests.get(f"http://localhost:3000/api/students/{student_id}")
            
            if response.status_code == 200:
                student_data = response.json()["data"]
                
                # Set slots with student information
                slots = [
                    SlotSet("student_name", student_data.get("StudentName", "Student")),
                    SlotSet("student_class", str(student_data.get("StudentClass", "Unknown"))),
                    SlotSet("attendance", float(student_data.get("AvgAttendance_LatestTerm", 0))),
                    SlotSet("performance", float(student_data.get("AvgMarks_LatestTerm", 0))),
                    SlotSet("risk_level", student_data.get("RiskLevel", "Unknown").lower()),
                    SlotSet("mentor_name", student_data.get("MentorName", "Your mentor")),
                    SlotSet("school_name", student_data.get("SchoolName", "Your school"))
                ]
                
                return slots
            else:
                logger.error(f"Failed to fetch student data: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching student data: {str(e)}")
            return []

class IssueReportAction(Action):
    """Action to handle issue reporting"""
    
    def name(self) -> Text:
        return "IssueReportAction"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the last user message
        last_message = tracker.latest_message.get("text", "")
        
        # Extract issue type from the message
        issue_type = "general"
        if any(word in last_message.lower() for word in ["attendance", "उपस्थिति"]):
            issue_type = "attendance"
        elif any(word in last_message.lower() for word in ["marks", "performance", "नंबर", "प्रदर्शन"]):
            issue_type = "academic"
        elif any(word in last_message.lower() for word in ["family", "परिवार"]):
            issue_type = "family"
        elif any(word in last_message.lower() for word in ["health", "स्वास्थ्य"]):
            issue_type = "health"
        
        # Store the issue for reporting
        slots = [SlotSet("issue_type", issue_type)]
        
        return slots

class StudyTipsAction(Action):
    """Action to provide personalized study tips based on student data"""
    
    def name(self) -> Text:
        return "StudyTipsAction"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get student performance data
        performance = tracker.get_slot("performance") or 0
        attendance = tracker.get_slot("attendance") or 0
        risk_level = tracker.get_slot("risk_level") or "unknown"
        
        # Provide personalized tips based on performance
        if performance < 50:
            tips = [
                "Focus on understanding concepts rather than memorizing",
                "Spend more time on difficult subjects",
                "Ask your mentor for extra help",
                "Create a daily study schedule"
            ]
        elif performance < 70:
            tips = [
                "Practice regularly to improve your scores",
                "Focus on weak areas identified in tests",
                "Join study groups with classmates",
                "Review your notes daily"
            ]
        else:
            tips = [
                "Continue your good work!",
                "Help your classmates who are struggling",
                "Take on advanced topics in your strong subjects",
                "Consider mentoring junior students"
            ]
        
        # Add attendance-specific tips
        if attendance < 75:
            tips.append("Improve your attendance - regular classes are crucial for success")
        
        # Store tips in a slot for response generation
        tips_text = "\n".join([f"{i+1}. {tip}" for i, tip in enumerate(tips)])
        slots = [SlotSet("study_tips", tips_text)]
        
        return slots

class MotivationAction(Action):
    """Action to provide personalized motivation based on student context"""
    
    def name(self) -> Text:
        return "MotivationAction"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get student data
        performance = tracker.get_slot("performance") or 0
        risk_level = tracker.get_slot("risk_level") or "unknown"
        student_name = tracker.get_slot("student_name") or "Student"
        
        # Provide personalized motivation
        if risk_level in ["high", "critical"]:
            motivation = f"Dear {student_name}, I understand things might be challenging right now. Remember, every successful person faced difficulties. Your mentor and I are here to support you. Let's work together to improve your situation."
        elif performance < 50:
            motivation = f"Hi {student_name}! I see there's room for improvement, and that's perfectly normal. Many successful students started where you are now. With consistent effort and the right guidance, you can achieve great things!"
        elif performance < 70:
            motivation = f"Hello {student_name}! You're making good progress. Keep up the consistent effort, and you'll see even better results. You're on the right track!"
        else:
            motivation = f"Great job, {student_name}! Your performance shows your dedication and hard work. Keep inspiring others with your success!"
        
        slots = [SlotSet("motivation_message", motivation)]
        
        return slots
