"use client"

import React, { useState, useEffect } from "react"
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
  Printer,
  Plus,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  PieChart,
  LineChart,
  Activity,
  RefreshCw,
  Loader2
} from "lucide-react"
import { SimpleChart } from "@/components/ui/simple-chart"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: any
  color: string
  lastGenerated?: string
}

interface ScheduledReport {
  id: string
  name: string
  type: string
  frequency: string
  dayOfWeek?: string
  dayOfMonth?: number
  time: string
  recipients: string[]
  isActive: boolean
  lastRun?: string
  nextRun: string
  createdBy: string
  createdAt: string
}

interface ReportData {
  id: string
  type: string
  generatedAt: string
  summary: any
  data: any[]
  charts: any
  name: string
  description: string
}

interface GeneratedReport {
  id: string
  type: string
  name: string
  description: string
  generatedAt: string
  summary: any
  data: any[]
  charts: any
  size: number
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "performance",
    name: "Student Performance Report",
    description: "Comprehensive analysis of student academic performance and trends",
    category: "Academic",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "risk-analysis",
    name: "Risk Analysis Report",
    description: "Detailed assessment of students at risk of dropping out",
    category: "Risk Management",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600"
  },
  {
    id: "attendance",
    name: "Attendance Summary",
    description: "Monthly and yearly attendance patterns and statistics",
    category: "Attendance",
    icon: Calendar,
    color: "bg-green-100 text-green-600"
  },
  {
    id: "mentor-effectiveness",
    name: "Mentor Effectiveness Report",
    description: "Analysis of mentor performance and student outcomes",
    category: "Mentorship",
    icon: Users,
    color: "bg-purple-100 text-purple-600"
  }
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("templates")
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(false)

  const categories = ["all", ...Array.from(new Set(reportTemplates.map(r => r.category)))]

  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Load scheduled reports and generated reports on component mount
  useEffect(() => {
    loadScheduledReports()
    loadGeneratedReports()
  }, [])

  // Load generated reports from localStorage
  const loadGeneratedReports = () => {
    try {
      const stored = localStorage.getItem('generatedReports')
      if (stored) {
        const reports = JSON.parse(stored)
        setGeneratedReports(reports.sort((a: GeneratedReport, b: GeneratedReport) => 
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        ))
      }
    } catch (error) {
      console.error('Error loading generated reports:', error)
    }
  }

  // Save generated report to localStorage
  const saveGeneratedReport = (reportData: ReportData) => {
    try {
      const report = reportTemplates.find(r => r.id === reportData.type)
      if (!report) return

      const generatedReport: GeneratedReport = {
        id: reportData.id || `${reportData.type}_${Date.now()}`,
        type: reportData.type,
        name: report.name,
        description: report.description,
        generatedAt: reportData.generatedAt,
        summary: reportData.summary,
        data: reportData.data,
        charts: reportData.charts,
        size: JSON.stringify(reportData).length
      }

      const existingReports = JSON.parse(localStorage.getItem('generatedReports') || '[]')
      const updatedReports = [generatedReport, ...existingReports].slice(0, 50) // Keep only last 50 reports
      
      localStorage.setItem('generatedReports', JSON.stringify(updatedReports))
      setGeneratedReports(updatedReports)
    } catch (error) {
      console.error('Error saving generated report:', error)
    }
  }

  // Delete generated report
  const deleteGeneratedReport = (reportId: string) => {
    try {
      const updatedReports = generatedReports.filter(r => r.id !== reportId)
      localStorage.setItem('generatedReports', JSON.stringify(updatedReports))
      setGeneratedReports(updatedReports)
    } catch (error) {
      console.error('Error deleting generated report:', error)
    }
  }

  const loadScheduledReports = async () => {
    try {
      const response = await fetch('/api/reports/scheduled')
      if (response.ok) {
        const result = await response.json()
        setScheduledReports(result.data.reports)
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error)
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/reports?type=${reportId}`)
      const result = await response.json()
      
      if (response.ok && result.success && result.data) {
        // Add unique ID to the report data
        const reportDataWithId = {
          ...result.data,
          id: `${reportId}_${Date.now()}`
        }
        setReportData(reportDataWithId)
        saveGeneratedReport(reportDataWithId)
      alert(`Report "${reportTemplates.find(r => r.id === reportId)?.name}" generated successfully!`)
      } else {
        console.error('Report generation failed:', result)
        alert(`Failed to generate report: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report || !reportData || !reportData.summary) return

    // Generate CSV content based on report data
    let csvContent = ""
    const headers = Object.keys(reportData.summary)
    const values = Object.values(reportData.summary)
    
    csvContent = [headers.join(','), values.join(',')].join('\n')

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${report.name.replace(/\s+/g, '_').toLowerCase()}_report.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewReport = (reportId: string) => {
    if (!reportData) return
    
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return
    
    // Open report in new window with real data
    const reportWindow = window.open('', '_blank', 'width=1000,height=800')
    if (reportWindow) {
      reportWindow.document.write(generateReportHTML(report, reportData))
      reportWindow.document.close()
    }
  }

  // Handle viewing a generated report
  const handleViewGeneratedReport = (generatedReport: GeneratedReport) => {
    const report = reportTemplates.find(r => r.id === generatedReport.type)
    if (!report) return
    
    // Set the report data for viewing
    setReportData({
      id: generatedReport.id,
      type: generatedReport.type,
      generatedAt: generatedReport.generatedAt,
      summary: generatedReport.summary,
      data: generatedReport.data,
      charts: generatedReport.charts,
      name: generatedReport.name,
      description: generatedReport.description
    })
    
    // Switch to templates tab to show the report
    setActiveTab("templates")
  }

  // Handle downloading a generated report
  const handleDownloadGeneratedReport = (generatedReport: GeneratedReport) => {
    if (!generatedReport.summary) return

    // Generate CSV content based on report data
    let csvContent = ""
    const headers = Object.keys(generatedReport.summary)
    const values = Object.values(generatedReport.summary)
    
    csvContent = [headers.join(','), values.join(',')].join('\n')

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${generatedReport.name.replace(/\s+/g, '_').toLowerCase()}_${new Date(generatedReport.generatedAt).toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendEmail = async (reportId: string) => {
    try {
      const report = generatedReports.find(r => r.id === reportId)
      if (!report) return

      const recipientEmail = prompt('Enter recipient email address:')
      if (!recipientEmail) return

      const recipientName = prompt('Enter recipient name (optional):') || ''
      const customMessage = prompt('Enter custom message (optional):') || ''

      const response = await fetch('/api/reports/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData: report,
          recipientEmail,
          recipientName,
          customMessage
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert(`Report sent successfully to ${recipientEmail}`)
      } else {
        alert(`Failed to send report: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending report via email:', error)
      alert('Failed to send report via email')
    }
  }

  const handleGenerateStudentReport = async (studentId: string, reportType: string = 'comprehensive') => {
    try {
      const response = await fetch(`/api/students/${studentId}/report?type=${reportType}`)
      const result = await response.json()
      
      if (response.ok && result.success && result.data) {
        const reportData = {
          ...result.data,
          id: `student_${studentId}_${reportType}_${Date.now()}`
        }
        setReportData(reportData)
        saveGeneratedReport(reportData)
        alert(`Student report generated successfully!`)
      } else {
        alert(`Failed to generate student report: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error generating student report:', error)
      alert('Failed to generate student report')
    }
  }

  const handleAutoScheduleReports = async () => {
    try {
      const response = await fetch('/api/reports/auto-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riskLevels: ['Critical', 'High'],
          reportTypes: ['comprehensive'],
          scheduleFrequency: 'weekly'
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert(`Auto-scheduled ${result.data.scheduledReports} reports for ${result.data.studentsProcessed} high-risk students`)
        loadScheduledReports() // Refresh scheduled reports
      } else {
        alert(`Failed to auto-schedule reports: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error auto-scheduling reports:', error)
      alert('Failed to auto-schedule reports')
    }
  }

  const handleSendParentNotifications = async () => {
    try {
      const response = await fetch('/api/reports/send-parent-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riskLevels: ['Critical', 'High'],
          includeReport: true,
          customMessage: 'Your child requires immediate attention. Please review the attached report and contact the school counselor.'
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert(`Sent ${result.data.notificationsSent} parent notifications for ${result.data.studentsProcessed} high-risk students`)
      } else {
        alert(`Failed to send parent notifications: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending parent notifications:', error)
      alert('Failed to send parent notifications')
    }
  }

  const generateReportHTML = (report: ReportTemplate, data: ReportData) => {
    return `
        <html>
          <head>
            <title>${report.name}</title>
            <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .chart-placeholder { background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1976d2; }
            .metric-label { font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${report.name}</h1>
              <p>${report.description}</p>
            <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
            <p><strong>Category:</strong> ${report.category}</p>
            </div>
          
          <div class="summary">
              <h2>Report Summary</h2>
            ${Object.entries(data.summary).map(([key, value]) => {
              let displayValue = value;
              if (typeof value === 'object' && value !== null) {
                // Handle objects like classDistribution or riskDistribution
                if (key.toLowerCase().includes('distribution')) {
                  const entries = Object.entries(value);
                  displayValue = entries.map(([k, v]) => `${k}: ${v}`).join(', ');
                } else {
                  displayValue = JSON.stringify(value);
                }
              }
              return `
                <div class="metric">
                  <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                  <div class="metric-value">${displayValue}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="charts-section">
            <h3>📊 Charts and Visualizations</h3>
            ${data.charts ? Object.entries(data.charts).map(([chartName, chartData]) => {
              if (!chartData || !Array.isArray(chartData)) return '';
              
              const maxValue = Math.max(...chartData.map((item: any) => item.count || item.value || item.attendanceRate || item.avgAttendance || item.avgEffectiveness || 0));
              const chartTitle = chartName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              return `
                <div class="chart-container" style="margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                  <h4>${chartTitle}</h4>
                  <div class="chart" style="margin-top: 15px;">
                    ${chartData.map((item: any, index: number) => {
                      const value = item.count || item.value || item.attendanceRate || item.avgAttendance || item.avgEffectiveness || 0;
                      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      let label = item.status || item.class || item.level || item.range || item.intervention || item.period || item.date || item.label;
                      
                      // Format labels appropriately
                      if (item.class) label = `Class ${item.class}`;
                      if (item.date) label = item.date;
                      if (item.period) label = item.period;
                      if (!label) label = `Item ${index + 1}`;
                      
                      return `
                        <div style="display: flex; align-items: center; margin: 8px 0;">
                          <div style="width: 120px; font-size: 12px; color: #666;">${label}</div>
                          <div style="flex: 1; height: 20px; background: #f0f0f0; border-radius: 10px; margin: 0 10px; position: relative;">
                            <div style="height: 100%; width: ${percentage}%; background: hsl(${index * 60}, 70%, 50%); border-radius: 10px; transition: width 0.3s ease;"></div>
                          </div>
                          <div style="width: 60px; text-align: right; font-size: 12px; font-weight: bold;">${value}</div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('') : '<p>No chart data available</p>'}
            <p style="margin-top: 20px; color: #666; font-size: 14px;">Data points: ${data.data.length} records analyzed</p>
          </div>

          <h2>Data Overview</h2>
          <p>This report analyzed <strong>${data.data.length}</strong> records from the EduAnalytics system.</p>
          <p>Report type: <strong>${data.type}</strong></p>
          <p>Generated at: <strong>${new Date(data.generatedAt).toLocaleString()}</strong></p>
          </body>
        </html>
    `
  }

  const toggleScheduledReport = async (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId)
    if (!report) return
    
    try {
      const response = await fetch('/api/reports/scheduled', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          isActive: !report.isActive
        })
      })

      if (response.ok) {
        loadScheduledReports() // Reload the list
      }
    } catch (error) {
      console.error('Error toggling scheduled report:', error)
    }
  }

  const deleteScheduledReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return

    try {
      const response = await fetch(`/api/reports/scheduled?id=${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadScheduledReports() // Reload the list
        alert('Scheduled report deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting scheduled report:', error)
    }
  }

  const createScheduledReport = () => {
    const name = prompt("Enter report name:")
    if (!name) return
    
    const type = prompt("Enter report type (performance, risk-analysis, attendance, mentor-effectiveness):")
    if (!type) return
    
    const frequency = prompt("Enter frequency (daily, weekly, monthly, quarterly):")
    if (!frequency) return
    
    const time = prompt("Enter time (HH:MM format, e.g., 09:00):")
    if (!time) return
    
    const recipients = prompt("Enter recipients (comma-separated emails):")
    if (!recipients) return

    // Create the scheduled report
    const newReport = {
      name,
      type,
      frequency,
      time,
      recipients: recipients.split(',').map(email => email.trim())
    }

    fetch('/api/reports/scheduled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        loadScheduledReports()
        alert('Scheduled report created successfully!')
      } else {
        alert('Failed to create scheduled report')
      }
    })
    .catch(error => {
      console.error('Error creating scheduled report:', error)
      alert('Failed to create scheduled report')
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
      quarterly: 'bg-orange-100 text-orange-800'
    }
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
              <p className="text-slate-600">Generate comprehensive reports and manage scheduled reports</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={createScheduledReport}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button onClick={handleAutoScheduleReports} variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Auto-Schedule
              </Button>
              <Button onClick={handleSendParentNotifications} variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Notify Parents
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="generated">Generated Reports</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            </TabsList>

            {/* Report Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                        <p className="text-sm font-medium text-slate-600">Available Templates</p>
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
                        <p className="text-sm font-medium text-slate-600">Generated Reports</p>
                        <p className="text-2xl font-bold text-slate-900">{generatedReports.length}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Generated Today</p>
                        <p className="text-2xl font-bold text-blue-900">3</p>
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
                        <p className="text-2xl font-bold text-green-900">{scheduledReports.filter(r => r.isActive).length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                        <p className="text-sm font-medium text-purple-600">Total Students</p>
                        <p className="text-2xl font-bold text-purple-900">{reportData?.summary.totalStudents || 'N/A'}</p>
                  </div>
                      <Users className="w-8 h-8 text-purple-400" />
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

              {/* Generated Report Display */}
              {reportData && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Generated Report: {reportTemplates.find(r => r.id === reportData.type)?.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Generated on {reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {reportData.summary && Object.entries(reportData.summary).length > 0 ? (
                        Object.entries(reportData.summary).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-sm text-slate-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                              {typeof value === 'object' && value !== null ? Object.keys(value).length : (value?.toString() || 'N/A')}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-slate-500">
                          No summary data available for this report
                        </div>
                      )}
                    </div>

                    {/* Charts */}
                    {reportData.charts && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reportData.charts.performanceDistribution && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Performance Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.performanceDistribution.map((item: any) => ({
                                  label: item.range,
                                  value: item.count
                                }))}
                                type="bar"
                                title="Performance Distribution"
                              />
                            </CardContent>
                          </Card>
                        )}
                        
                        {reportData.charts.attendanceTrends && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Attendance Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.attendanceTrends.map((item: any) => ({
                                  label: item.range || item.date || `Day ${item.date}`,
                                  value: item.count || item.avgAttendance || item.value || 0
                                }))}
                                type="line"
                                title="Attendance Trends"
                              />
                            </CardContent>
                          </Card>
                        )}
                        
                        {reportData.charts.riskLevels && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Risk Level Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.riskLevels.map((item: any) => ({
                                  label: item.level,
                                  value: item.count,
                                  color: item.level === 'Critical' ? '#ef4444' : 
                                         item.level === 'High' ? '#f59e0b' :
                                         item.level === 'Medium' ? '#eab308' : '#10b981'
                                }))}
                                type="pie"
                                title="Risk Level Distribution"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.riskDistribution && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Risk Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.riskDistribution.map((item: any) => ({
                                  label: item.level,
                                  value: item.count,
                                  color: item.level === 'Critical' ? '#ef4444' : 
                                         item.level === 'High' ? '#f59e0b' :
                                         item.level === 'Medium' ? '#eab308' : '#10b981'
                                }))}
                                type="bar"
                                title="Risk Distribution"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.interventionPriority && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Intervention Priority</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.interventionPriority.map((item: any) => ({
                                  label: item.intervention,
                                  value: item.count
                                }))}
                                type="bar"
                                title="Intervention Priority"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.attendanceByClass && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Attendance by Class</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.attendanceByClass.map((item: any) => ({
                                  label: `Class ${item.class || item.level || item.label}`,
                                  value: item.attendanceRate || item.avgAttendance || item.count || item.value || 0
                                }))}
                                type="bar"
                                title="Attendance by Class"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.attendanceDistribution && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Attendance Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.attendanceDistribution.map((item: any) => ({
                                  label: item.status || item.range || item.label,
                                  value: item.count || item.value || 0
                                }))}
                                type="pie"
                                title="Attendance Distribution"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.mentorPerformance && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Mentor Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.mentorPerformance.map((item: any) => ({
                                  label: item.mentorName,
                                  value: item.effectivenessScore
                                }))}
                                type="bar"
                                title="Mentor Performance"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.studentDistribution && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Student Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.studentDistribution.map((item: any) => ({
                                  label: item.category,
                                  value: item.count
                                }))}
                                type="pie"
                                title="Student Distribution"
                              />
                            </CardContent>
                          </Card>
                        )}

                        {reportData.charts.effectivenessTrends && (
                          <Card className="border-0 shadow-md">
                            <CardHeader>
                              <CardTitle>Effectiveness Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <SimpleChart
                                data={reportData.charts.effectivenessTrends.map((item: any) => ({
                                  label: item.period || item.date || `Period ${item.period}`,
                                  value: item.avgEffectiveness || item.effectiveness || item.value || 0
                                }))}
                                type="line"
                                title="Effectiveness Trends"
                              />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                          {reportData?.type === report.id ? 'Generated' : 'Ready'}
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
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate'
                            )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                            disabled={!reportData || reportData.type !== report.id}
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
                            disabled={!reportData || reportData.type !== report.id}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Generated Reports Tab */}
            <TabsContent value="generated" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Generated Reports</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {generatedReports.length} reports
                  </Badge>
                      <Button 
                    variant="outline" 
                        size="sm" 
                    onClick={loadGeneratedReports}
                      >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                      </Button>
                </div>
              </div>

              {generatedReports.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Generated Reports</h3>
                    <p className="text-slate-600 mb-4">
                      Generate your first report using the templates to see it appear here.
                    </p>
                    <Button onClick={() => setActiveTab("templates")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedReports.map((report) => (
                    <Card key={report.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              report.type === 'performance' ? 'bg-blue-100 text-blue-600' :
                              report.type === 'risk-analysis' ? 'bg-red-100 text-red-600' :
                              report.type === 'attendance' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {reportTemplates.find(r => r.id === report.type)?.icon && 
                                React.createElement(reportTemplates.find(r => r.id === report.type)!.icon, { className: "w-5 h-5" })
                              }
                            </div>
                            <div>
                              <CardTitle className="text-lg">{report.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {new Date(report.generatedAt).toLocaleDateString()} at {new Date(report.generatedAt).toLocaleTimeString()}
                              </CardDescription>
                            </div>
                          </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                            onClick={() => deleteGeneratedReport(report.id)}
                            className="text-slate-400 hover:text-red-600"
                      >
                            <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {report.description}
                        </p>
                        
                        {/* Report Stats */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Size: {(report.size / 1024).toFixed(1)} KB</span>
                          <span>Records: {report.data?.length || 0}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewGeneratedReport(report)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadGeneratedReport(report)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(report.id)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button 
                            variant="outline"
                        size="sm" 
                            onClick={() => {
                              const reportWindow = window.open('', '_blank', 'width=1000,height=800')
                              if (reportWindow) {
                                const template = reportTemplates.find(r => r.id === report.type)
                                if (template) {
                                  const reportData = {
                                    id: report.id,
                                    type: report.type,
                                    generatedAt: report.generatedAt,
                                    summary: report.summary,
                                    data: report.data,
                                    charts: report.charts,
                                    name: report.name,
                                    description: report.description
                                  }
                                  reportWindow.document.write(generateReportHTML(template, reportData))
                                  reportWindow.document.close()
                                }
                              }
                            }}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
              )}
            </TabsContent>

            {/* Scheduled Reports Tab */}
            <TabsContent value="scheduled" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Scheduled Reports</h2>
                <Button onClick={createScheduledReport}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule New Report
                </Button>
              </div>

              {/* Scheduled Reports List */}
              <div className="space-y-4">
                {scheduledReports.length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No Scheduled Reports</h3>
                      <p className="text-slate-600 mb-4">Create your first scheduled report to automate report generation</p>
                      <Button onClick={createScheduledReport}>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Report
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  scheduledReports.map((report) => (
                    <Card key={report.id} className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-slate-900">{report.name}</h3>
                              <Badge className={getFrequencyBadge(report.frequency)}>
                                {report.frequency}
                              </Badge>
                              <Badge variant={report.isActive ? "default" : "secondary"}>
                                {report.isActive ? "Active" : "Inactive"}
                              </Badge>
                      </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div>
                                <span className="font-medium">Type:</span> {report.type}
                      </div>
                              <div>
                                <span className="font-medium">Next Run:</span> {formatDate(report.nextRun)}
                              </div>
                              <div>
                                <span className="font-medium">Recipients:</span> {report.recipients.length}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {formatDate(report.createdAt)}
                              </div>
                            </div>
                            {report.lastRun && (
                              <div className="mt-2 text-sm text-slate-500">
                                Last run: {formatDate(report.lastRun)}
                              </div>
                            )}
                    </div>
                    <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleScheduledReport(report.id)}
                            >
                              {report.isActive ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Resume
                                </>
                              )}
                      </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteScheduledReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
              </div>
            </CardContent>
          </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}