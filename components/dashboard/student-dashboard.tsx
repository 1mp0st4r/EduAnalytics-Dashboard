"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Target,
  Mail,
  Brain,
  BarChart3,
  LogOut
} from "lucide-react"

interface StudentData {
  StudentID: string
  StudentName: string
  RiskLevel: string
  RiskScore: number
  DropoutProbability: number
  AvgAttendance_LatestTerm: number
  AvgMarks_LatestTerm: number
  IsDropout: boolean
  Gender: string
  Age: number
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
}

export default function StudentDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [assessingRisk, setAssessingRisk] = useState(false)

  // Mock student ID for demo - in real app, this would come from authentication
  const studentId = "RJ_2025"

  useEffect(() => {
    fetchStudentData()
    fetchAnalytics()
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      const data = await response.json()
      
      if (data.success) {
        setStudentData(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch student data")
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics?type=overview")
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  const assessRisk = async () => {
    setAssessingRisk(true)
    try {
      const response = await fetch("/api/ml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId,
          action: "assess-risk"
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRiskAssessment(data.data)
        // Refresh student data to get updated risk score
        fetchStudentData()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to assess risk")
    } finally {
      setAssessingRisk(false)
    }
  }

  const sendNotification = async (type: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId,
          type: type,
          recipientEmail: "mentor@school.edu"
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`${type} notification sent successfully!`)
      } else {
        alert(`Failed to send notification: ${data.error}`)
      }
    } catch (err) {
      alert("Failed to send notification")
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical": return "destructive"
      case "High": return "destructive"
      case "Medium": return "secondary"
      case "Low": return "default"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-sm">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {studentData?.StudentName || "Student"}!
            </h1>
            <p className="text-gray-600 mt-2">
              Student ID: {studentData?.StudentID} | Dashboard
            </p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Risk Assessment Alert */}
        {studentData && studentData.RiskLevel !== "Low" && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">
                    Risk Assessment Alert
                  </h3>
                  <p className="text-sm text-orange-700">
                    Your current risk level is <strong>{studentData.RiskLevel}</strong> with a {studentData.DropoutProbability}% dropout probability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Risk Level Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={getRiskColor(studentData?.RiskLevel || "Low")}>
                      {studentData?.RiskLevel || "Low"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Risk Score: {studentData?.RiskScore || 0}/100
                  </p>
                </CardContent>
              </Card>

              {/* Attendance Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(studentData?.AvgAttendance_LatestTerm || 0).toFixed(1)}%
                  </div>
                  <Progress 
                    value={studentData?.AvgAttendance_LatestTerm || 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(studentData?.AvgMarks_LatestTerm || 0).toFixed(1)}%
                  </div>
                  <Progress 
                    value={studentData?.AvgMarks_LatestTerm || 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Dropout Probability Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dropout Risk</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(studentData?.DropoutProbability || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Probability of dropping out
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Student ID:</span>
                    <span className="font-medium">{studentData?.StudentID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gender:</span>
                    <span className="font-medium">{studentData?.Gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="font-medium">{studentData?.Age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={studentData?.IsDropout ? "destructive" : "default"}>
                      {studentData?.IsDropout ? "Dropped Out" : "Active"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>School Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Students:</span>
                    <span className="font-medium">{analyticsData?.statistics.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Attendance:</span>
                    <span className="font-medium">{parseFloat(analyticsData?.statistics.avgAttendance || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Performance:</span>
                    <span className="font-medium">{parseFloat(analyticsData?.statistics.avgPerformance || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dropout Students:</span>
                    <span className="font-medium">{analyticsData?.statistics.dropoutStudents}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Latest Term Marks</span>
                      <span className="font-semibold">{parseFloat(studentData?.AvgMarks_LatestTerm || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={studentData?.AvgMarks_LatestTerm || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Attendance Rate</span>
                      <span className="font-semibold">{parseFloat(studentData?.AvgAttendance_LatestTerm || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={studentData?.AvgAttendance_LatestTerm || 0} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Performance Trend:</span>
                      <span className="text-sm font-medium">
                        {studentData && studentData.AvgMarks_LatestTerm > 60 ? "Good" : "Needs Improvement"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Attendance Status:</span>
                      <span className="text-sm font-medium">
                        {studentData && studentData.AvgAttendance_LatestTerm > 80 ? "Excellent" : 
                         studentData && studentData.AvgAttendance_LatestTerm > 70 ? "Good" : "Needs Attention"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Risk Assessment
                </CardTitle>
                <CardDescription>
                  Get an updated risk assessment using our machine learning model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={assessRisk} 
                  disabled={assessingRisk}
                  className="w-full"
                >
                  {assessingRisk ? "Assessing Risk..." : "Run Risk Assessment"}
                </Button>

                {riskAssessment && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {riskAssessment.riskScore}
                        </div>
                        <div className="text-sm text-blue-800">Risk Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {riskAssessment.riskLevel}
                        </div>
                        <div className="text-sm text-orange-800">Risk Level</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {parseFloat(riskAssessment.dropoutProbability || 0).toFixed(1)}%
                        </div>
                        <div className="text-sm text-red-800">Dropout Probability</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors Identified:</h4>
                      <div className="flex flex-wrap gap-2">
                        {riskAssessment.factors.map((factor: string, index: number) => (
                          <Badge key={index} variant="secondary">{factor}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {riskAssessment.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send Notifications
                </CardTitle>
                <CardDescription>
                  Send alerts and reports to mentors and administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => sendNotification("risk-alert")}
                    variant="destructive"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Risk Alert</div>
                      <div className="text-xs opacity-80">Send high-risk notification</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendNotification("attendance-alert")}
                    variant="secondary"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Clock className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Attendance Alert</div>
                      <div className="text-xs opacity-80">Notify about attendance issues</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendNotification("performance-alert")}
                    variant="secondary"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <TrendingDown className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Performance Alert</div>
                      <div className="text-xs opacity-80">Report academic concerns</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendNotification("monthly-report")}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Monthly Report</div>
                      <div className="text-xs opacity-80">Send progress summary</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}