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
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useRouter } from "next/navigation"
import { LanguageToggle } from "@/components/ui/language-toggle"
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

// AuthState is now handled by AuthContext

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
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle authentication state changes
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (isAuthenticated && user) {
      if (user.userType === 'admin') {
        fetchData()
      } else if (user.userType === 'student') {
        router.push('/student-dashboard')
      } else if (user.userType === 'mentor') {
        router.push('/mentor-dashboard')
      } else if (user.userType === 'parent') {
        router.push('/parent-portal')
      }
    }
  }, [isAuthenticated, user, authLoading, router])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Fetching data...')
      
      // Fetch students
      const studentsResponse = await fetch('/api/students?limit=1000')
      const studentsData = await studentsResponse.json()
      console.log('📊 Students response:', studentsData)
      if (studentsData.success) {
        setStudents(studentsData.data)
        console.log('✅ Students loaded:', studentsData.data.length)
      } else {
        console.error('❌ Students fetch failed:', studentsData.error)
      }

      // Fetch statistics
      const statsResponse = await fetch('/api/analytics')
      const statsData = await statsResponse.json()
      console.log('📈 Stats response:', statsData)
      if (statsData.success) {
        setStatistics(statsData.data.statistics)
        console.log('✅ Statistics loaded:', statsData.data.statistics)
      } else {
        console.error('❌ Stats fetch failed:', statsData.error)
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('❌ Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // If not authenticated, show landing page
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Language Toggle */}
          <div className="flex justify-end mb-8">
            <LanguageToggle />
          </div>
          
          <div className="text-center mb-12">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('landing.title')}</h1>
              <p className="text-slate-600 text-lg">{t('landing.subtitle')}</p>
              <p className="text-slate-500 text-sm mt-2">{t('landing.description')}</p>
            </div>

            {/* Main CTA */}
            <div className="mb-12">
              <Button 
                onClick={() => window.location.href = '/login'}
                className="h-12 text-lg px-8 mr-4"
                size="lg"
              >
                <User className="w-5 h-5 mr-2" />
                {t('landing.getStarted')}
              </Button>
              <Button 
                variant="outline"
                className="h-12 text-lg px-8"
                size="lg"
              >
                {t('landing.learnMore')}
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.predictiveAnalytics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.predictiveAnalyticsDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.studentManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.studentManagementDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.realTimeAlerts')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.realTimeAlertsDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.reporting')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.reportingDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.mentorSupport')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.mentorSupportDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.aiChatbot')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t('landing.aiChatbotDesc')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <Card className="border-0 shadow-xl max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('dashboard.welcome')}</h2>
                <p className="text-slate-600 mb-6">
                  {t('landing.description')}
                </p>
                
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <User className="w-5 h-5 mr-2" />
                  {t('landing.getStarted')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }


  // Authentication is now handled by AuthContext

  const handleTestDatabase = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      if (data.success) {
        alert('Database connection successful!')
      } else {
        alert('Database connection failed: ' + data.error)
      }
    } catch (error) {
      alert('Database test failed: ' + error)
    }
  }

  const handleTestEmail = async () => {
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      if (data.success) {
        alert('Email test successful!')
      } else {
        alert('Email test failed: ' + data.error)
      }
    } catch (error) {
      alert('Email test failed: ' + error)
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
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated && user && user.userType === 'admin' && (
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="lg:pl-80">
            <Header 
              onRefresh={fetchData}
              onTestDatabase={handleTestDatabase}
              onTestEmail={handleTestEmail}
              onLogout={logout}
              notificationCount={statistics?.highRiskStudents || 0}
              isLoading={loading}
            />
            
            <main className="p-6 space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600">{t('common.loading')}</p>
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

              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('dashboard.welcome')}</h1>
                <p className="text-slate-600">{t('dashboard.overview')}</p>
              </div>

              {statistics ? (
                <>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card 
                      className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => window.open('/students', '_self')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">{t('dashboard.totalStudents')}</p>
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
                            <p className="text-sm font-medium text-orange-600">{t('dashboard.atRiskStudents')}</p>
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
                            <p className="text-sm font-medium text-green-600">{t('dashboard.avgAttendance')}</p>
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
                            <p className="text-sm font-medium text-purple-600">{t('dashboard.avgPerformance')}</p>
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
                            <p className="font-medium text-slate-900">{t('dashboard.atRiskStudents')}</p>
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
                            <p className="font-medium text-slate-900">{t('dashboard.generateReport')}</p>
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
                                      onClick={() => window.open(`/students/${student.StudentID}`, '_blank')}
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
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-600 mb-4">
                    {loading ? 'Loading dashboard data...' : 'No data available. Click refresh to try again.'}
                  </div>
                  <Button onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh Data'}
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}