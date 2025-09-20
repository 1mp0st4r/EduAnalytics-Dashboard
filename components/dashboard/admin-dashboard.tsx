"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import EmailDashboard from "@/components/notifications/email-dashboard"
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Mail,
  LogOut,
  UserCheck,
  UserX,
  Bell,
  Eye,
  MessageSquare,
} from "lucide-react"

interface AdminDashboardProps {
  user: any
  onLogout: () => void
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")

  // Mock admin data - in real app, this would come from API
  const adminData = {
    totalStudents: 1247,
    highRiskStudents: 89,
    mediumRiskStudents: 234,
    lowRiskStudents: 924,
    recentIssues: 12,
    studentsData: [
      {
        id: "STU001",
        name: "राहुल शर्मा / Rahul Sharma",
        class: "10",
        attendance: 78,
        performance: 72,
        riskLevel: "medium",
        lastActive: "2 दिन पहले / 2 days ago",
        mentor: "प्रिया सिंह / Priya Singh",
        parentContact: "+91 98765 43210",
        issues: ["पारिवारिक दबाव / Family Pressure"],
      },
      {
        id: "STU002",
        name: "सुनीता कुमारी / Sunita Kumari",
        class: "9",
        attendance: 45,
        performance: 38,
        riskLevel: "high",
        lastActive: "5 दिन पहले / 5 days ago",
        mentor: "अमित गुप्ता / Amit Gupta",
        parentContact: "+91 87654 32109",
        issues: ["आर्थिक समस्या / Financial Issue", "पढ़ाई में कठिनाई / Study Difficulty"],
      },
      {
        id: "STU003",
        name: "अर्जुन पटेल / Arjun Patel",
        class: "11",
        attendance: 92,
        performance: 88,
        riskLevel: "low",
        lastActive: "आज / Today",
        mentor: "रीता शर्मा / Rita Sharma",
        parentContact: "+91 76543 21098",
        issues: [],
      },
      {
        id: "STU004",
        name: "पूजा यादव / Pooja Yadav",
        class: "8",
        attendance: 65,
        performance: 58,
        riskLevel: "medium",
        lastActive: "1 दिन पहले / 1 day ago",
        mentor: "विकास कुमार / Vikas Kumar",
        parentContact: "+91 65432 10987",
        issues: ["अन्य / Other"],
      },
    ],
    recentReports: [
      {
        id: "RPT001",
        studentName: "राहुल शर्मा / Rahul Sharma",
        issue: "पारिवारिक दबाव / Family Pressure",
        status: "pending",
        submittedAt: "2 घंटे पहले / 2 hours ago",
        mentor: "प्रिया सिंह / Priya Singh",
      },
      {
        id: "RPT002",
        studentName: "सुनीता कुमारी / Sunita Kumari",
        issue: "आर्थिक समस्या / Financial Issue",
        status: "resolved",
        submittedAt: "1 दिन पहले / 1 day ago",
        mentor: "अमित गुप्ता / Amit Gupta",
      },
    ],
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">कम / Low</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">मध्यम / Medium</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">उच्च / High</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">लंबित / Pending</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">हल हो गया / Resolved</Badge>
      default:
        return null
    }
  }

  const filteredStudents = adminData.studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === "all" || student.class === filterClass
    const matchesRisk = filterRisk === "all" || student.riskLevel === filterRisk
    return matchesSearch && matchesClass && matchesRisk
  })

  const handleSendEmail = (studentId: string, type: "parent" | "mentor") => {
    console.log(`Sending email for student ${studentId} to ${type}`)
    alert(`${type === "parent" ? "अभिभावक" : "मेंटर"} को ईमेल भेजा गया / Email sent to ${type}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-balance">प्रशासक डैशबोर्ड / Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">छात्र प्रबंधन प्रणाली / Student Management System</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              लॉग आउट / Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              अवलोकन / Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              छात्र प्रबंधन / Students
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              रिपोर्ट्स / Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              सूचनाएं / Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    कुल छात्र / Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{adminData.totalStudents}</div>
                  <p className="text-sm text-muted-foreground mt-1">सक्रिय छात्र / Active students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    उच्च जोखिम / High Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{adminData.highRiskStudents}</div>
                  <p className="text-sm text-muted-foreground mt-1">तत्काल ध्यान चाहिए / Needs immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-yellow-500" />
                    मध्यम जोखिम / Medium Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{adminData.mediumRiskStudents}</div>
                  <p className="text-sm text-muted-foreground mt-1">निगरानी में / Under monitoring</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserX className="w-4 h-4 text-green-500" />
                    कम जोखिम / Low Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{adminData.lowRiskStudents}</div>
                  <p className="text-sm text-muted-foreground mt-1">स्थिर प्रदर्शन / Stable performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>जोखिम वितरण / Risk Distribution</CardTitle>
                <CardDescription>छात्रों का जोखिम स्तर के अनुसार वितरण / Student distribution by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">उच्च जोखिम / High Risk</span>
                    <span className="text-sm text-muted-foreground">{adminData.highRiskStudents} छात्र / students</span>
                  </div>
                  <Progress value={(adminData.highRiskStudents / adminData.totalStudents) * 100} className="h-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">मध्यम जोखिम / Medium Risk</span>
                    <span className="text-sm text-muted-foreground">
                      {adminData.mediumRiskStudents} छात्र / students
                    </span>
                  </div>
                  <Progress value={(adminData.mediumRiskStudents / adminData.totalStudents) * 100} className="h-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">कम जोखिम / Low Risk</span>
                    <span className="text-sm text-muted-foreground">{adminData.lowRiskStudents} छात्र / students</span>
                  </div>
                  <Progress value={(adminData.lowRiskStudents / adminData.totalStudents) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>छात्र खोजें और फ़िल्टर करें / Search and Filter Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">खोजें / Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="नाम या ID से खोजें / Search by name or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>कक्षा / Class</Label>
                    <Select value={filterClass} onValueChange={setFilterClass}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">सभी / All</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={`${i + 1}`}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>जोखिम / Risk</Label>
                    <Select value={filterRisk} onValueChange={setFilterRisk}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">सभी / All</SelectItem>
                        <SelectItem value="high">उच्च / High</SelectItem>
                        <SelectItem value="medium">मध्यम / Medium</SelectItem>
                        <SelectItem value="low">कम / Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>छात्र सूची / Student List</CardTitle>
                <CardDescription>{filteredStudents.length} छात्र मिले / students found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>छात्र / Student</TableHead>
                        <TableHead>कक्षा / Class</TableHead>
                        <TableHead>उपस्थिति / Attendance</TableHead>
                        <TableHead>प्रदर्शन / Performance</TableHead>
                        <TableHead>जोखिम / Risk</TableHead>
                        <TableHead>मेंटर / Mentor</TableHead>
                        <TableHead>कार्य / Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.id}</p>
                              <p className="text-xs text-muted-foreground">{student.lastActive}</p>
                            </div>
                          </TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-medium">{student.attendance}%</span>
                              <Progress value={student.attendance} className="h-1 w-16" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm font-medium">{student.performance}%</span>
                              <Progress value={student.performance} className="h-1 w-16" />
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(student.riskLevel)}</TableCell>
                          <TableCell>
                            <p className="text-sm">{student.mentor}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendEmail(student.id, "parent")}
                                className="bg-transparent"
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  हाल की रिपोर्ट्स / Recent Reports
                </CardTitle>
                <CardDescription>छात्रों द्वारा रिपोर्ट की गई समस्याएं / Issues reported by students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{report.studentName}</h4>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">समस्या / Issue: {report.issue}</p>
                          <p className="text-xs text-muted-foreground">
                            मेंटर / Mentor: {report.mentor} • {report.submittedAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <EmailDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
