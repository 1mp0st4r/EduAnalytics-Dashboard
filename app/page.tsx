"use client"

import { useState, useEffect } from "react"

type AuthState = "login" | "signup" | "student-dashboard" | "admin-dashboard" | "database-test" | "email-test"

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

interface Statistics {
  totalStudents: number
  highRiskStudents: number
  mediumRiskStudents: number
  lowRiskStudents: number
  criticalRiskStudents: number
  dropoutStudents: number
  avgAttendance: number
  avgPerformance: number
}

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/students?limit=100')
      const studentsData = await studentsResponse.json()
      if (studentsData.success) {
        setStudents(studentsData.data)
      }

      // Fetch statistics
      const statsResponse = await fetch('/api/analytics')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStatistics(statsData.data.statistics)
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userType: "student" | "admin", credentials: any) => {
    setCurrentUser({ userType, ...credentials })
    setAuthState(userType === "student" ? "student-dashboard" : "admin-dashboard")
    if (userType === "admin") {
      fetchData()
    }
  }

  const handleSignUp = () => {
    setAuthState("signup")
  }

  const handleBackToLogin = () => {
    setAuthState("login")
    setStudents([])
    setStatistics(null)
  }

  const handleDatabaseTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      if (data.success) {
        alert(`Database Test Successful!\n\nConnection: ${data.data.connection}\nTotal Students: ${data.data.statistics.totalStudents}`)
      } else {
        alert('Database Test Failed!')
      }
    } catch (err) {
      alert('Database Test Failed!')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test Email',
          text: 'This is a test email from EduAnalytics Dashboard'
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Email Test Successful!')
      } else {
        alert('Email Test Failed!')
      }
    } catch (err) {
      alert('Email Test Failed!')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {authState === "login" && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">EduAnalytics Dashboard</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={() => handleLogin("admin", { username: "admin" })}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login as Admin
              </button>
              <button
                onClick={() => handleLogin("student", { username: "student" })}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Login as Student
              </button>
              <div className="text-center">
                <button
                  onClick={handleSignUp}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleDatabaseTest}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 text-sm mr-4 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Database'}
              </button>
              <button
                onClick={handleEmailTest}
                disabled={loading}
                className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {authState === "student-dashboard" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
          <p>Welcome, {currentUser?.username || 'Student'}!</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}

      {authState === "admin-dashboard" && (
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <a
                href="/ai-analytics"
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                AI Analytics
              </a>
              <button
                onClick={handleBackToLogin}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
                <p className="text-3xl font-bold text-blue-600">{statistics.totalStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">High Risk</h3>
                <p className="text-3xl font-bold text-orange-600">{statistics.highRiskStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Avg Attendance</h3>
                <p className="text-3xl font-bold text-green-600">{statistics.avgAttendance.toFixed(1)}%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Avg Performance</h3>
                <p className="text-3xl font-bold text-purple-600">{statistics.avgPerformance.toFixed(1)}%</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Student Risk Analysis</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dropout Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.StudentName}</div>
                          <div className="text-sm text-gray-500">{student.StudentID}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Class {student.StudentClass}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(student.RiskLevel)}`}>
                          {student.RiskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(student.DropoutProbability).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.MentorName || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              {statistics && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Critical Risk</span>
                    <span className="font-semibold text-red-600">{statistics.criticalRiskStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Risk</span>
                    <span className="font-semibold text-orange-600">{statistics.highRiskStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Risk</span>
                    <span className="font-semibold text-yellow-600">{statistics.mediumRiskStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Risk</span>
                    <span className="font-semibold text-green-600">{statistics.lowRiskStudents}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={fetchData}
                  className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Refresh Data
                </button>
                <button
                  onClick={handleDatabaseTest}
                  className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  Test Database Connection
                </button>
                <button
                  onClick={handleEmailTest}
                  className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  Test Email System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {authState === "database-test" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Database Test</h1>
          <p>Database connection test would be here.</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}

      {authState === "email-test" && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Email Test</h1>
          <p>Email functionality test would be here.</p>
          <button
            onClick={handleBackToLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  )
}