"use client"

import { useState, useEffect } from "react"

interface Student {
  id: string
  StudentID: string
  StudentName: string
  StudentClass: number
  AvgAttendance_LatestTerm: string
  AvgMarks_LatestTerm: string
  RiskLevel: string
  DropoutProbability: string
  RiskScore: number
  IsDropout: boolean
  Gender: string
  ContactPhoneNumber: string
  ContactEmail: string
  MentorName: string
  MentorEmail: string
  SchoolName: string
}

interface AnalyticsData {
  statistics: {
    totalStudents: number
    highRiskStudents: number
    mediumRiskStudents: number
    lowRiskStudents: number
    criticalRiskStudents: number
    dropoutStudents: number
    avgAttendance: number
    avgPerformance: number
  }
  highRiskStudents: Student[]
  criticalRiskStudents: Student[]
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export default function AIAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        setError('Failed to fetch analytics data')
      }
    } catch (err) {
      setError('Failed to fetch analytics data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return '🚨'
      case 'High': return '⚠️'
      case 'Medium': return '⚡'
      case 'Low': return '✅'
      default: return '❓'
    }
  }

  const getRecommendation = (student: Student) => {
    const attendance = parseFloat(student.AvgAttendance_LatestTerm)
    const performance = parseFloat(student.AvgMarks_LatestTerm)
    const riskScore = student.RiskScore

    if (riskScore >= 80) {
      return "Immediate intervention required. Schedule one-on-one meeting with student and parents."
    } else if (riskScore >= 60) {
      return "High priority support needed. Assign dedicated mentor and create improvement plan."
    } else if (riskScore >= 40) {
      return "Monitor closely. Provide additional academic support and regular check-ins."
    } else {
      return "Continue current support. Student is performing well."
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading AI Analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </a>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold">Total Students</h3>
              <p className="text-3xl font-bold">{analyticsData.statistics.totalStudents}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold">High Risk</h3>
              <p className="text-3xl font-bold">{analyticsData.statistics.highRiskStudents}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold">Avg Attendance</h3>
              <p className="text-3xl font-bold">{analyticsData.statistics.avgAttendance.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold">Avg Performance</h3>
              <p className="text-3xl font-bold">{analyticsData.statistics.avgPerformance.toFixed(1)}%</p>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analyticsData.riskDistribution).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(level)}`}>
                    {getRiskIcon(level)} {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Students */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">High Risk Students Analysis</h2>
            <div className="space-y-4">
              {analyticsData.highRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getRiskColor(student.RiskLevel)}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{student.StudentName}</h3>
                      <p className="text-sm text-gray-600">{student.StudentID} • Class {student.StudentClass}</p>
                      <p className="text-sm mt-1">
                        Attendance: {parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}% • 
                        Performance: {parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}% • 
                        Dropout Risk: {parseFloat(student.DropoutProbability).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.RiskLevel)}`}>
                        {getRiskIcon(student.RiskLevel)} {student.RiskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Recommendations</h2>
            <div className="space-y-4">
              {analyticsData.highRiskStudents.slice(0, 3).map((student) => (
                <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{student.StudentName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Risk Score: {student.RiskScore}/100 • {student.RiskLevel} Risk
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Recommendation:</strong> {getRecommendation(student)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Student Analysis</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Student Information</h3>
                    <p><strong>Name:</strong> {selectedStudent.StudentName}</p>
                    <p><strong>ID:</strong> {selectedStudent.StudentID}</p>
                    <p><strong>Class:</strong> {selectedStudent.StudentClass}</p>
                    <p><strong>Gender:</strong> {selectedStudent.Gender}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Academic Performance</h3>
                    <p><strong>Attendance:</strong> {parseFloat(selectedStudent.AvgAttendance_LatestTerm).toFixed(1)}%</p>
                    <p><strong>Performance:</strong> {parseFloat(selectedStudent.AvgMarks_LatestTerm).toFixed(1)}%</p>
                    <p><strong>Risk Score:</strong> {selectedStudent.RiskScore}/100</p>
                    <p><strong>Dropout Risk:</strong> {parseFloat(selectedStudent.DropoutProbability).toFixed(1)}%</p>
                  </div>
                </div>

            <div>
                  <h3 className="font-semibold text-gray-700 mb-2">AI Recommendation</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {getRecommendation(selectedStudent)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
                  <p><strong>Email:</strong> {selectedStudent.ContactEmail}</p>
                  <p><strong>Phone:</strong> {selectedStudent.ContactPhoneNumber}</p>
                  <p><strong>Mentor:</strong> {selectedStudent.MentorName || 'Not assigned'}</p>
                  <p><strong>School:</strong> {selectedStudent.SchoolName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}