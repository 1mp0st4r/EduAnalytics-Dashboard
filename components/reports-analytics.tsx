"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Download,
  Filter,
  CalendarIcon,
  BarChart3,
  Users,
  GraduationCap,
  AlertTriangle,
  Target,
  FileText,
  Mail,
  Printer,
} from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"

const enrollmentTrends = [
  { semester: "Fall 2022", enrolled: 1180, graduated: 245, dropped: 89, retained: 846 },
  { semester: "Spring 2023", enrolled: 1205, graduated: 198, dropped: 76, retained: 931 },
  { semester: "Fall 2023", enrolled: 1247, graduated: 0, dropped: 67, retained: 1180 },
  { semester: "Spring 2025", enrolled: 1289, graduated: 287, dropped: 54, retained: 948 },
  { semester: "Fall 2025", enrolled: 1247, graduated: 0, dropped: 43, retained: 1204 },
]

const programPerformance = [
  { program: "Computer Science", students: 342, avgGPA: 3.4, retention: 94.2, satisfaction: 4.3 },
  { program: "Engineering", students: 298, avgGPA: 3.2, retention: 91.8, satisfaction: 4.1 },
  { program: "Business Admin", students: 267, avgGPA: 3.1, retention: 89.5, satisfaction: 3.9 },
  { program: "Psychology", students: 189, avgGPA: 3.6, retention: 96.1, satisfaction: 4.5 },
  { program: "Mathematics", students: 151, avgGPA: 3.3, retention: 92.7, satisfaction: 4.0 },
]

const riskFactorAnalysis = [
  { factor: "Academic Performance", weight: 0.35, impact: 85, correlation: 0.78 },
  { factor: "Attendance", weight: 0.25, impact: 72, correlation: 0.65 },
  { factor: "Financial Stress", weight: 0.2, impact: 68, correlation: 0.58 },
  { factor: "Social Integration", weight: 0.12, impact: 45, correlation: 0.42 },
  { factor: "Family Support", weight: 0.08, impact: 38, correlation: 0.35 },
]

const interventionEffectiveness = [
  { intervention: "Academic Tutoring", participants: 156, success: 78, cost: 12500, roi: 3.2 },
  { intervention: "Financial Counseling", participants: 89, success: 67, cost: 8900, roi: 2.8 },
  { intervention: "Peer Mentoring", participants: 234, success: 145, cost: 15600, roi: 4.1 },
  { intervention: "Career Guidance", participants: 178, success: 134, cost: 11200, roi: 3.7 },
  { intervention: "Mental Health Support", participants: 67, success: 52, cost: 9800, roi: 2.9 },
]

const demographicBreakdown = [
  { category: "Age 18-20", value: 456, color: "#3B82F6" },
  { category: "Age 21-23", value: 389, color: "#10B981" },
  { category: "Age 24-26", value: 234, color: "#F59E0B" },
  { category: "Age 27+", value: 168, color: "#EF4444" },
]

const academicProgressFlow = [
  { stage: "Enrolled", students: 1247 },
  { stage: "First Year", students: 1189 },
  { stage: "Second Year", students: 1098 },
  { stage: "Third Year", students: 967 },
  { stage: "Fourth Year", students: 834 },
  { stage: "Graduated", students: 756 },
]

const departmentComparison = [
  { department: "STEM", enrollment: 642, retention: 92.1, avgGPA: 3.3, funding: 2.4 },
  { department: "Liberal Arts", enrollment: 298, retention: 94.7, avgGPA: 3.5, funding: 1.8 },
  { department: "Business", enrollment: 267, retention: 89.5, avgGPA: 3.1, funding: 2.1 },
  { department: "Social Sciences", enrollment: 189, retention: 96.1, avgGPA: 3.6, funding: 1.6 },
]

export default function ReportsAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("semester")
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(["all"])
  const [reportType, setReportType] = useState("comprehensive")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const generateReport = async () => {
    setIsGeneratingReport(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGeneratingReport(false)
  }

  const exportData = (format: string) => {
    // Simulate data export
    console.log(`Exporting data in ${format} format`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive data visualization and institutional reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button size="sm" onClick={generateReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester">Current Semester</SelectItem>
                  <SelectItem value="year">Academic Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="departmental">Departmental</SelectItem>
                  <SelectItem value="risk-focused">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="programs">Programs</Label>
              <Select value={selectedPrograms[0]} onValueChange={(value) => setSelectedPrograms([value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="eng">Engineering</SelectItem>
                  <SelectItem value="bus">Business Admin</SelectItem>
                  <SelectItem value="psy">Psychology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Custom Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-gray-500">Total Students</p>
                <Badge className="mt-1 bg-green-100 text-green-600">+5.2%</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">92.8%</div>
                <p className="text-sm text-gray-500">Retention Rate</p>
                <Badge className="mt-1 bg-green-100 text-green-600">+2.1%</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">89</div>
                <p className="text-sm text-gray-500">At-Risk Students</p>
                <Badge className="mt-1 bg-red-100 text-red-600">-8.3%</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">78%</div>
                <p className="text-sm text-gray-500">Intervention Success</p>
                <Badge className="mt-1 bg-green-100 text-green-600">+12.4%</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Institutional Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="enrolled" fill="#3B82F6" name="Enrolled" />
                    <Bar yAxisId="left" dataKey="graduated" fill="#10B981" name="Graduated" />
                    <Bar yAxisId="left" dataKey="dropped" fill="#EF4444" name="Dropped" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="retained"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Retention %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factor Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Factor Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskFactorAnalysis}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Impact" dataKey="impact" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Radar name="Weight" dataKey="weight" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Program Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={programPerformance}
                      dataKey="students"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#3B82F6"
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrollment Trends by Semester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="enrolled" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.3} />
                      <Line type="monotone" dataKey="retained" stroke="#10B981" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Academic Progress Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip />
                      <Funnel dataKey="students" data={academicProgressFlow} isAnimationActive>
                        <LabelList position="center" fill="#fff" stroke="none" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Comparison Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Department</th>
                      <th className="text-center p-2">Enrollment</th>
                      <th className="text-center p-2">Retention %</th>
                      <th className="text-center p-2">Avg GPA</th>
                      <th className="text-center p-2">Funding (M)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentComparison.map((dept, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{dept.department}</td>
                        <td className="text-center p-2">{dept.enrollment}</td>
                        <td className="text-center p-2">
                          <span className={dept.retention >= 92 ? "text-green-600" : "text-yellow-600"}>
                            {dept.retention}%
                          </span>
                        </td>
                        <td className="text-center p-2">
                          <span className={dept.avgGPA >= 3.3 ? "text-green-600" : "text-yellow-600"}>
                            {dept.avgGPA}
                          </span>
                        </td>
                        <td className="text-center p-2">${dept.funding}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Program Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={programPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="program" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="students" fill="#3B82F6" name="Students" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="retention"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Retention %"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgGPA"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      name="Avg GPA"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intervention Effectiveness & ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={interventionEffectiveness}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="intervention" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="participants" fill="#3B82F6" name="Participants" />
                    <Bar yAxisId="left" dataKey="success" fill="#10B981" name="Success" />
                    <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#EF4444" strokeWidth={3} name="ROI" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={demographicBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demographicBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demographic Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demographicBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value}</div>
                        <div className="text-sm text-gray-500">{((item.value / 1247) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Automated Report Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Recipients</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="admin" />
                  <label htmlFor="admin" className="text-sm">
                    Administration
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="faculty" />
                  <label htmlFor="faculty" className="text-sm">
                    Faculty
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="board" />
                  <label htmlFor="board" className="text-sm">
                    Board Members
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <Select defaultValue="email">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semester">Per Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={generateReport} disabled={isGeneratingReport}>
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Schedule Email
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
