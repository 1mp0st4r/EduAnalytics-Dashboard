"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  GraduationCap,
  Filter,
  Search,
  Eye,
  Mail,
  Printer
} from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: any
  color: string
  lastGenerated?: string
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "student-performance",
    name: "Student Performance Report",
    description: "Comprehensive analysis of student academic performance and trends",
    category: "Academic",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
    lastGenerated: "2024-01-15"
  },
  {
    id: "risk-analysis",
    name: "Risk Analysis Report",
    description: "Detailed assessment of students at risk of dropping out",
    category: "Risk Management",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
    lastGenerated: "2024-01-14"
  },
  {
    id: "attendance-summary",
    name: "Attendance Summary",
    description: "Monthly and yearly attendance patterns and statistics",
    category: "Attendance",
    icon: Calendar,
    color: "bg-green-100 text-green-600",
    lastGenerated: "2024-01-13"
  },
  {
    id: "mentor-effectiveness",
    name: "Mentor Effectiveness Report",
    description: "Analysis of mentor performance and student outcomes",
    category: "Mentorship",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
    lastGenerated: "2024-01-12"
  },
  {
    id: "dropout-prediction",
    name: "Dropout Prediction Report",
    description: "AI-powered predictions and recommendations for at-risk students",
    category: "AI Analytics",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600",
    lastGenerated: "2024-01-11"
  },
  {
    id: "graduation-tracking",
    name: "Graduation Tracking",
    description: "Progress tracking towards graduation and completion rates",
    category: "Academic",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-600",
    lastGenerated: "2024-01-10"
  }
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const categories = ["all", ...Array.from(new Set(reportTemplates.map(r => r.category)))]

  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    // In a real app, this would trigger actual report generation
    alert(`Report "${reportTemplates.find(r => r.id === reportId)?.name}" generated successfully!`)
  }

  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would download the actual report
    alert(`Downloading report "${reportTemplates.find(r => r.id === reportId)?.name}"...`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={() => {}}
          isLoading={isGenerating}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-slate-600">Generate comprehensive reports and insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter Reports
              </Button>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Create Custom Report
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Reports</p>
                    <p className="text-2xl font-bold text-slate-900">{reportTemplates.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Generated Today</p>
                    <p className="text-2xl font-bold text-blue-900">12</p>
                  </div>
                  <Download className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Scheduled</p>
                    <p className="text-2xl font-bold text-green-900">8</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Custom Reports</p>
                    <p className="text-2xl font-bold text-purple-900">3</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}>
                        <report.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="text-sm">{report.category}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.lastGenerated ? `Last: ${report.lastGenerated}` : 'Never generated'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        {isGenerating ? 'Generating...' : 'Generate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={!report.lastGenerated}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Reports */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <span>Recent Reports</span>
              </CardTitle>
              <CardDescription>
                Your recently generated and downloaded reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Student Performance Report", date: "2024-01-15", type: "PDF", size: "2.4 MB" },
                  { name: "Risk Analysis Report", date: "2024-01-14", type: "Excel", size: "1.8 MB" },
                  { name: "Attendance Summary", date: "2024-01-13", type: "PDF", size: "1.2 MB" },
                  { name: "Mentor Effectiveness Report", date: "2024-01-12", type: "PDF", size: "3.1 MB" },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{report.name}</p>
                        <p className="text-sm text-slate-500">{report.date} • {report.type} • {report.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
