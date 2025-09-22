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
    try {
      // Simulate report generation with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update the template with generation time
      const updatedTemplates = reportTemplates.map(template => 
        template.id === reportId 
          ? { ...template, lastGenerated: new Date().toISOString().split('T')[0] }
          : template
      )
      
      setIsGenerating(false)
      alert(`Report "${reportTemplates.find(r => r.id === reportId)?.name}" generated successfully!`)
    } catch (error) {
      setIsGenerating(false)
      alert("Failed to generate report. Please try again.")
    }
  }

  const handleDownloadReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return

    // Generate CSV data based on report type
    let csvContent = ""
    let filename = ""

    switch (reportId) {
      case "student-performance":
        csvContent = generateStudentPerformanceCSV()
        filename = "student_performance_report.csv"
        break
      case "risk-analysis":
        csvContent = generateRiskAnalysisCSV()
        filename = "risk_analysis_report.csv"
        break
      case "attendance-tracking":
        csvContent = generateAttendanceCSV()
        filename = "attendance_tracking_report.csv"
        break
      case "mentor-effectiveness":
        csvContent = generateMentorEffectivenessCSV()
        filename = "mentor_effectiveness_report.csv"
        break
      default:
        csvContent = generateGenericReportCSV(report.name)
        filename = `${report.id}_report.csv`
    }

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateStudentPerformanceCSV = () => {
    const headers = ['Student ID', 'Name', 'Class', 'Attendance %', 'Performance %', 'Risk Level', 'Mentor', 'Last Updated']
    const data = [
      ['RJ_001', 'John Doe', '10', '85.5', '78.2', 'Low', 'Dr. Smith', '2024-01-15'],
      ['RJ_002', 'Jane Smith', '9', '92.1', '88.5', 'Low', 'Prof. Johnson', '2024-01-15'],
      ['RJ_003', 'Mike Wilson', '11', '45.2', '32.1', 'Critical', 'Dr. Brown', '2024-01-15'],
    ]
    return [headers, ...data].map(row => row.join(',')).join('\n')
  }

  const generateRiskAnalysisCSV = () => {
    const headers = ['Risk Level', 'Count', 'Percentage', 'Avg Attendance', 'Avg Performance', 'Intervention Needed']
    const data = [
      ['Critical', '45', '15.2%', '42.3%', '28.7%', 'Immediate'],
      ['High', '78', '26.3%', '58.9%', '45.2%', 'Within 48 hours'],
      ['Medium', '123', '41.5%', '72.1%', '65.8%', 'Within 1 week'],
      ['Low', '51', '17.2%', '89.4%', '82.3%', 'Monthly monitoring'],
    ]
    return [headers, ...data].map(row => row.join(',')).join('\n')
  }

  const generateAttendanceCSV = () => {
    const headers = ['Date', 'Class', 'Present', 'Absent', 'Attendance %', 'Notes']
    const data = [
      ['2024-01-15', 'Class 10A', '28', '2', '93.3%', 'Good attendance'],
      ['2024-01-15', 'Class 10B', '25', '5', '83.3%', 'Some absences noted'],
      ['2024-01-15', 'Class 9A', '30', '0', '100%', 'Perfect attendance'],
    ]
    return [headers, ...data].map(row => row.join(',')).join('\n')
  }

  const generateMentorEffectivenessCSV = () => {
    const headers = ['Mentor Name', 'Students Assigned', 'High Risk Students', 'Interventions', 'Success Rate', 'Last Review']
    const data = [
      ['Dr. Smith', '25', '3', '12', '85%', '2024-01-10'],
      ['Prof. Johnson', '30', '5', '18', '78%', '2024-01-12'],
      ['Dr. Brown', '20', '8', '15', '65%', '2024-01-08'],
    ]
    return [headers, ...data].map(row => row.join(',')).join('\n')
  }

  const generateGenericReportCSV = (reportName: string) => {
    const headers = ['Report Name', 'Generated Date', 'Total Records', 'Status']
    const data = [[reportName, new Date().toISOString().split('T')[0], '297', 'Complete']]
    return [headers, ...data].map(row => row.join(',')).join('\n')
  }

  const handleViewReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return
    
    // Open report in new window/tab
    const reportWindow = window.open('', '_blank', 'width=800,height=600')
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${report.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${report.name}</h1>
              <p>${report.description}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <h2>Report Summary</h2>
              <p>This report contains comprehensive data analysis for ${report.category.toLowerCase()} metrics.</p>
              <p>Total records analyzed: 297</p>
              <p>Report status: Complete</p>
              <p>Last updated: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `)
      reportWindow.document.close()
    }
  }

  const handleEmailReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return
    
    const subject = encodeURIComponent(`${report.name} - EduAnalytics Report`)
    const body = encodeURIComponent(`
Hello,

Please find attached the ${report.name} generated on ${new Date().toLocaleDateString()}.

Report Details:
- Name: ${report.name}
- Description: ${report.description}
- Category: ${report.category}
- Generated: ${new Date().toLocaleString()}

This report contains comprehensive analysis of student data and risk assessments.

Best regards,
EduAnalytics System
    `)
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handlePrintReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { line-height: 1.6; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${report.name}</h1>
              <p>${report.description}</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <h2>Report Summary</h2>
              <p>This report contains comprehensive data analysis for ${report.category.toLowerCase()} metrics.</p>
              <p>Total records analyzed: 297</p>
              <p>Report status: Complete</p>
              <p>Last updated: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleCreateCustomReport = () => {
    const reportName = prompt("Enter custom report name:")
    if (!reportName) return
    
    const reportDescription = prompt("Enter report description:")
    if (!reportDescription) return
    
    const reportCategory = prompt("Enter report category (Academic, Risk, Attendance, etc.):")
    if (!reportCategory) return
    
    // Create custom report
    const customReport = {
      id: `custom-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      category: reportCategory,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      lastGenerated: new Date().toISOString().split('T')[0]
    }
    
    // Add to templates (in a real app, this would be saved to database)
    reportTemplates.push(customReport)
    
    alert(`Custom report "${reportName}" created successfully!`)
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
              <Button onClick={handleCreateCustomReport}>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewReport(report.id)}
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEmailReport(report.id)}
                        title="Email Report"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handlePrintReport(report.id)}
                        title="Print Report"
                      >
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
