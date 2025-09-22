"use client"

// Debug page to test individual imports
export default function DebugImports() {
  let importStatus = {
    studentAnalyzer: "Not tested",
    predictiveAnalytics: "Not tested", 
    loginForm: "Not tested"
  }

  try {
    const StudentAnalyzer = require("../components/student-analyzer").default
    importStatus.studentAnalyzer = "✅ Success"
  } catch (error) {
    importStatus.studentAnalyzer = `❌ Error: ${error.message}`
  }

  try {
    const PredictiveAnalytics = require("../components/predictive-analytics").default
    importStatus.predictiveAnalytics = "✅ Success"
  } catch (error) {
    importStatus.predictiveAnalytics = `❌ Error: ${error.message}`
  }

  try {
    const LoginForm = require("../components/login-form").default
    importStatus.loginForm = "✅ Success"
  } catch (error) {
    importStatus.loginForm = `❌ Error: ${error.message}`
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Import Debug Test</h1>
      <div className="space-y-2">
        <p><strong>StudentAnalyzer:</strong> {importStatus.studentAnalyzer}</p>
        <p><strong>PredictiveAnalytics:</strong> {importStatus.predictiveAnalytics}</p>
        <p><strong>LoginForm:</strong> {importStatus.loginForm}</p>
      </div>
    </div>
  )
}
