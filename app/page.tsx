"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  Phone, 
  Mail, 
  User, 
  BarChart3,
  Brain,
  RefreshCw,
  LogOut,
  Eye,
  ChevronRight,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  FileText
} from "lucide-react"

type AuthState = "login" | "signup" | "student-dashboard" | "admin-dashboard"

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
    if (userType === "student") {
      // Redirect to student dashboard
      window.location.href = '/student-dashboard'
    } else {
      setAuthState("admin-dashboard")
      fetchData()
    }
  }

  // If not authenticated, show landing page
  if (authState === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">EduAnalytics</h1>
            <p className="text-slate-600 text-lg">Student Dropout Prevention System</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Welcome to EduAnalytics</h2>
              <p className="text-slate-600 mb-6">
                Access your personalized dashboard to track student progress, analyze risk factors, and prevent dropouts.
              </p>
              
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <User className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }


  const handleBackToLogin = () => {
    setAuthState("login")
    setStudents([])
    setStatistics(null)
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
    <div className="min-h-screen bg-slate-50">
      {authState === "admin-dashboard" && (
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="lg:pl-80">
            <Header 
              onRefresh={fetchData}
              notificationCount={statistics?.highRiskStudents || 0}
              isLoading={loading}
            />
            
            <main className="p-6 space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600">Loading dashboard data...</p>
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

              {statistics && (
                <>
                  {/* Welcome Section */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Admin!</h1>
                    <p className="text-slate-600">Here's what's happening with your students today.</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card 
                      className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open('/students', '_self')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Total Students</p>
                            <p className="text-3xl font-bold text-blue-900">{statistics.totalStudents}</p>
                            <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open('/students?risk=high', '_self')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-600">High Risk</p>
                            <p className="text-3xl font-bold text-orange-900">{statistics.highRiskStudents}</p>
                            <p className="text-xs text-orange-600 mt-1">Requires attention</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open('/students?attendance=low', '_self')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">Avg Attendance</p>
                            <p className="text-3xl font-bold text-green-900">{statistics.avgAttendance.toFixed(1)}%</p>
                            <p className="text-xs text-green-600 mt-1">+2.1% from last week</p>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open('/ai-analytics', '_self')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-600">Avg Performance</p>
                            <p className="text-3xl font-bold text-purple-900">{statistics.avgPerformance.toFixed(1)}%</p>
                            <p className="text-xs text-purple-600 mt-1">+1.8% from last week</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => window.open('/students?risk=high', '_self')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">High Risk Students</p>
                            <p className="text-sm text-slate-500">{statistics.highRiskStudents} need attention</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => window.open('/ai-analytics', '_self')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">AI Analytics</p>
                            <p className="text-sm text-slate-500">View detailed insights</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => window.open('/reports', '_self')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Generate Report</p>
                            <p className="text-sm text-slate-500">Export student data</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student Analysis Table */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-slate-600" />
                            <span>Student Risk Analysis</span>
                          </CardTitle>
                          <CardDescription>
                            Comprehensive overview of student performance and risk levels
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/50">
                              <TableHead className="font-semibold">Student</TableHead>
                              <TableHead className="font-semibold">Class</TableHead>
                              <TableHead className="font-semibold">Attendance</TableHead>
                              <TableHead className="font-semibold">Performance</TableHead>
                              <TableHead className="font-semibold">Risk Level</TableHead>
                              <TableHead className="font-semibold">Dropout Risk</TableHead>
                              <TableHead className="font-semibold">Mentor</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.slice(0, 10).map((student) => (
                              <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                                        {student.StudentName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-slate-900">{student.StudentName}</div>
                                      <div className="text-sm text-slate-500">{student.StudentID}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Class {student.StudentClass}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">{parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}%</div>
                                    <Progress 
                                      value={parseFloat(student.AvgAttendance_LatestTerm)} 
                                      className="w-16 h-2"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">{parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}%</div>
                                    <Progress 
                                      value={parseFloat(student.AvgMarks_LatestTerm)} 
                                      className="w-16 h-2"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={student.RiskLevel === 'Critical' ? 'destructive' : 
                                            student.RiskLevel === 'High' ? 'destructive' : 
                                            student.RiskLevel === 'Medium' ? 'secondary' : 'default'}
                                    className={`${getRiskColor(student.RiskLevel)} font-medium`}
                                  >
                                    {student.RiskLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-medium text-slate-900">
                                    {parseFloat(student.DropoutProbability).toFixed(1)}%
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs bg-slate-200 text-slate-600">
                                        {student.MentorName ? student.MentorName.split(' ').map(n => n[0]).join('') : 'N/A'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-slate-600">
                                      {student.MentorName || 'Not assigned'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.open(`/students/${student.id}`, '_blank')}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {students.length > 10 && (
                        <div className="p-4 border-t border-slate-200 text-center">
                          <Button variant="outline" className="mr-2">
                            View All Students
                          </Button>
                          <Button variant="outline">
                            Load More
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}