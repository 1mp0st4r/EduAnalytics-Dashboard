"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  BarChartIcon,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  Search,
  Plus,
  Edit,
  Menu,
  Users,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Target,
  Database,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts"
import StudentManagement from "@/components/student-management"
import RiskAssessment from "@/components/risk-assessment"
import PredictiveAnalytics from "@/components/predictive-analytics"
import ReportsAnalytics from "@/components/reports-analytics"
import DatabaseManagement from "@/components/database-management"

const enrollmentData = [
  { name: "Jan", value: 245 },
  { name: "Feb", value: 267 },
  { name: "Mar", value: 289 },
  { name: "Apr", value: 234 },
  { name: "May", value: 298 },
  { name: "Jun", value: 312 },
  { name: "Jul", value: 287 },
]

const riskData = [
  { name: "Jan", critical: 12, high: 23, medium: 45, low: 177 },
  { name: "Feb", critical: 15, high: 28, medium: 52, low: 187 },
  { name: "Mar", critical: 18, high: 31, medium: 48, low: 210 },
  { name: "Apr", critical: 8, high: 19, medium: 41, low: 174 },
  { name: "May", critical: 22, high: 35, medium: 58, low: 205 },
  { name: "Jun", critical: 16, high: 29, medium: 51, low: 232 },
  { name: "Jul", critical: 14, high: 26, medium: 47, low: 214 },
]

const performanceData = [
  { name: "Excellent (>85%)", value: 156, color: "#10B981" },
  { name: "Good (70-85%)", value: 189, color: "#3B82F6" },
  { name: "Average (55-70%)", value: 167, color: "#F59E0B" },
  { name: "Below Average (40-55%)", value: 84, color: "#EF4444" },
  { name: "Failing (<40%)", value: 32, color: "#DC2626" },
]

const studentData = [
  {
    id: 1,
    name: "Sarah Johnson",
    studentId: "A-2025-101",
    program: "Computer Science",
    year: "3rd Year",
    avgMarks: 78.5,
    riskLevel: "Low",
    attendance: 95.2,
    avatar: "/placeholder.svg?height=32&width=32",
    familyIncome: 450000,
    isFirstGeneration: false,
    hasReliableInternet: true,
    worksPartTime: false,
  },
  {
    id: 2,
    name: "Michael Chen",
    studentId: "A-2025-102",
    program: "Engineering",
    year: "2nd Year",
    avgMarks: 42.1,
    riskLevel: "Critical",
    attendance: 67.3,
    avatar: "/placeholder.svg?height=32&width=32",
    familyIncome: 180000,
    isFirstGeneration: true,
    hasReliableInternet: false,
    worksPartTime: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    studentId: "A-2025-103",
    program: "Business Administration",
    year: "4th Year",
    avgMarks: 65.2,
    riskLevel: "Medium",
    attendance: 82.1,
    avatar: "/placeholder.svg?height=32&width=32",
    familyIncome: 320000,
    isFirstGeneration: false,
    hasReliableInternet: true,
    worksPartTime: true,
  },
  {
    id: 4,
    name: "David Kim",
    studentId: "A-2025-104",
    program: "Psychology",
    year: "1st Year",
    avgMarks: 89.9,
    riskLevel: "Low",
    attendance: 98.1,
    avatar: "/placeholder.svg?height=32&width=32",
    familyIncome: 680000,
    isFirstGeneration: false,
    hasReliableInternet: true,
    worksPartTime: false,
  },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("students")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const renderDashboard = () => (
    <>
      <div className="flex justify-end mb-4">
        <p className="text-sm text-gray-600">Academic Year 2024-2025 // Fall Semester</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-50 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Total Students <span className="text-xs">(Active)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">1,247</h3>
                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">+5.2%</span>
              </div>
              <p className="text-xs text-gray-500">Previous semester: 1,184</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-50 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Critical Risk <span className="text-xs">(Dropout)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">89</h3>
                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">+12%</span>
              </div>
              <p className="text-xs text-gray-500">Requires immediate intervention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-50 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Avg Performance <span className="text-xs">(Latest Term)</span>
              </p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">68.4%</h3>
                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">+2.1%</span>
              </div>
              <p className="text-xs text-gray-500">Previous term: 66.3%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Risk Distribution</p>
            <div className="flex justify-between mb-2">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs">89</span>
                </div>
                <p className="text-xs">Critical</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs">156</span>
                </div>
                <p className="text-xs">High</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs">234</span>
                </div>
                <p className="text-xs">Medium</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs">768</span>
                </div>
                <p className="text-xs">Low</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Retention Rate</p>
              <p className="text-lg font-bold">92.8%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Student Enrollment</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  this semester <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Year</DropdownMenuItem>
                <DropdownMenuItem>Last Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="text-xs">{`${payload[0].value} Students`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Risk Assessment Trends</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  this semester <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>This Year</DropdownMenuItem>
                <DropdownMenuItem>Last Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <Tooltip />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#DC2626" fill="#DC2626" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Performance Distribution</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  current semester <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Previous Semester</DropdownMenuItem>
                <DropdownMenuItem>Academic Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <Card className="mb-6">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-medium">
            At-Risk Students <span className="text-xs font-normal text-gray-500">(Requires Attention)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="mb-4 border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="students"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("students")}
              >
                Critical Risk
              </TabsTrigger>
              <TabsTrigger
                value="high"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("high")}
              >
                High Risk
              </TabsTrigger>
              <TabsTrigger
                value="medium"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("medium")}
              >
                Medium Risk
              </TabsTrigger>
              <TabsTrigger
                value="interventions"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                onClick={() => setActiveTab("interventions")}
              >
                Interventions
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name, ID, or program"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] text-sm"
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Intervention
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        STUDENT <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">STUDENT ID</TableHead>
                    <TableHead className="whitespace-nowrap">PROGRAM</TableHead>
                    <TableHead className="whitespace-nowrap">YEAR</TableHead>
                    <TableHead className="whitespace-nowrap">AVG MARKS</TableHead>
                    <TableHead className="whitespace-nowrap">ATTENDANCE</TableHead>
                    <TableHead className="whitespace-nowrap">RISK LEVEL</TableHead>
                    <TableHead className="whitespace-nowrap">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.avgMarks.toFixed(1)}%</TableCell>
                      <TableCell>{student.attendance.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.riskLevel === "Critical"
                              ? "destructive"
                              : student.riskLevel === "High"
                                ? "destructive"
                                : student.riskLevel === "Medium"
                                  ? "secondary"
                                  : "default"
                          }
                          className={
                            student.riskLevel === "Critical"
                              ? "bg-red-600 text-white"
                              : student.riskLevel === "High"
                                ? "bg-red-100 text-red-600"
                                : student.riskLevel === "Medium"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                          }
                        >
                          {student.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="link" className="text-blue-500 hover:text-blue-600">
                View All Students
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${isMobile ? "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out" : "w-64"} ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"} bg-white border-r border-gray-200 flex flex-col`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-blue-600">EduAnalytics</h1>
          <p className="text-sm text-gray-500 mt-1">Student Success Platform</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "dashboard" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <BarChartIcon className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("students")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "students" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Users className="mr-3 h-5 w-5" />
              Student Management
            </button>
            <button
              onClick={() => setActiveSection("risk-assessment")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "risk-assessment" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <AlertTriangle className="mr-3 h-5 w-5" />
              Risk Assessment
            </button>
            <button
              onClick={() => setActiveSection("predictive-analytics")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "predictive-analytics" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Predictive Analytics
            </button>
            <button
              onClick={() => setActiveSection("programs")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "programs" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <GraduationCap className="mr-3 h-5 w-5" />
              Academic Programs
            </button>
            <button
              onClick={() => setActiveSection("interventions")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "interventions" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Target className="mr-3 h-5 w-5" />
              Interventions
            </button>
            <button
              onClick={() => setActiveSection("reports")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "reports" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              Reports & Analytics
            </button>
            <button
              onClick={() => setActiveSection("database")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${activeSection === "database" ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Database className="mr-3 h-5 w-5" />
              Database Management
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">
              {activeSection === "dashboard"
                ? "Analytics Dashboard"
                : activeSection === "students"
                  ? "Student Management"
                  : activeSection === "risk-assessment"
                    ? "Risk Assessment"
                    : activeSection === "predictive-analytics"
                      ? "Predictive Analytics"
                      : activeSection === "programs"
                        ? "Academic Programs"
                        : activeSection === "interventions"
                          ? "Student Interventions"
                          : activeSection === "reports"
                            ? "Reports & Analytics"
                            : activeSection === "database"
                              ? "Database Management"
                              : "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "students" && <StudentManagement />}
          {activeSection === "risk-assessment" && <RiskAssessment />}
          {activeSection === "predictive-analytics" && <PredictiveAnalytics />}
          {activeSection === "programs" && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Programs</h3>
              <p className="text-gray-500">Program-specific analytics and performance tracking.</p>
            </div>
          )}
          {activeSection === "interventions" && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Interventions</h3>
              <p className="text-gray-500">Track and manage intervention strategies.</p>
            </div>
          )}
          {activeSection === "reports" && <ReportsAnalytics />}
          {activeSection === "database" && <DatabaseManagement />}
        </main>
      </div>
    </div>
  )
}
