"use client"

// Simple inline components to test if the issue is with imports
const SimpleStudentAnalyzer = ({ studentData }: any) => (
  <div className="p-4 border rounded">
    <h3 className="font-semibold">Student: {studentData?.StudentName || 'Unknown'}</h3>
    <p>Risk Level: {studentData?.RiskLevel || 'Unknown'}</p>
  </div>
)

const SimplePredictiveAnalytics = () => (
  <div className="p-4 border rounded">
    <h3 className="font-semibold">Predictive Analytics</h3>
    <p>This is a simple test component</p>
  </div>
)

const SimpleLoginForm = ({ onLogin, onSignUp }: any) => (
  <div className="p-4 border rounded">
    <h3 className="font-semibold">Login Form</h3>
    <button onClick={onLogin} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">
      Login
    </button>
    <button onClick={onSignUp} className="px-4 py-2 bg-green-500 text-white rounded">
      Sign Up
    </button>
  </div>
)

export default function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Inline Components Test</h1>
      <div className="space-y-4">
        <SimpleStudentAnalyzer studentData={{
          StudentName: "Test Student",
          RiskLevel: "Low"
        }} />
        
        <SimplePredictiveAnalytics />
        
        <SimpleLoginForm 
          onLogin={() => console.log('Login clicked')}
          onSignUp={() => console.log('Sign up clicked')}
        />
      </div>
    </div>
  )
}
