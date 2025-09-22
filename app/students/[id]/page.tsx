"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  User,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  FileText,
  Send,
  Download,
  MoreHorizontal
} from "lucide-react"

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
  created_at: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Student>>({})

  useEffect(() => {
    if (params.id) {
      fetchStudent(params.id as string)
    }
  }, [params.id])

  const fetchStudent = async (studentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/students/${studentId}`)
      const data = await response.json()
      if (data.success) {
        setStudent(data.data)
        setEditData(data.data)
      } else {
        setError('Student not found')
      }
    } catch (err) {
      setError('Failed to fetch student')
      console.error('Error fetching student:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(student || {})
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      const data = await response.json()
      if (data.success) {
        setStudent(data.data)
        setIsEditing(false)
        alert('Student updated successfully!')
      } else {
        alert('Failed to update student')
      }
    } catch (err) {
      alert('Failed to update student')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(student || {})
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: student?.ContactEmail,
          subject: `Update for ${student?.StudentName}`,
          text: `Dear ${student?.StudentName},\n\nThis is an update regarding your academic progress.\n\nBest regards,\nEduAnalytics Team`
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Email sent successfully!')
      } else {
        alert('Failed to send email')
      }
    } catch (err) {
      alert('Failed to send email')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:pl-80">
          <Header onRefresh={() => {}} />
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600">Loading student details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:pl-80">
          <Header onRefresh={() => {}} />
          <div className="p-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Student not found'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header onRefresh={() => fetchStudent(params.id as string)} />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>
                <p className="text-slate-600">Detailed information and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <>
                  <Button onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleSendEmail}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Student Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-semibold">
                      {student.StudentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{student.StudentName}</CardTitle>
                    <CardDescription>{student.StudentID} • Class {student.StudentClass}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{student.Gender}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{student.ContactEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{student.ContactPhoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{student.SchoolName}</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-slate-600" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{getRiskIcon(student.RiskLevel)}</div>
                  <Badge 
                    variant={student.RiskLevel === 'Critical' ? 'destructive' : 
                            student.RiskLevel === 'High' ? 'destructive' : 
                            student.RiskLevel === 'Medium' ? 'secondary' : 'default'}
                    className={`${getRiskColor(student.RiskLevel)} font-medium text-lg px-4 py-2`}
                  >
                    {student.RiskLevel} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Risk Score</span>
                    <span className="font-semibold">{student.RiskScore}/100</span>
                  </div>
                  <Progress value={student.RiskScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Dropout Probability</span>
                    <span className="font-semibold">{parseFloat(student.DropoutProbability).toFixed(1)}%</span>
                  </div>
                  <Progress value={parseFloat(student.DropoutProbability)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Academic Performance Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                  <span>Academic Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Attendance</span>
                      <span className="font-semibold">{parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}%</span>
                    </div>
                    <Progress value={parseFloat(student.AvgAttendance_LatestTerm)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Performance</span>
                      <span className="font-semibold">{parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}%</span>
                    </div>
                    <Progress value={parseFloat(student.AvgMarks_LatestTerm)} className="h-2" />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {((parseFloat(student.AvgAttendance_LatestTerm) + parseFloat(student.AvgMarks_LatestTerm)) / 2).toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600">Overall Average</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="mentor">Mentor</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Student Overview</CardTitle>
                  <CardDescription>Basic information and current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="studentName">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="studentName"
                            value={editData.StudentName || ''}
                            onChange={(e) => setEditData({...editData, StudentName: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{student.StudentName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="studentId">Student ID</Label>
                        {isEditing ? (
                          <Input
                            id="studentId"
                            value={editData.StudentID || ''}
                            onChange={(e) => setEditData({...editData, StudentID: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{student.StudentID}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="studentClass">Class</Label>
                        {isEditing ? (
                          <Input
                            id="studentClass"
                            type="number"
                            value={editData.StudentClass || ''}
                            onChange={(e) => setEditData({...editData, StudentClass: parseInt(e.target.value)})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">Class {student.StudentClass}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        {isEditing ? (
                          <Input
                            id="gender"
                            value={editData.Gender || ''}
                            onChange={(e) => setEditData({...editData, Gender: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{student.Gender}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editData.ContactEmail || ''}
                            onChange={(e) => setEditData({...editData, ContactEmail: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{student.ContactEmail}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.ContactPhoneNumber || ''}
                            onChange={(e) => setEditData({...editData, ContactPhoneNumber: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-900 font-medium">{student.ContactPhoneNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  <CardDescription>Detailed academic metrics and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Current Attendance</Label>
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">Latest Term</span>
                            <span className="font-semibold">{parseFloat(student.AvgAttendance_LatestTerm).toFixed(1)}%</span>
                          </div>
                          <Progress value={parseFloat(student.AvgAttendance_LatestTerm)} className="h-3" />
                        </div>
                      </div>
                      <div>
                        <Label>Current Performance</Label>
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">Latest Term</span>
                            <span className="font-semibold">{parseFloat(student.AvgMarks_LatestTerm).toFixed(1)}%</span>
                          </div>
                          <Progress value={parseFloat(student.AvgMarks_LatestTerm)} className="h-3" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Risk Assessment</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Risk Level</span>
                            <Badge className={getRiskColor(student.RiskLevel)}>
                              {student.RiskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Risk Score</span>
                            <span className="font-semibold">{student.RiskScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Dropout Probability</span>
                            <span className="font-semibold">{parseFloat(student.DropoutProbability).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mentor">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Mentor Information</CardTitle>
                  <CardDescription>Assigned mentor and support details</CardDescription>
                </CardHeader>
                <CardContent>
                  {student.MentorName ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-slate-200 text-slate-600">
                            {student.MentorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{student.MentorName}</h3>
                          <p className="text-slate-600">Assigned Mentor</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <p className="text-slate-900 font-medium">{student.MentorEmail}</p>
                        </div>
                        <div>
                          <Label>Contact</Label>
                          <p className="text-slate-900 font-medium">{student.MentorEmail}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Mentor Assigned</h3>
                      <p className="text-slate-600 mb-4">This student doesn't have an assigned mentor yet.</p>
                      <Button>Assign Mentor</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Student History</CardTitle>
                  <CardDescription>Academic history and timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Student Created</p>
                        <p className="text-sm text-slate-600">
                          {new Date(student.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Enrolled in Class {student.StudentClass}</p>
                        <p className="text-sm text-slate-600">Current academic year</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Risk Assessment Updated</p>
                        <p className="text-sm text-slate-600">
                          {student.RiskLevel} risk level assigned
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
