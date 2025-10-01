"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"

interface Student {
  id: number
  studentId: string
  fullName: string
  email: string
  phone: string
  gender: string
  classLevel: number
  schoolName: string
  currentAttendance: number
  currentPerformance: number
  riskLevel: string
  riskScore: number
  dropoutProbability: number
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  district: string
  state: string
  createdAt: string
}

interface MentorStats {
  totalStudents: number
  highRiskStudents: number
  mediumRiskStudents: number
  lowRiskStudents: number
  averageAttendance: number
  averagePerformance: number
  recentInterventions: number
}

interface Intervention {
  id: number
  studentId: string
  studentName: string
  type: string
  description: string
  status: string
  priority: string
  createdAt: string
  scheduledDate: string
  completedDate?: string
}

export default function MentorDashboard() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [students, setStudents] = useState<Student[]>([])
  const [statistics, setStatistics] = useState<MentorStats | null>(null)
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showInterventionModal, setShowInterventionModal] = useState(false)
  const [newIntervention, setNewIntervention] = useState({
    type: "",
    description: "",
    priority: "medium",
    scheduledDate: ""
  })

  // Handle authentication state changes
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }
    
    if (user.userType !== 'mentor') {
      // Redirect to appropriate dashboard based on user type
      if (user.userType === 'admin') {
        router.push('/')
      } else if (user.userType === 'student') {
        router.push('/student-dashboard')
      } else if (user.userType === 'parent') {
        router.push('/parent-portal')
      }
      return
    }
    
    fetchMentorData()
  }, [isAuthenticated, user, authLoading, router])

  const fetchMentorData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch mentor's students
      const studentsResponse = await fetch('/api/mentors/students')
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.data || [])
      }

      // Fetch mentor statistics
      const statsResponse = await fetch('/api/mentors/statistics')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStatistics(statsData.data)
      }

      // Fetch interventions
      const interventionsResponse = await fetch('/api/mentors/interventions')
      if (interventionsResponse.ok) {
        const interventionsData = await interventionsResponse.json()
        setInterventions(interventionsData.data || [])
      }
    } catch (err) {
      setError("Failed to load mentor data")
      console.error("Error fetching mentor data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === "all" || student.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <XCircle className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleCreateIntervention = async () => {
    if (!selectedStudent || !newIntervention.type || !newIntervention.description) {
      setError("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch('/api/mentors/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...newIntervention
        })
      })

      if (response.ok) {
        setShowInterventionModal(false)
        setNewIntervention({ type: "", description: "", priority: "medium", scheduledDate: "" })
        setSelectedStudent(null)
        fetchMentorData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create intervention")
      }
    } catch (err) {
      setError("Failed to create intervention")
    }
  }

  // If not authenticated, show loading
  if (!isAuthenticated || !user || user.userType !== 'mentor') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={fetchMentorData}
          onLogout={logout}
          notificationCount={statistics?.highRiskStudents || 0}
          isLoading={loading}
        />
        
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-slate-600">
              Manage your students and track their progress to prevent dropouts.
            </p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Under your mentorship
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.highRiskStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Need immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.averageAttendance.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.averagePerformance.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Academic performance
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList>
              <TabsTrigger value="students">My Students</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>
                    View and manage your assigned students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Students List */}
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {student.fullName}
                                </h3>
                                <Badge variant={getRiskBadgeVariant(student.riskLevel)}>
                                  {getRiskIcon(student.riskLevel)}
                                  <span className="ml-1 capitalize">{student.riskLevel} Risk</span>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <GraduationCap className="w-4 h-4" />
                                  <span>Class {student.classLevel}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{student.currentAttendance}% Attendance</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>{student.currentPerformance}% Performance</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{student.parentPhone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{student.parentEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{student.district}, {student.state}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setShowInterventionModal(true)
                                }}
                              >
                                <Target className="w-4 h-4 mr-1" />
                                Plan Intervention
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredStudents.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No students found
                          </h3>
                          <p className="text-slate-600">
                            {searchTerm || riskFilter !== "all" 
                              ? "Try adjusting your search or filter criteria."
                              : "You don't have any students assigned yet."
                            }
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interventions Tab */}
            <TabsContent value="interventions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intervention Management</CardTitle>
                  <CardDescription>
                    Track and manage student interventions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interventions.map((intervention) => (
                      <Card key={intervention.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{intervention.studentName}</h4>
                                <Badge variant={intervention.priority === 'high' ? 'destructive' : 'default'}>
                                  {intervention.priority} priority
                                </Badge>
                                <Badge variant="outline">
                                  {intervention.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                <strong>Type:</strong> {intervention.type}
                              </p>
                              <p className="text-sm text-slate-600 mb-2">
                                {intervention.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Created: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                                <span>Scheduled: {new Date(intervention.scheduledDate).toLocaleDateString()}</span>
                                {intervention.completedDate && (
                                  <span>Completed: {new Date(intervention.completedDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              {intervention.status !== 'completed' && (
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {interventions.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No interventions yet
                          </h3>
                          <p className="text-slate-600">
                            Create your first intervention plan for a student.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Reports</CardTitle>
                  <CardDescription>
                    Generate and view reports for your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <FileText className="w-6 h-6" />
                      <span>Attendance Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <TrendingUp className="w-6 h-6" />
                      <span>Performance Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      <span>Risk Assessment</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Target className="w-6 h-6" />
                      <span>Intervention Report</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Calendar className="w-6 h-6" />
                      <span>Monthly Summary</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <MessageSquare className="w-6 h-6" />
                      <span>Parent Communication</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Intervention Modal */}
          {showInterventionModal && selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Create Intervention Plan</CardTitle>
                  <CardDescription>
                    For {selectedStudent.fullName} (Class {selectedStudent.classLevel})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="type">Intervention Type</Label>
                    <Select value={newIntervention.type} onValueChange={(value) => 
                      setNewIntervention(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic_support">Academic Support</SelectItem>
                        <SelectItem value="attendance_intervention">Attendance Intervention</SelectItem>
                        <SelectItem value="parent_meeting">Parent Meeting</SelectItem>
                        <SelectItem value="counseling">Counseling</SelectItem>
                        <SelectItem value="peer_mentoring">Peer Mentoring</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the intervention plan..."
                      value={newIntervention.description}
                      onChange={(e) => setNewIntervention(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newIntervention.priority} onValueChange={(value) => 
                      setNewIntervention(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={newIntervention.scheduledDate}
                      onChange={(e) => setNewIntervention(prev => ({ 
                        ...prev, 
                        scheduledDate: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateIntervention}
                      className="flex-1"
                    >
                      Create Intervention
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowInterventionModal(false)
                        setSelectedStudent(null)
                        setNewIntervention({ type: "", description: "", priority: "medium", scheduledDate: "" })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-white hover:text-red-200"
                onClick={() => setError(null)}
              >
                ×
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
