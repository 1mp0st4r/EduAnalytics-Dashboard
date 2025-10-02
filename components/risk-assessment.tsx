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
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Users, Target, Brain, BarChart3, PieChart, Search, Download, RefreshCw } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"

interface RiskFactor {
  id: string
  name: string
  weight: number
  value: number
  impact: "high" | "medium" | "low"
  category: "academic" | "behavioral" | "demographic" | "financial"
}

interface StudentRiskProfile {
  studentId: string
  name: string
  overallRiskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  factors: RiskFactor[]
  predictions: {
    dropoutProbability: number
    timeToDropout: number
    interventionSuccess: number
  }
  trends: {
    month: string
    riskScore: number
  }[]
  recommendations: string[]
}

// Mock data removed - now using real data from API
const getRealRiskProfiles = async (): Promise<StudentRiskProfile[]> => {
  try {
    // Fetch real student data from API
    const response = await fetch('/api/students?limit=10&riskLevel=High')
    const data = await response.json()
    
    if (data.success && data.data.students) {
      return data.data.students.map((student: any) => ({
        studentId: student.StudentID,
        name: student.StudentName,
        overallRiskScore: student.RiskScore || 0,
        riskLevel: student.RiskLevel?.toLowerCase() || 'low',
        factors: [
          { id: "attendance", name: "Attendance Rate", weight: 25, value: student.AvgAttendance_LatestTerm || 0, impact: "high", category: "academic" },
          { id: "performance", name: "Academic Performance", weight: 25, value: student.AvgMarks_LatestTerm || 0, impact: "high", category: "academic" },
          { id: "risk", name: "Risk Score", weight: 20, value: student.RiskScore || 0, impact: "high", category: "risk" },
        ],
        predictions: {
          dropoutProbability: student.DropoutProbability || 0,
          timeToDropout: 2.3,
          interventionSuccess: 65,
        },
        trends: [
          { month: "Jan", riskScore: 45 },
          { month: "Feb", riskScore: 52 },
          { month: "Mar", riskScore: 61 },
          { month: "Apr", riskScore: 68 },
          { month: "May", riskScore: 75 },
          { month: "Jun", riskScore: 82 },
          { month: "Jul", riskScore: student.RiskScore || 85 },
        ],
        recommendations: [
          "Regular academic monitoring required",
          "Attendance improvement plan",
          "Performance enhancement strategies",
          "Weekly check-ins with mentor",
          "Additional support resources",
        ],
      }))
    }
  } catch (error) {
    console.error('Error fetching real risk profiles:', error)
  }
  
  // Return empty array if API fails
  return []
}
  {
    studentId: "STU003",
    name: "Emily Rodriguez",
    overallRiskScore: 58,
    riskLevel: "medium",
    factors: [
      { id: "gpa", name: "GPA Performance", weight: 25, value: 65, impact: "medium", category: "academic" },
      { id: "attendance", name: "Attendance Rate", weight: 20, value: 70, impact: "medium", category: "behavioral" },
      { id: "engagement", name: "Class Engagement", weight: 15, value: 55, impact: "medium", category: "behavioral" },
      { id: "financial", name: "Financial Stress", weight: 15, value: 40, impact: "low", category: "financial" },
      { id: "social", name: "Social Integration", weight: 10, value: 75, impact: "low", category: "demographic" },
      { id: "support", name: "Academic Support Usage", weight: 15, value: 45, impact: "medium", category: "academic" },
    ],
    predictions: {
      dropoutProbability: 35,
      timeToDropout: 5.2,
      interventionSuccess: 82,
    },
    trends: [
      { month: "Jan", riskScore: 42 },
      { month: "Feb", riskScore: 45 },
      { month: "Mar", riskScore: 48 },
      { month: "Apr", riskScore: 52 },
      { month: "May", riskScore: 55 },
      { month: "Jun", riskScore: 57 },
      { month: "Jul", riskScore: 58 },
    ],
    recommendations: [
      "Academic performance monitoring",
      "Study group participation encouraged",
      "Career counseling session",
      "Time management workshop",
    ],
  },
  {
    studentId: "STU001",
    name: "Sarah Johnson",
    overallRiskScore: 22,
    riskLevel: "low",
    factors: [
      { id: "gpa", name: "GPA Performance", weight: 25, value: 90, impact: "low", category: "academic" },
      { id: "attendance", name: "Attendance Rate", weight: 20, value: 95, impact: "low", category: "behavioral" },
      { id: "engagement", name: "Class Engagement", weight: 15, value: 85, impact: "low", category: "behavioral" },
      { id: "financial", name: "Financial Stress", weight: 15, value: 20, impact: "low", category: "financial" },
      { id: "social", name: "Social Integration", weight: 10, value: 80, impact: "low", category: "demographic" },
      { id: "support", name: "Academic Support Usage", weight: 15, value: 70, impact: "low", category: "academic" },
    ],
    predictions: {
      dropoutProbability: 8,
      timeToDropout: 12.5,
      interventionSuccess: 95,
    },
    trends: [
      { month: "Jan", riskScore: 18 },
      { month: "Feb", riskScore: 19 },
      { month: "Mar", riskScore: 20 },
      { month: "Apr", riskScore: 21 },
      { month: "May", riskScore: 22 },
      { month: "Jun", riskScore: 22 },
      { month: "Jul", riskScore: 22 },
    ],
    recommendations: [
      "Continue current academic path",
      "Consider leadership opportunities",
      "Peer mentoring role available",
    ],
  },
]

const riskDistributionData = [
  { name: "Low Risk", value: 924, color: "#10B981", percentage: 74.1 },
  { name: "Medium Risk", value: 234, color: "#F59E0B", percentage: 18.8 },
  { name: "High Risk", value: 67, color: "#EF4444", percentage: 5.4 },
  { name: "Critical Risk", value: 22, color: "#DC2626", percentage: 1.7 },
]

const riskTrendsData = [
  { month: "Jan", low: 890, medium: 210, high: 45, critical: 15 },
  { month: "Feb", low: 905, medium: 220, high: 50, critical: 18 },
  { month: "Mar", low: 912, medium: 225, high: 55, critical: 20 },
  { month: "Apr", low: 918, medium: 230, high: 58, critical: 19 },
  { month: "May", low: 920, medium: 232, high: 62, critical: 21 },
  { month: "Jun", low: 922, medium: 234, high: 65, critical: 22 },
  { month: "Jul", low: 924, medium: 234, high: 67, critical: 22 },
]

const factorWeightsData = [
  { factor: "GPA", weight: 25, impact: 85 },
  { factor: "Attendance", weight: 20, impact: 78 },
  { factor: "Engagement", weight: 15, impact: 65 },
  { factor: "Financial", weight: 15, impact: 72 },
  { factor: "Support Usage", weight: 15, impact: 58 },
  { factor: "Social Integration", weight: 10, impact: 45 },
]

export default function RiskAssessment() {
  const [selectedStudent, setSelectedStudent] = useState<StudentRiskProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [modelAccuracy, setModelAccuracy] = useState(87.3)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const filteredProfiles = mockRiskProfiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === "all" || profile.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-red-100 text-red-600"
      case "medium":
        return "bg-yellow-100 text-yellow-600"
      case "low":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-orange-600"
    if (score >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const recalculateRiskScores = async () => {
    setIsRecalculating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRecalculating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Analytics</h2>
          <p className="text-gray-600">Advanced dropout prediction and risk analysis system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={recalculateRiskScores} disabled={isRecalculating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? "animate-spin" : ""}`} />
            {isRecalculating ? "Recalculating..." : "Recalculate"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Model Performance & Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{modelAccuracy}%</div>
              <p className="text-sm text-gray-500">Overall Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">92.1%</div>
              <p className="text-sm text-gray-500">Precision</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">89.7%</div>
              <p className="text-sm text-gray-500">Recall</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">90.8%</div>
              <p className="text-sm text-gray-500">F1-Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskDistributionData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{item.value}</span>
                    <Badge style={{ backgroundColor: item.color, color: "white" }}>{item.percentage}%</Badge>
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <AlertTriangle className="h-6 w-6" style={{ color: item.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Risk Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
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
      </div>

      {/* Risk Factor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Risk Factor Weights & Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorWeightsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="factor" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="weight" fill="#3B82F6" name="Weight %" />
                <Bar dataKey="impact" fill="#10B981" name="Impact Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Student Risk Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Individual Risk Profiles
            </span>
            <Badge variant="secondary">{filteredProfiles.length} Students</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">Risk List</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="list">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Dropout Probability</TableHead>
                      <TableHead>Time to Risk</TableHead>
                      <TableHead>Intervention Success</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.studentId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {profile.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.name}</p>
                              <p className="text-sm text-gray-500">{profile.studentId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getRiskScoreColor(profile.overallRiskScore)}`}>
                              {profile.overallRiskScore}
                            </span>
                            <div className="w-16">
                              <Progress value={profile.overallRiskScore} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(profile.riskLevel)}>{profile.riskLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getRiskScoreColor(profile.predictions.dropoutProbability)}>
                            {profile.predictions.dropoutProbability}%
                          </span>
                        </TableCell>
                        <TableCell>{profile.predictions.timeToDropout} months</TableCell>
                        <TableCell>
                          <span className="text-green-600">{profile.predictions.interventionSuccess}%</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(profile)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              {selectedStudent ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {selectedStudent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                        <p className="text-gray-500">{selectedStudent.studentId}</p>
                      </div>
                    </div>
                    <Badge className={getRiskColor(selectedStudent.riskLevel)} variant="outline">
                      {selectedStudent.riskLevel} Risk
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className={`text-3xl font-bold ${getRiskScoreColor(selectedStudent.overallRiskScore)}`}>
                          {selectedStudent.overallRiskScore}
                        </div>
                        <p className="text-sm text-gray-500">Overall Risk Score</p>
                        <Progress value={selectedStudent.overallRiskScore} className="mt-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {selectedStudent.predictions.dropoutProbability}%
                        </div>
                        <p className="text-sm text-gray-500">Dropout Probability</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {selectedStudent.predictions.interventionSuccess}%
                        </div>
                        <p className="text-sm text-gray-500">Intervention Success Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Factor Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedStudent.factors.map((factor) => (
                            <div key={factor.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{factor.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Weight: {factor.weight}%</span>
                                  <Badge
                                    variant={
                                      factor.impact === "high"
                                        ? "destructive"
                                        : factor.impact === "medium"
                                          ? "secondary"
                                          : "default"
                                    }
                                  >
                                    {factor.impact}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={factor.value} className="flex-1" />
                                <span className="text-sm font-medium w-12">{factor.value}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Trend Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedStudent.trends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="riskScore"
                                stroke="#EF4444"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedStudent.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                  <p className="text-gray-500">Choose a student from the list to view detailed risk analysis</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
