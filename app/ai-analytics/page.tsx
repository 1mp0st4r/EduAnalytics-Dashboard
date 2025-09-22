"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Zap,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RiskExplanationModal } from "@/components/risk-explanation-modal"

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStudentForRisk, setSelectedStudentForRisk] = useState<Student | null>(null)
  const [isRiskExplanationOpen, setIsRiskExplanationOpen] = useState(false)

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalyticsData()
    setIsRefreshing(false)
  }

  const handleViewRiskExplanation = (student: Student) => {
    setSelectedStudentForRisk(student)
    setIsRiskExplanationOpen(true)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={handleRefresh}
          notificationCount={analyticsData?.statistics.highRiskStudents || 0}
          isLoading={isRefreshing}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                AI Analytics Dashboard
              </h1>
              <p className="text-slate-600 mt-1">AI-powered insights and predictive analytics for student success</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="h-10"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <Button
                onClick={() => window.open('/', '_self')}
                variant="outline"
                className="h-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600">Loading AI Analytics...</p>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {analyticsData && !loading && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Students</p>
                        <p className="text-3xl font-bold text-blue-900">{analyticsData.statistics.totalStudents}</p>
                        <p className="text-xs text-blue-600 mt-1">AI Monitored</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">High Risk</p>
                        <p className="text-3xl font-bold text-orange-900">{analyticsData.statistics.highRiskStudents}</p>
                        <p className="text-xs text-orange-600 mt-1">Requires AI Attention</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Avg Attendance</p>
                        <p className="text-3xl font-bold text-green-900">{analyticsData.statistics.avgAttendance.toFixed(1)}%</p>
                        <p className="text-xs text-green-600 mt-1">AI Predicted</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Avg Performance</p>
                        <p className="text-3xl font-bold text-purple-900">{analyticsData.statistics.avgPerformance.toFixed(1)}%</p>
                        <p className="text-xs text-purple-600 mt-1">AI Analyzed</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Distribution Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-slate-600" />
                    AI Risk Distribution Analysis
                  </CardTitle>
                  <CardDescription>
                    Machine learning-powered risk assessment across all students
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* High Risk Students */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    AI-Identified High Risk Students
                  </CardTitle>
                  <CardDescription>
                    Students requiring immediate intervention based on AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.highRiskStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${getRiskColor(student.RiskLevel)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{student.StudentName}</h3>
                            <p className="text-sm text-gray-600">{student.StudentID} • Class {student.StudentClass}</p>
                            <p className="text-sm mt-1">
                              Attendance: {parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}% • 
                              Performance: {parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}% • 
                              Dropout Risk: {parseFloat(student.DropoutProbability).toFixed(1)}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(student.RiskLevel)}`}>
                              {getRiskIcon(student.RiskLevel)} {student.RiskLevel}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRiskExplanation(student)}
                              className="h-8 px-3"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Why?
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                              className="h-8 px-3"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription>
                    Machine learning-generated intervention strategies for at-risk students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.highRiskStudents.slice(0, 3).map((student) => (
                      <div key={student.id} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900">{student.StudentName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Risk Score: {student.RiskScore}/100 • {student.RiskLevel} Risk
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>AI Recommendation:</strong> {getRecommendation(student)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Student Detail Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">AI Student Analysis</h2>
                    <Button
                      onClick={() => setSelectedStudent(null)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
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

          {/* Risk Explanation Modal */}
          {selectedStudentForRisk && (
            <RiskExplanationModal
              student={selectedStudentForRisk}
              isOpen={isRiskExplanationOpen}
              onClose={() => {
                setIsRiskExplanationOpen(false)
                setSelectedStudentForRisk(null)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}