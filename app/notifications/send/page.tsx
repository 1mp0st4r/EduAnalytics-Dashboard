"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Send,
  Mail,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Bell,
  MessageSquare,
  User,
  UserCheck,
  Calendar,
  Target
} from "lucide-react"

interface Student {
  StudentID: string
  StudentName: string
  StudentClass: number
  ContactEmail?: string
  ContactPhoneNumber?: string
  MentorName?: string
  RiskLevel: string
  AvgAttendance_LatestTerm: number
  AvgMarks_LatestTerm: number
}

interface NotificationTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: any
  color: string
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: "risk-alert",
    name: "Risk Alert",
    description: "High risk student alert for immediate intervention",
    type: "alert",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600"
  },
  {
    id: "dropout-warning",
    name: "Dropout Warning",
    description: "Student showing dropout risk indicators",
    type: "warning",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: "attendance-alert",
    name: "Attendance Alert",
    description: "Low attendance notification to parents",
    type: "alert",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "performance-alert",
    name: "Performance Alert",
    description: "Academic performance decline notification",
    type: "warning",
    icon: Target,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: "monthly-report",
    name: "Monthly Report",
    description: "Monthly progress report to parents",
    type: "info",
    icon: FileText,
    color: "bg-green-100 text-green-600"
  },
  {
    id: "custom",
    name: "Custom Message",
    description: "Send a custom message to parents/students",
    type: "info",
    icon: MessageSquare,
    color: "bg-gray-100 text-gray-600"
  }
]

export default function SendNotificationsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [recipientType, setRecipientType] = useState<string>("parents")
  const [customMessage, setCustomMessage] = useState<string>("")
  const [recipientEmail, setRecipientEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRisk, setFilterRisk] = useState<string>("all")
  const [successMessage, setSuccessMessage] = useState("")

  // Load students on component mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/students?limit=100')
      if (response.ok) {
        const result = await response.json()
        setStudents(result.data || [])
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.StudentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.StudentID.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = filterRisk === "all" || student.RiskLevel === filterRisk
    return matchesSearch && matchesRisk
  })

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.StudentID))
    }
  }

  const handleSendNotifications = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student")
      return
    }

    if (!selectedTemplate) {
      alert("Please select a notification template")
      return
    }

    if (selectedTemplate === "custom" && !customMessage.trim()) {
      alert("Please enter a custom message")
      return
    }

    setIsSending(true)
    setSuccessMessage("")

    try {
      const promises = selectedStudents.map(async (studentId) => {
        const student = students.find(s => s.StudentID === studentId)
        if (!student) return

        const payload = {
          type: selectedTemplate,
          studentId: studentId,
          recipientEmail: recipientEmail || student.ContactEmail || "parent@example.com",
          customMessage: selectedTemplate === "custom" ? customMessage : undefined
        }

        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Failed to send notification for ${studentId}`)
        }

        return response.json()
      })

      await Promise.all(promises)
      
      setSuccessMessage(`Successfully sent ${selectedTemplate} notifications to ${selectedStudents.length} students`)
      setSelectedStudents([])
      setCustomMessage("")
      setRecipientEmail("")
      setSelectedTemplate("")

    } catch (error) {
      console.error('Error sending notifications:', error)
      alert("Failed to send some notifications. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const getSelectedTemplateInfo = () => {
    return notificationTemplates.find(t => t.id === selectedTemplate)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={() => {}}
          isLoading={isLoading}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Send Notifications</h1>
              <p className="text-slate-600">Send alerts and reports to students, parents, and mentors</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {selectedStudents.length} selected
              </Badge>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800">{successMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Select Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterRisk} onValueChange={setFilterRisk}>
                        <SelectTrigger className="w-40">
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
                      <Button 
                        variant="outline" 
                        onClick={handleSelectAll}
                        className="whitespace-nowrap"
                      >
                        {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student List */}
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        No students found matching your criteria
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredStudents.map((student) => (
                          <div key={student.StudentID} className="p-4 hover:bg-slate-50">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.StudentID)}
                                onChange={(e) => handleStudentSelection(student.StudentID, e.target.checked)}
                                className="rounded border-slate-300"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-slate-900">{student.StudentName}</h3>
                                  <Badge 
                                    variant={student.RiskLevel === 'Critical' ? 'destructive' : 
                                           student.RiskLevel === 'High' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {student.RiskLevel}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600">
                                  ID: {student.StudentID} • Class {student.StudentClass} • 
                                  Attendance: {student.AvgAttendance_LatestTerm}% • 
                                  Performance: {student.AvgMarks_LatestTerm}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notification Configuration */}
            <div className="space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Template</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${template.color.split(' ')[0]}`} />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTemplate && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSelectedTemplateInfo()?.color}`}>
                          {React.createElement(getSelectedTemplateInfo()?.icon || Bell, { className: "w-4 h-4" })}
                        </div>
                        <div>
                          <h4 className="font-medium">{getSelectedTemplateInfo()?.name}</h4>
                          <p className="text-sm text-slate-600">{getSelectedTemplateInfo()?.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recipient Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Recipients</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient-type">Recipient Type</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parents">Parents/Guardians</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="mentors">Mentors</SelectItem>
                        <SelectItem value="custom">Custom Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipientType === "custom" && (
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Message */}
              {selectedTemplate === "custom" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Custom Message</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your custom message here..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Send Button */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    onClick={handleSendNotifications}
                    disabled={isSending || selectedStudents.length === 0 || !selectedTemplate}
                    className="w-full"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {selectedStudents.length} Students
                      </>
                    )}
                  </Button>
                  
                  {selectedStudents.length > 0 && (
                    <p className="text-sm text-slate-600 mt-2 text-center">
                      Notifications will be sent to {selectedStudents.length} selected student{selectedStudents.length > 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
