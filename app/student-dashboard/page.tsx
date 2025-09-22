"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  BarChart3,
  Brain,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  Target,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentData {
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

interface StudentStats {
  totalStudents: number
  highRiskStudents: number
  mediumRiskStudents: number
  lowRiskStudents: number
  criticalRiskStudents: number
  dropoutStudents: number
  avgAttendance: number
  avgPerformance: number
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [statistics, setStatistics] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching student data...')
      // For demo purposes, we'll use the first student as the logged-in student
      const response = await fetch('/api/students?limit=1')
      const data = await response.json()
      console.log('📊 Student data response:', data)
      
      if (data.success && data.data.length > 0) {
        const student = data.data[0]
        console.log('✅ Student data loaded:', student.StudentName)
        setStudentData(student)

        // Calculate statistics for this student
        const stats = {
          totalStudents: 1,
          highRiskStudents: student.RiskLevel === 'High' ? 1 : 0,
          mediumRiskStudents: student.RiskLevel === 'Medium' ? 1 : 0,
          lowRiskStudents: student.RiskLevel === 'Low' ? 1 : 0,
          criticalRiskStudents: student.RiskLevel === 'Critical' ? 1 : 0,
          dropoutStudents: student.IsDropout ? 1 : 0,
          avgAttendance: parseFloat(student.AvgAttendance_LatestTerm),
          avgPerformance: parseFloat(student.AvgMarks_LatestTerm)
        }
        setStatistics(stats)
        console.log('✅ Statistics calculated:', stats)
      } else {
        console.error('❌ No student data available:', data)
        setError('Failed to fetch student data')
      }
    } catch (err) {
      console.error('❌ Error fetching student data:', err)
      setError('Failed to fetch student data')
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

  const getPerformanceTrend = (current: number, average: number) => {
    const diff = current - average
    if (diff > 5) return { icon: ArrowUp, color: 'text-green-600', text: 'Above Average' }
    if (diff < -5) return { icon: ArrowDown, color: 'text-red-600', text: 'Below Average' }
    return { icon: Minus, color: 'text-yellow-600', text: 'Average' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Alert className="border-red-200 bg-red-50 max-w-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || 'Student data not found'}
            </AlertDescription>
          </Alert>
          <Button onClick={fetchStudentData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const attendance = parseFloat(studentData.AvgAttendance_LatestTerm)
  const performance = parseFloat(studentData.AvgMarks_LatestTerm)
  const dropoutRisk = parseFloat(studentData.DropoutProbability)
  const performanceTrend = getPerformanceTrend(performance, statistics?.avgPerformance || 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome back, {studentData.StudentName}!</h1>
              <p className="text-slate-600 mt-1">Class {studentData.StudentClass} • Student ID: {studentData.StudentID}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchStudentData}
                variant="outline"
                className="h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => window.open('/', '_self')}
                variant="outline"
                className="h-10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Attendance</p>
                  <p className="text-3xl font-bold text-blue-900">{attendance.toFixed(1)}%</p>
                  <p className="text-xs text-blue-600 mt-1">Current Term</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Performance</p>
                  <p className="text-3xl font-bold text-green-900">{performance.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <performanceTrend.icon className="w-3 h-3" />
                    {performanceTrend.text}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Risk Level</p>
                  <p className="text-3xl font-bold text-orange-900">{studentData.RiskLevel}</p>
                  <p className="text-xs text-orange-600 mt-1">AI Assessment</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Dropout Risk</p>
                  <p className="text-3xl font-bold text-purple-900">{dropoutRisk.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">AI Predicted</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Progress */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Academic Progress
                  </CardTitle>
                  <CardDescription>
                    Your current academic performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className="text-sm text-slate-600">{attendance.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Performance</span>
                      <span className="text-sm text-slate-600">{performance.toFixed(1)}%</span>
                    </div>
                    <Progress value={performance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm text-slate-600">{studentData.RiskScore}/100</span>
                    </div>
                    <Progress value={studentData.RiskScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Risk Assessment
                  </CardTitle>
                  <CardDescription>
                    Machine learning analysis of your academic trajectory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getRiskColor(studentData.RiskLevel)}`}>
                      {getRiskIcon(studentData.RiskLevel)} {studentData.RiskLevel} Risk
                    </div>
                    <p className="text-sm text-slate-600">
                      Based on your attendance ({attendance.toFixed(1)}%) and performance ({performance.toFixed(1)}%), 
                      our AI system has identified you as having a <strong>{studentData.RiskLevel.toLowerCase()}</strong> risk level.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-2">Dropout Probability</p>
                      <div className="text-2xl font-bold text-purple-600">{dropoutRisk.toFixed(1)}%</div>
                      <p className="text-xs text-slate-600 mt-1">
                        {dropoutRisk < 30 ? 'Low risk of dropping out' : 
                         dropoutRisk < 60 ? 'Moderate risk - stay focused!' : 
                         'High risk - consider seeking support'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Attendance Updated</p>
                      <p className="text-xs text-green-700">Your attendance for this week has been recorded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Performance Review</p>
                      <p className="text-xs text-blue-700">Your latest test scores have been updated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Risk Assessment</p>
                      <p className="text-xs text-orange-700">Your risk level has been updated by our AI system</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of your academic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Current Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Attendance Rate</span>
                        <Badge variant={attendance >= 80 ? "default" : attendance >= 60 ? "secondary" : "destructive"}>
                          {attendance.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Performance Score</span>
                        <Badge variant={performance >= 80 ? "default" : performance >= 60 ? "secondary" : "destructive"}>
                          {performance.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk Level</span>
                        <Badge className={getRiskColor(studentData.RiskLevel)}>
                          {studentData.RiskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {attendance < 80 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Improve Attendance:</strong> Try to attend more classes to boost your performance.
                          </p>
                        </div>
                      )}
                      {performance < 70 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Study More:</strong> Consider spending more time on studies and assignments.
                          </p>
                        </div>
                      )}
                      {studentData.RiskLevel === 'High' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Seek Support:</strong> Consider talking to your mentor or counselor for guidance.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Goals & Progress</CardTitle>
                <CardDescription>
                  Set and track your academic goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Current Goals</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Improve Attendance</span>
                          <span className="text-sm text-slate-600">Target: 90%</span>
                        </div>
                        <Progress value={(attendance / 90) * 100} className="h-2" />
                        <p className="text-xs text-slate-600 mt-1">Current: {attendance.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Boost Performance</span>
                          <span className="text-sm text-slate-600">Target: 85%</span>
                        </div>
                        <Progress value={(performance / 85) * 100} className="h-2" />
                        <p className="text-xs text-slate-600 mt-1">Current: {performance.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Your Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.MentorName ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{studentData.MentorName}</p>
                          <p className="text-sm text-slate-600">Your assigned mentor</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{studentData.MentorEmail}</span>
                        </div>
                        <Button size="sm" className="w-full">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Mentor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600">No mentor assigned yet</p>
                      <p className="text-sm text-slate-500">Contact your school administration</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{studentData.SchoolName}</p>
                        <p className="text-sm text-slate-600">Your school</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{studentData.ContactEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{studentData.ContactPhoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
