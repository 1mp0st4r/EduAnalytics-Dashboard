"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
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
  LogOut,
  RefreshCw,
  Send,
  Download
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
  highRiskStudents: StudentData[]
  criticalRiskStudents: StudentData[]
}

export default function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [allStudents, setAllStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingBatch, setProcessingBatch] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    fetchAllStudents()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics?type=overview")
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("/api/students?limit=100")
      const data = await response.json()
      
      if (data.success) {
        setAllStudents(data.data)
      }
    } catch (err) {
      setError("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const runBatchAssessment = async () => {
    setProcessingBatch(true)
    try {
      const response = await fetch("/api/ml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch-assess" })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Batch assessment completed for ${data.data.length} students!`)
        // Refresh data
        fetchAnalytics()
        fetchAllStudents()
      } else {
        alert(`Failed: ${data.error}`)
      }
    } catch (err) {
      alert("Failed to run batch assessment")
    } finally {
      setProcessingBatch(false)
    }
  }

  const sendBulkNotification = async (type: string) => {
    try {
      const highRiskStudents = allStudents.filter(s => s.RiskLevel === "High" || s.RiskLevel === "Critical")
      
      for (const student of highRiskStudents.slice(0, 5)) { // Limit to 5 for demo
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.StudentID,
            type: type,
            recipientEmail: "admin@school.edu"
          })
        })
      }
      
      alert(`${type} notifications sent to ${highRiskStudents.length} high-risk students!`)
    } catch (err) {
      alert("Failed to send bulk notifications")
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
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              EduAnalytics Management Portal
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runBatchAssessment} disabled={processingBatch} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${processingBatch ? 'animate-spin' : ''}`} />
              {processingBatch ? "Processing..." : "Run Batch Assessment"}
            </Button>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.statistics.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Active students in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData?.statistics.highRiskStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(analyticsData?.statistics.avgAttendance || 0).toFixed(1)}%
                  </div>
                  <Progress 
                    value={analyticsData?.statistics.avgAttendance || 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {parseFloat(analyticsData?.statistics.avgPerformance || 0).toFixed(1)}%
                  </div>
                  <Progress 
                    value={analyticsData?.statistics.avgPerformance || 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(analyticsData?.statistics.lowRiskStudents || 0) / (analyticsData?.statistics.totalStudents || 1) * 100} className="w-20" />
                      <span className="font-semibold">{analyticsData?.statistics.lowRiskStudents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(analyticsData?.statistics.mediumRiskStudents || 0) / (analyticsData?.statistics.totalStudents || 1) * 100} className="w-20" />
                      <span className="font-semibold">{analyticsData?.statistics.mediumRiskStudents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(analyticsData?.statistics.highRiskStudents || 0) / (analyticsData?.statistics.totalStudents || 1) * 100} className="w-20" />
                      <span className="font-semibold">{analyticsData?.statistics.highRiskStudents}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(analyticsData?.statistics.criticalRiskStudents || 0) / (analyticsData?.statistics.totalStudents || 1) * 100} className="w-20" />
                      <span className="font-semibold">{analyticsData?.statistics.criticalRiskStudents}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Dropout Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {analyticsData?.statistics.dropoutStudents}
                    </div>
                    <div className="text-sm text-muted-foreground">Dropout Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {((analyticsData?.statistics.dropoutStudents || 0) / (analyticsData?.statistics.totalStudents || 1) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Dropout Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Student Management
                </CardTitle>
                <CardDescription>
                  View and manage all students in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allStudents.slice(0, 20).map((student) => (
                    <div key={student.StudentID} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {student.StudentName?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{student.StudentName || student.StudentID}</p>
                          <p className="text-sm text-muted-foreground">ID: {student.StudentID}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Risk</p>
                          <Badge variant={getRiskColor(student.RiskLevel)}>
                            {student.RiskLevel}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="font-semibold">{student.RiskScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Attendance</p>
                          <p className="font-semibold">{parseFloat(student.AvgAttendance_LatestTerm || 0).toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Performance</p>
                          <p className="font-semibold">{parseFloat(student.AvgMarks_LatestTerm || 0).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Attendance</span>
                      <span className="font-semibold">{parseFloat(analyticsData?.statistics.avgAttendance || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData?.statistics.avgAttendance || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Performance</span>
                      <span className="font-semibold">{parseFloat(analyticsData?.statistics.avgPerformance || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData?.statistics.avgPerformance || 0} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800">Risk Assessment</p>
                      <p className="text-xs text-blue-600">
                        {analyticsData?.statistics.highRiskStudents} students require immediate intervention
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">Success Rate</p>
                      <p className="text-xs text-green-600">
                        {analyticsData?.statistics.lowRiskStudents} students are performing well
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-semibold text-orange-800">Attention Needed</p>
                      <p className="text-xs text-orange-600">
                        {analyticsData?.statistics.mediumRiskStudents} students need monitoring
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Bulk Actions
                </CardTitle>
                <CardDescription>
                  Send notifications and manage students in bulk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => sendBulkNotification("risk-alert")}
                    variant="destructive"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Send Risk Alerts</div>
                      <div className="text-xs opacity-80">Notify high-risk students</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendBulkNotification("attendance-alert")}
                    variant="secondary"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Clock className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Attendance Alerts</div>
                      <div className="text-xs opacity-80">Notify about attendance</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendBulkNotification("performance-alert")}
                    variant="secondary"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <TrendingDown className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Performance Alerts</div>
                      <div className="text-xs opacity-80">Academic concerns</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => sendBulkNotification("monthly-report")}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Download className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Monthly Reports</div>
                      <div className="text-xs opacity-80">Progress summaries</div>
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