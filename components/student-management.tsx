"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Edit,
  Trash,
  Download,
  Upload,
  MoreHorizontal,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Wifi,
  Briefcase,
  Users,
  CheckCircle,
} from "lucide-react"
import type { StudentAnalytics } from "@/lib/database-types"

// Real student data will be fetched from API
const mockStudents: StudentAnalytics[] = [
  {
    StudentID: "A-2025-101",
    Age: 20,
    Gender: "Female",
    AccommodationType: "Hostel",
    IsRural: false,
    CommuteTimeMinutes: 15,
    CasteCategory: "General",
    AdmissionQuota: "General",
    FamilyAnnualIncome: 450000,
    NumberOfSiblings: 1,
    FatherEducation: "Graduate",
    IsFatherLiterate: true,
    MotherEducation: "Senior Secondary (12th)",
    IsMotherLiterate: true,
    IsFirstGenerationLearner: false,
    AvgPastPerformance: 82.5,
    MediumChanged: false,
    AvgMarks_LatestTerm: 78.5,
    MarksTrend: -2.1,
    FailureRate_LatestTerm: 0.0,
    AvgAttendance_LatestTerm: 95.2,
    WorksPartTime: false,
    IsPreparingCompetitiveExam: true,
    HasOwnLaptop: true,
    HasReliableInternet: true,
    IsDropout: false,
    RiskScore: 15,
    RiskLevel: "Low",
  },
  {
    StudentID: "A-2025-102",
    Age: 19,
    Gender: "Male",
    AccommodationType: "DayScholar",
    IsRural: true,
    CommuteTimeMinutes: 90,
    CasteCategory: "SC",
    AdmissionQuota: "SC",
    FamilyAnnualIncome: 180000,
    NumberOfSiblings: 3,
    FatherEducation: "Primary (Up to 5th)",
    IsFatherLiterate: true,
    MotherEducation: "No Formal Education",
    IsMotherLiterate: false,
    IsFirstGenerationLearner: true,
    AvgPastPerformance: 65.2,
    MediumChanged: true,
    AvgMarks_LatestTerm: 42.1,
    MarksTrend: -8.7,
    FailureRate_LatestTerm: 0.4,
    AvgAttendance_LatestTerm: 67.3,
    WorksPartTime: true,
    IsPreparingCompetitiveExam: false,
    HasOwnLaptop: false,
    HasReliableInternet: false,
    IsDropout: false,
    RiskScore: 85,
    RiskLevel: "Critical",
  },
  {
    StudentID: "A-2025-103",
    Age: 21,
    Gender: "Female",
    AccommodationType: "Rented",
    IsRural: false,
    CommuteTimeMinutes: 30,
    CasteCategory: "OBC",
    AdmissionQuota: "OBC",
    FamilyAnnualIncome: 320000,
    NumberOfSiblings: 2,
    FatherEducation: "High School (10th)",
    IsFatherLiterate: true,
    MotherEducation: "Middle (Up to 8th)",
    IsMotherLiterate: true,
    IsFirstGenerationLearner: false,
    AvgPastPerformance: 71.8,
    MediumChanged: false,
    AvgMarks_LatestTerm: 65.2,
    MarksTrend: -1.2,
    FailureRate_LatestTerm: 0.1,
    AvgAttendance_LatestTerm: 82.1,
    WorksPartTime: true,
    IsPreparingCompetitiveExam: false,
    HasOwnLaptop: true,
    HasReliableInternet: true,
    IsDropout: false,
    RiskScore: 45,
    RiskLevel: "Medium",
  },
]

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAccommodation, setFilterAccommodation] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")
  const [filterCaste, setFilterCaste] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch real student data from API
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/students?limit=1000')
      const data = await response.json()
      
      if (data.success && data.data) {
        setStudents(data.data)
      } else {
        // Fallback to obviously fake data if API fails
        console.warn('API failed, using clearly marked fallback data')
        const fallbackStudents = mockStudents.map((student, index) => ({
          ...student,
          StudentID: `[DEMO_DATA] ${student.StudentID}`,
          StudentName: `Demo Student ${index + 1}`,
          _isFallbackData: true
        }))
        setStudents(fallbackStudents)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Failed to fetch student data')
      // Fallback to obviously fake data
      const fallbackStudents = mockStudents.map((student, index) => ({
        ...student,
        StudentID: `[DEMO_DATA] ${student.StudentID}`,
        StudentName: `Demo Student ${index + 1}`,
        _isFallbackData: true
      }))
      setStudents(fallbackStudents)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.StudentID.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAccommodation = filterAccommodation === "all" || student.AccommodationType === filterAccommodation
    const matchesRisk = filterRisk === "all" || student.RiskLevel === filterRisk
    const matchesCaste = filterCaste === "all" || student.CasteCategory === filterCaste

    return matchesSearch && matchesAccommodation && matchesRisk && matchesCaste
  })

  const accommodationTypes = ["Hostel", "DayScholar", "Rented"]
  const casteCategories = ["General", "OBC", "SC", "ST", "Other"]

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "bg-red-600 text-white"
      case "High":
        return "bg-red-100 text-red-600"
      case "Medium":
        return "bg-yellow-100 text-yellow-600"
      case "Low":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error && students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <p className="text-gray-600">Error loading student data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={fetchStudents} variant="outline" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">
            Manage student records, profiles, and risk assessment data
            {students.some(s => s._isFallbackData) && <span className="text-orange-600 ml-2 font-medium">(DEMO DATA ACTIVE)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-gray-500">Student form will be implemented with database integration</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Demo Data Warning Banner */}
      {students.some(s => s._isFallbackData) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <h4 className="text-orange-800 font-medium">⚠️ DEMO DATA ACTIVE</h4>
              <p className="text-orange-600 text-sm mt-1">
                Database connection failed. Showing demo data for demonstration purposes only.
                Student IDs are prefixed with [DEMO_DATA] to indicate fallback status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterAccommodation} onValueChange={setFilterAccommodation}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Accommodation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accommodation</SelectItem>
                  {accommodationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCaste} onValueChange={setFilterCaste}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {casteCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Students ({filteredStudents.length})</span>
            <Badge variant="secondary">{students.length} Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Accommodation</TableHead>
                  <TableHead>Academic Performance</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.StudentID}>
                    <TableCell className="font-mono font-medium">{student.StudentID}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {student.Age}y, {student.Gender}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {student.CasteCategory}
                          </Badge>
                          {student.IsFirstGenerationLearner && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                              1st Gen
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-sm">{student.AccommodationType}</span>
                        {student.IsRural && (
                          <div className="text-xs text-gray-500">Rural ({student.CommuteTimeMinutes}min)</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`font-medium text-sm ${
                              student.AvgMarks_LatestTerm >= 70
                                ? "text-green-600"
                                : student.AvgMarks_LatestTerm >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {student.AvgMarks_LatestTerm.toFixed(1)}%
                          </span>
                          {student.MarksTrend < -5 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        </div>
                        {student.FailureRate_LatestTerm > 0 && (
                          <div className="text-xs text-red-500">
                            {(student.FailureRate_LatestTerm * 100).toFixed(0)}% failure rate
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm ${
                          student.AvgAttendance_LatestTerm >= 90
                            ? "text-green-600"
                            : student.AvgAttendance_LatestTerm >= 75
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {student.AvgAttendance_LatestTerm.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{student.RiskScore}</span>
                        <Progress value={student.RiskScore} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(student.RiskLevel)}>{student.RiskLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{selectedStudent.StudentID.slice(-2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">Student Profile</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.StudentID}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="demographic">Demographics</TabsTrigger>
                <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Latest Term Avg</p>
                      <p className="font-semibold">{selectedStudent.AvgMarks_LatestTerm.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Attendance</p>
                      <p className="font-semibold">{selectedStudent.AvgAttendance_LatestTerm.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="font-semibold">{selectedStudent.RiskScore}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Risk Level:</span>
                          <Badge className={getRiskBadgeColor(selectedStudent.RiskLevel)}>
                            {selectedStudent.RiskLevel}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Academic Performance</span>
                            <span
                              className={selectedStudent.AvgMarks_LatestTerm >= 60 ? "text-green-600" : "text-red-600"}
                            >
                              {selectedStudent.AvgMarks_LatestTerm >= 60 ? "Good" : "Needs Attention"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Attendance Rate</span>
                            <span
                              className={
                                selectedStudent.AvgAttendance_LatestTerm >= 80 ? "text-green-600" : "text-red-600"
                              }
                            >
                              {selectedStudent.AvgAttendance_LatestTerm >= 80 ? "Good" : "Poor"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Socio-Economic Status</span>
                            <span
                              className={
                                selectedStudent.FamilyAnnualIncome >= 300000 ? "text-green-600" : "text-yellow-600"
                              }
                            >
                              {selectedStudent.FamilyAnnualIncome >= 300000 ? "Stable" : "At Risk"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Key Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          First Generation Learner
                        </span>
                        <Badge variant={selectedStudent.IsFirstGenerationLearner ? "destructive" : "default"}>
                          {selectedStudent.IsFirstGenerationLearner ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Works Part Time
                        </span>
                        <Badge variant={selectedStudent.WorksPartTime ? "secondary" : "default"}>
                          {selectedStudent.WorksPartTime ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          Reliable Internet
                        </span>
                        <Badge variant={selectedStudent.HasReliableInternet ? "default" : "destructive"}>
                          {selectedStudent.HasReliableInternet ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Academic Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Past Performance Average:</span>
                        <span className="font-medium">{selectedStudent.AvgPastPerformance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Term Average:</span>
                        <span className="font-medium">{selectedStudent.AvgMarks_LatestTerm.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Trend:</span>
                        <span
                          className={`font-medium ${selectedStudent.MarksTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {selectedStudent.MarksTrend >= 0 ? "+" : ""}
                          {selectedStudent.MarksTrend.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failure Rate:</span>
                        <span className="font-medium text-red-600">
                          {(selectedStudent.FailureRate_LatestTerm * 100).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attendance & Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Latest Term Attendance:</span>
                        <span className="font-medium">{selectedStudent.AvgAttendance_LatestTerm.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preparing Competitive Exam:</span>
                        <Badge variant={selectedStudent.IsPreparingCompetitiveExam ? "default" : "secondary"}>
                          {selectedStudent.IsPreparingCompetitiveExam ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Changed:</span>
                        <Badge variant={selectedStudent.MediumChanged ? "secondary" : "default"}>
                          {selectedStudent.MediumChanged ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="demographic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Age:</span>
                        <span>{selectedStudent.Age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gender:</span>
                        <span>{selectedStudent.Gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accommodation:</span>
                        <span>{selectedStudent.AccommodationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{selectedStudent.IsRural ? "Rural" : "Urban"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commute Time:</span>
                        <span>{selectedStudent.CommuteTimeMinutes} minutes</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Socio-Economic Background</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Caste Category:</span>
                        <Badge variant="outline">{selectedStudent.CasteCategory}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Admission Quota:</span>
                        <Badge variant="outline">{selectedStudent.AdmissionQuota}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Family Income:</span>
                        <span>₹{selectedStudent.FamilyAnnualIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of Siblings:</span>
                        <span>{selectedStudent.NumberOfSiblings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Generation:</span>
                        <Badge variant={selectedStudent.IsFirstGenerationLearner ? "destructive" : "default"}>
                          {selectedStudent.IsFirstGenerationLearner ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Family Education Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Father</h4>
                        <div className="text-sm space-y-1">
                          <div>Education: {selectedStudent.FatherEducation}</div>
                          <div>Literate: {selectedStudent.IsFatherLiterate ? "Yes" : "No"}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Mother</h4>
                        <div className="text-sm space-y-1">
                          <div>Education: {selectedStudent.MotherEducation}</div>
                          <div>Literate: {selectedStudent.IsMotherLiterate ? "Yes" : "No"}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavioral" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Work & Study Habits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Works Part Time:</span>
                        <Badge variant={selectedStudent.WorksPartTime ? "secondary" : "default"}>
                          {selectedStudent.WorksPartTime ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Preparing Competitive Exam:</span>
                        <Badge variant={selectedStudent.IsPreparingCompetitiveExam ? "default" : "secondary"}>
                          {selectedStudent.IsPreparingCompetitiveExam ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Technology Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Has Own Laptop:</span>
                        <Badge variant={selectedStudent.HasOwnLaptop ? "default" : "destructive"}>
                          {selectedStudent.HasOwnLaptop ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliable Internet:</span>
                        <Badge variant={selectedStudent.HasReliableInternet ? "default" : "destructive"}>
                          {selectedStudent.HasReliableInternet ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk Analysis Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Risk Score:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedStudent.RiskScore} className="w-32" />
                          <span className="font-bold">{selectedStudent.RiskScore}/100</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-red-600">Risk Factors</h4>
                          {selectedStudent.AvgMarks_LatestTerm < 50 && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              Low academic performance
                            </div>
                          )}
                          {selectedStudent.AvgAttendance_LatestTerm < 75 && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              Poor attendance
                            </div>
                          )}
                          {selectedStudent.IsFirstGenerationLearner && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              First generation learner
                            </div>
                          )}
                          {selectedStudent.FamilyAnnualIncome < 200000 && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              Low family income
                            </div>
                          )}
                          {!selectedStudent.HasReliableInternet && (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              No reliable internet access
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-green-600">Protective Factors</h4>
                          {selectedStudent.AvgMarks_LatestTerm >= 70 && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Good academic performance
                            </div>
                          )}
                          {selectedStudent.AvgAttendance_LatestTerm >= 90 && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Excellent attendance
                            </div>
                          )}
                          {selectedStudent.HasOwnLaptop && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Has personal laptop
                            </div>
                          )}
                          {selectedStudent.FamilyAnnualIncome >= 500000 && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Stable family income
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
