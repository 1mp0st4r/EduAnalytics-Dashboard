"use client"

// Simple test page to verify component imports work
import StudentAnalyzer from "../components/student-analyzer"
import PredictiveAnalytics from "../components/predictive-analytics"
import LoginForm from "../components/login-form"

export default function TestComponents() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Component Import Test</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">StudentAnalyzer Test</h2>
          <StudentAnalyzer studentData={{
            id: "TEST",
            StudentID: "TEST001",
            StudentName: "Test Student",
            StudentClass: 10,
            AvgAttendance_LatestTerm: 85.5,
            AvgMarks_LatestTerm: 78.2,
            RiskLevel: "Low",
            DropoutProbability: 15.3,
            RiskScore: 25,
            IsDropout: false,
            Gender: "Male",
            ContactPhoneNumber: "+91-9876543210",
            ContactEmail: "test@example.com",
            MentorName: "Test Mentor",
            MentorEmail: "mentor@example.com",
            MentorPhone: "+91-9876543211",
            SchoolName: "Test School",
            created_at: new Date().toISOString()
          }} />
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">PredictiveAnalytics Test</h2>
          <PredictiveAnalytics />
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold">LoginForm Test</h2>
          <LoginForm 
            onLogin={() => console.log('Login clicked')}
            onSignUp={() => console.log('Sign up clicked')}
          />
        </div>
      </div>
    </div>
  )
}
