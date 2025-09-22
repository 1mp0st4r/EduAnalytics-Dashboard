"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BarChart3,
  UserCheck,
  UserX,
  X
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRisk, setFilterRisk] = useState("all")
  const [filterClass, setFilterClass] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(20)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [selectedStudentForRisk, setSelectedStudentForRisk] = useState<Student | null>(null)
  const [isRiskExplanationOpen, setIsRiskExplanationOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    classLevel: "",
    attendance: "",
    performance: ""
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/students?limit=1000')
      const data = await response.json()
      if (data.success) {
        setStudents(data.data)
      } else {
        setError('Failed to fetch students')
      }
    } catch (err) {
      setError('Failed to fetch students')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    try {
      // Generate a unique student ID
      const studentId = `RJ_${Date.now()}`
      
      // Calculate risk assessment based on attendance and performance
      const attendance = parseFloat(newStudent.attendance) || 0
      const performance = parseFloat(newStudent.performance) || 0
      const riskScore = Math.max(0, 100 - (attendance * 0.4 + performance * 0.6))
      const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
      const dropoutProbability = Math.min(100, riskScore * 1.2)

      const studentData = {
        studentId,
        fullName: newStudent.fullName,
        email: newStudent.email,
        phone: newStudent.phone,
        gender: newStudent.gender,
        classLevel: parseInt(newStudent.classLevel),
        attendance,
        performance,
        riskLevel,
        riskScore: Math.round(riskScore),
        dropoutProbability: Math.round(dropoutProbability)
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      })

      const data = await response.json()
      if (data.success) {
        // Reset form and close modal
        setNewStudent({
          studentId: "",
          fullName: "",
          email: "",
          phone: "",
          gender: "",
          classLevel: "",
          attendance: "",
          performance: ""
        })
        setIsAddStudentOpen(false)
        // Refresh students list
        fetchStudents()
        alert('Student added successfully!')
      } else {
        alert('Failed to add student: ' + data.error)
      }
    } catch (err: any) {
      alert('Failed to add student: ' + err.message)
    }
  }

  const handleExportStudents = (riskLevel?: string) => {
    try {
      let studentsToExport = students
      
      // Filter by risk level if specified
      if (riskLevel && riskLevel !== 'all') {
        studentsToExport = students.filter(student => student.RiskLevel === riskLevel)
      }

      // Create CSV content
      const headers = [
        'Student ID',
        'Student Name',
        'Class',
        'Gender',
        'Attendance %',
        'Performance %',
        'Risk Level',
        'Risk Score',
        'Dropout Probability %',
        'Email',
        'Phone',
        'Mentor Name',
        'School Name'
      ]

      const csvContent = [
        headers.join(','),
        ...studentsToExport.map(student => [
          student.StudentID,
          `"${student.StudentName}"`,
          student.StudentClass,
          student.Gender,
          parseFloat(student.AvgAttendance_LatestTerm).toFixed(1),
          parseFloat(student.AvgMarks_LatestTerm).toFixed(1),
          student.RiskLevel,
          student.RiskScore,
          parseFloat(student.DropoutProbability).toFixed(1),
          `"${student.ContactEmail || ''}"`,
          `"${student.ContactPhoneNumber || ''}"`,
          `"${student.MentorName || 'Not assigned'}"`,
          `"${student.SchoolName || 'Not assigned'}"`
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `students_${riskLevel || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`Exported ${studentsToExport.length} students successfully!`)
    } catch (err: any) {
      alert('Failed to export students: ' + err.message)
    }
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.StudentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.StudentID.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = filterRisk === "all" || student.RiskLevel.toLowerCase() === filterRisk
    const matchesClass = filterClass === "all" || student.StudentClass.toString() === filterClass
    return matchesSearch && matchesRisk && matchesClass
  })

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  )

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const riskStats = {
    total: students.length,
    critical: students.filter(s => s.RiskLevel === 'Critical').length,
    high: students.filter(s => s.RiskLevel === 'High').length,
    medium: students.filter(s => s.RiskLevel === 'Medium').length,
    low: students.filter(s => s.RiskLevel === 'Low').length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={fetchStudents}
          notificationCount={riskStats.high + riskStats.critical}
          isLoading={loading}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Management</h1>
              <p className="text-slate-600">Manage and monitor student performance and risk levels</p>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Enter the student's information to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={newStudent.fullName}
                        onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={newStudent.gender} onValueChange={(value) => setNewStudent({...newStudent, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classLevel">Class Level</Label>
                      <Select value={newStudent.classLevel} onValueChange={(value) => setNewStudent({...newStudent, classLevel: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">Class 6</SelectItem>
                          <SelectItem value="7">Class 7</SelectItem>
                          <SelectItem value="8">Class 8</SelectItem>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                          <SelectItem value="11">Class 11</SelectItem>
                          <SelectItem value="12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendance">Attendance %</Label>
                      <Input
                        id="attendance"
                        type="number"
                        min="0"
                        max="100"
                        value={newStudent.attendance}
                        onChange={(e) => setNewStudent({...newStudent, attendance: e.target.value})}
                        placeholder="Enter attendance percentage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance">Performance %</Label>
                      <Input
                        id="performance"
                        type="number"
                        min="0"
                        max="100"
                        value={newStudent.performance}
                        onChange={(e) => setNewStudent({...newStudent, performance: e.target.value})}
                        placeholder="Enter performance percentage"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStudent}>
                      Add Student
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => handleExportStudents()}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">{riskStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExportStudents('Critical')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Critical Risk</p>
                    <p className="text-2xl font-bold text-red-900">{riskStats.critical}</p>
                    <p className="text-xs text-red-600 mt-1">Click to export</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExportStudents('High')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">High Risk</p>
                    <p className="text-2xl font-bold text-orange-900">{riskStats.high}</p>
                    <p className="text-xs text-orange-600 mt-1">Click to export</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExportStudents('Medium')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-900">{riskStats.medium}</p>
                    <p className="text-xs text-yellow-600 mt-1">Click to export</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleExportStudents('Low')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Low Risk</p>
                    <p className="text-2xl font-bold text-green-900">{riskStats.low}</p>
                    <p className="text-xs text-green-600 mt-1">Click to export</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search students by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {Array.from(new Set(students.map(s => s.StudentClass))).sort().map(cls => (
                        <SelectItem key={cls} value={cls.toString()}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-slate-600" />
                <span>Students ({filteredStudents.length})</span>
              </CardTitle>
              <CardDescription>
                Showing {paginatedStudents.length} of {filteredStudents.length} students
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/6" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
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
                      {paginatedStudents.map((student) => (
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
                                <div className="text-xs text-slate-400">{student.Gender}</div>
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
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleViewRiskExplanation(student)}
                                      title="View Risk Explanation"
                                    >
                                      <AlertTriangle className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.open(`/students/${student.id}`, '_blank')}
                                      title="Edit Student"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.open(`mailto:${student.ContactEmail}`, '_blank')}
                                      title="Send Email"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="More Options">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

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
    </div>
  )
}
