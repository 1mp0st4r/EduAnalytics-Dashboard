"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { 
  Bell, 
  AlertTriangle, 
  Mail,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Trash2,
  Archive,
  Star,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "alert" | "info" | "warning" | "success"
  priority: "low" | "medium" | "high" | "urgent"
  status: "unread" | "read" | "archived"
  timestamp: string
  studentId?: string
  studentName?: string
  actionRequired?: boolean
}

const mockNotifications: Notification[] = [
  // High Priority Alerts
  {
    id: "1",
    title: "Critical Risk Student Alert",
    message: "Rahul Sharma (Class 10) has been identified as critical risk for dropout. Immediate intervention required.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-15T10:30:00Z",
    studentId: "RJ_2025",
    studentName: "Rahul Sharma",
    actionRequired: true
  },
  {
    id: "2",
    title: "Attendance Warning",
    message: "Sunita Kumari's attendance has dropped below 70%. Parent notification sent.",
    type: "warning",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-15T09:15:00Z",
    studentId: "RJ_2026",
    studentName: "Sunita Kumari",
    actionRequired: true
  },
  {
    id: "3",
    title: "Academic Performance Decline",
    message: "Amit Kumar (Class 11) shows significant performance drop. Academic support needed.",
    type: "alert",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-15T08:45:00Z",
    studentId: "RJ_2027",
    studentName: "Amit Kumar",
    actionRequired: true
  },
  {
    id: "4",
    title: "Parent Meeting Required",
    message: "Neha Singh (Class 9) requires immediate parent meeting due to behavioral concerns.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-15T07:30:00Z",
    studentId: "RJ_2028",
    studentName: "Neha Singh",
    actionRequired: true
  },
  {
    id: "5",
    title: "Dropout Risk Escalation",
    message: "Vikram Patel (Class 12) risk level escalated from Medium to Critical. Intervention plan needed.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-14T16:20:00Z",
    studentId: "RJ_2029",
    studentName: "Vikram Patel",
    actionRequired: true
  },

  // Medium Priority Warnings
  {
    id: "6",
    title: "Attendance Below Target",
    message: "Priya Reddy (Class 10) attendance is 65%, below the 75% target. Monitoring required.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-14T15:10:00Z",
    studentId: "RJ_2030",
    studentName: "Priya Reddy",
    actionRequired: true
  },
  {
    id: "7",
    title: "Performance Alert",
    message: "Suresh Kumar (Class 11) marks dropped by 15% this term. Academic counseling scheduled.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-14T14:30:00Z",
    studentId: "RJ_2031",
    studentName: "Suresh Kumar",
    actionRequired: true
  },
  {
    id: "8",
    title: "Mentor Assignment",
    message: "Dr. Priya Sharma has been assigned as mentor to 5 new students in Class 9.",
    type: "info",
    priority: "medium",
    status: "read",
    timestamp: "2025-01-14T16:45:00Z"
  },
  {
    id: "9",
    title: "Intervention Plan Review",
    message: "Intervention plan for Rajesh Verma (Class 10) requires review after 2 weeks.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-14T13:15:00Z",
    studentId: "RJ_2032",
    studentName: "Rajesh Verma",
    actionRequired: true
  },
  {
    id: "10",
    title: "Parent Communication",
    message: "Follow-up required with parents of Kavita Sharma (Class 9) regarding academic support.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-14T12:00:00Z",
    studentId: "RJ_2033",
    studentName: "Kavita Sharma",
    actionRequired: true
  },

  // Low Priority Info
  {
    id: "11",
    title: "Monthly Report Generated",
    message: "January 2025 student performance report has been successfully generated and is ready for download.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-15T08:00:00Z"
  },
  {
    id: "12",
    title: "System Maintenance",
    message: "Scheduled maintenance will be performed on Sunday, January 21st from 2:00 AM to 4:00 AM.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-14T14:20:00Z"
  },
  {
    id: "13",
    title: "Weekly Attendance Summary",
    message: "Weekly attendance summary shows 85% overall attendance across all classes.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-13T17:00:00Z"
  },
  {
    id: "14",
    title: "New Student Enrollment",
    message: "3 new students enrolled in Class 9. Welcome emails sent to parents.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-13T15:30:00Z"
  },
  {
    id: "15",
    title: "Data Backup Complete",
    message: "Daily data backup completed successfully. All student records secured.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-13T02:00:00Z"
  },

  // Additional High Risk Students
  {
    id: "16",
    title: "Multiple Absences Alert",
    message: "Arjun Singh (Class 11) has 8 consecutive absences. Immediate parent contact required.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-13T11:45:00Z",
    studentId: "RJ_2034",
    studentName: "Arjun Singh",
    actionRequired: true
  },
  {
    id: "17",
    title: "Academic Failure Risk",
    message: "Meera Patel (Class 10) at risk of failing Mathematics and Science. Remedial classes recommended.",
    type: "alert",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-13T10:30:00Z",
    studentId: "RJ_2035",
    studentName: "Meera Patel",
    actionRequired: true
  },
  {
    id: "18",
    title: "Behavioral Concern",
    message: "Rohit Kumar (Class 9) showing disruptive behavior. Counselor intervention needed.",
    type: "warning",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-13T09:15:00Z",
    studentId: "RJ_2036",
    studentName: "Rohit Kumar",
    actionRequired: true
  },
  {
    id: "19",
    title: "Family Crisis Alert",
    message: "Sneha Reddy (Class 12) family reported financial crisis. Support services activated.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-12T16:20:00Z",
    studentId: "RJ_2037",
    studentName: "Sneha Reddy",
    actionRequired: true
  },
  {
    id: "20",
    title: "Health Concern",
    message: "Vikram Joshi (Class 11) reported health issues affecting attendance. Medical support needed.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-12T14:10:00Z",
    studentId: "RJ_2038",
    studentName: "Vikram Joshi",
    actionRequired: true
  },

  // More Medium Priority Notifications
  {
    id: "21",
    title: "Peer Support Needed",
    message: "Pooja Sharma (Class 10) isolated from peer group. Social integration program required.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-12T12:30:00Z",
    studentId: "RJ_2039",
    studentName: "Pooja Sharma",
    actionRequired: true
  },
  {
    id: "22",
    title: "Transportation Issue",
    message: "Dinesh Kumar (Class 9) facing transportation problems. Alternative arrangements needed.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-12T11:00:00Z",
    studentId: "RJ_2040",
    studentName: "Dinesh Kumar",
    actionRequired: true
  },
  {
    id: "23",
    title: "Learning Disability Support",
    message: "Anjali Verma (Class 11) requires special learning support. Resource allocation needed.",
    type: "info",
    priority: "medium",
    status: "read",
    timestamp: "2025-01-12T09:45:00Z",
    studentId: "RJ_2041",
    studentName: "Anjali Verma",
    actionRequired: false
  },
  {
    id: "24",
    title: "Scholarship Application",
    message: "Mahesh Singh (Class 12) eligible for merit scholarship. Application deadline approaching.",
    type: "info",
    priority: "medium",
    status: "read",
    timestamp: "2025-01-11T16:30:00Z",
    studentId: "RJ_2042",
    studentName: "Mahesh Singh",
    actionRequired: false
  },
  {
    id: "25",
    title: "Career Counseling",
    message: "Rashmi Patel (Class 12) needs career guidance. Counseling session scheduled.",
    type: "info",
    priority: "medium",
    status: "read",
    timestamp: "2025-01-11T15:15:00Z",
    studentId: "RJ_2043",
    studentName: "Rashmi Patel",
    actionRequired: false
  },

  // System and Administrative Notifications
  {
    id: "26",
    title: "Database Update",
    message: "Student database updated with latest academic records. All systems synchronized.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-11T13:00:00Z"
  },
  {
    id: "27",
    title: "Security Alert",
    message: "Multiple login attempts detected from unknown IP. Security protocols activated.",
    type: "warning",
    priority: "medium",
    status: "read",
    timestamp: "2025-01-11T10:30:00Z"
  },
  {
    id: "28",
    title: "Backup Verification",
    message: "Weekly backup verification completed. Data integrity confirmed.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-10T18:00:00Z"
  },
  {
    id: "29",
    title: "Software Update",
    message: "EduAnalytics Dashboard updated to version 2.1. New features available.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-10T14:20:00Z"
  },
  {
    id: "30",
    title: "Training Session",
    message: "Staff training session on new risk assessment tools scheduled for Friday.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-10T11:45:00Z"
  },

  // More Student-Specific Alerts
  {
    id: "31",
    title: "Bullying Incident",
    message: "Harassment complaint from Kavya Singh (Class 9). Immediate investigation required.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-10T09:30:00Z",
    studentId: "RJ_2044",
    studentName: "Kavya Singh",
    actionRequired: true
  },
  {
    id: "32",
    title: "Substance Abuse Concern",
    message: "Suspected substance use by Rahul Verma (Class 11). Counseling and support needed.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-09T16:45:00Z",
    studentId: "RJ_2045",
    studentName: "Rahul Verma",
    actionRequired: true
  },
  {
    id: "33",
    title: "Family Violence Alert",
    message: "Child protection concerns for Priya Kumar (Class 10). Social services notification sent.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-09T14:20:00Z",
    studentId: "RJ_2046",
    studentName: "Priya Kumar",
    actionRequired: true
  },
  {
    id: "34",
    title: "Mental Health Support",
    message: "Depression symptoms observed in Vikram Singh (Class 12). Mental health counselor assigned.",
    type: "alert",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-09T12:15:00Z",
    studentId: "RJ_2047",
    studentName: "Vikram Singh",
    actionRequired: true
  },
  {
    id: "35",
    title: "Pregnancy Support",
    message: "Teen pregnancy support needed for Anjali Patel (Class 11). Special accommodations required.",
    type: "warning",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-09T10:00:00Z",
    studentId: "RJ_2048",
    studentName: "Anjali Patel",
    actionRequired: true
  },

  // Academic Performance Notifications
  {
    id: "36",
    title: "Academic Excellence",
    message: "Outstanding performance by Ravi Kumar (Class 12). Merit certificate recommended.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-08T16:30:00Z",
    studentId: "RJ_2049",
    studentName: "Ravi Kumar",
    actionRequired: false
  },
  {
    id: "37",
    title: "Improvement Recognition",
    message: "Significant improvement shown by Sita Singh (Class 10). Progress celebration planned.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-08T14:15:00Z",
    studentId: "RJ_2050",
    studentName: "Sita Singh",
    actionRequired: false
  },
  {
    id: "38",
    title: "Subject Mastery",
    message: "Mathematics excellence by Deepak Verma (Class 11). Advanced placement recommended.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-08T12:00:00Z",
    studentId: "RJ_2051",
    studentName: "Deepak Verma",
    actionRequired: false
  },
  {
    id: "39",
    title: "Creative Achievement",
    message: "Art competition winner Priya Reddy (Class 9). Cultural program participation encouraged.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-08T10:30:00Z",
    studentId: "RJ_2052",
    studentName: "Priya Reddy",
    actionRequired: false
  },
  {
    id: "40",
    title: "Sports Excellence",
    message: "Athletic achievement by Rohit Sharma (Class 10). Sports scholarship opportunity available.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-08T08:45:00Z",
    studentId: "RJ_2053",
    studentName: "Rohit Sharma",
    actionRequired: false
  },

  // Attendance and Discipline
  {
    id: "41",
    title: "Perfect Attendance",
    message: "100% attendance achieved by Kavita Joshi (Class 9). Recognition ceremony planned.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-07T17:00:00Z",
    studentId: "RJ_2054",
    studentName: "Kavita Joshi",
    actionRequired: false
  },
  {
    id: "42",
    title: "Disciplinary Action",
    message: "Disciplinary action required for Amit Singh (Class 11) due to rule violations.",
    type: "warning",
    priority: "medium",
    status: "unread",
    timestamp: "2025-01-07T15:30:00Z",
    studentId: "RJ_2055",
    studentName: "Amit Singh",
    actionRequired: true
  },
  {
    id: "43",
    title: "Community Service",
    message: "Community service hours completed by Neha Kumar (Class 12). Certificate awarded.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-07T13:15:00Z",
    studentId: "RJ_2056",
    studentName: "Neha Kumar",
    actionRequired: false
  },
  {
    id: "44",
    title: "Leadership Role",
    message: "Student council nomination for Vikram Patel (Class 11). Leadership development opportunity.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-07T11:00:00Z",
    studentId: "RJ_2057",
    studentName: "Vikram Patel",
    actionRequired: false
  },
  {
    id: "45",
    title: "Peer Mentoring",
    message: "Peer mentoring assignment for senior student Suresh Reddy (Class 12).",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-07T09:30:00Z",
    studentId: "RJ_2058",
    studentName: "Suresh Reddy",
    actionRequired: false
  },

  // Technology and System Updates
  {
    id: "46",
    title: "Mobile App Update",
    message: "EduAnalytics mobile app updated with new notification features. Update recommended.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-06T16:00:00Z"
  },
  {
    id: "47",
    title: "Data Analytics Report",
    message: "Weekly analytics report generated. Performance trends analyzed and documented.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-06T14:30:00Z"
  },
  {
    id: "48",
    title: "Integration Success",
    message: "Parent portal integration completed successfully. Communication channels enhanced.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-06T12:15:00Z"
  },
  {
    id: "49",
    title: "API Performance",
    message: "System API performance optimized. Response times improved by 40%.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2025-01-06T10:00:00Z"
  },
  {
    id: "50",
    title: "Feature Release",
    message: "New predictive analytics feature released. Enhanced risk assessment capabilities available.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2025-01-05T17:30:00Z"
  },

  // Final Critical Alerts
  {
    id: "51",
    title: "Emergency Contact",
    message: "Emergency contact required for Arjun Verma (Class 10) due to medical emergency.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-05T15:45:00Z",
    studentId: "RJ_2059",
    studentName: "Arjun Verma",
    actionRequired: true
  },
  {
    id: "52",
    title: "Crisis Intervention",
    message: "Crisis intervention needed for suicidal ideation in student Meera Singh (Class 11).",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-05T13:20:00Z",
    studentId: "RJ_2060",
    studentName: "Meera Singh",
    actionRequired: true
  },
  {
    id: "53",
    title: "Legal Notification",
    message: "Legal proceedings notification for family of Rahul Patel (Class 9). Support services activated.",
    type: "alert",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-05T11:00:00Z",
    studentId: "RJ_2061",
    studentName: "Rahul Patel",
    actionRequired: true
  },
  {
    id: "54",
    title: "Housing Instability",
    message: "Housing instability reported for family of Kavya Kumar (Class 10). Emergency support needed.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2025-01-05T09:30:00Z",
    studentId: "RJ_2062",
    studentName: "Kavya Kumar",
    actionRequired: true
  },
  {
    id: "55",
    title: "Food Insecurity",
    message: "Food insecurity concerns for Priya Singh (Class 11). Meal assistance program activated.",
    type: "warning",
    priority: "high",
    status: "unread",
    timestamp: "2025-01-05T08:15:00Z",
    studentId: "RJ_2063",
    studentName: "Priya Singh",
    actionRequired: true
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "success": return "bg-green-100 text-green-800 border-green-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "medium": return "bg-yellow-500 text-white"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert": return AlertTriangle
      case "warning": return AlertTriangle
      case "success": return CheckCircle
      case "info": return Bell
      default: return Bell
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus
    return matchesType && matchesPriority && matchesStatus
  })

  const unreadCount = notifications.filter(n => n.status === "unread").length
  const urgentCount = notifications.filter(n => n.priority === "urgent" && n.status === "unread").length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: "read" as const } : n)
    )
  }

  const markAsArchived = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: "archived" as const } : n)
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, status: "read" as const }))
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-80">
        <Header 
          onRefresh={() => {}}
          notificationCount={unreadCount}
        />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600">Stay updated with important alerts and system notifications</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button onClick={() => window.location.href = '/notifications/send'}>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Notifications</p>
                    <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Unread</p>
                    <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Urgent</p>
                    <p className="text-2xl font-bold text-orange-900">{urgentCount}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Action Required</p>
                    <p className="text-2xl font-bold text-green-900">
                      {notifications.filter(n => n.actionRequired).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
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
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-slate-600" />
                <span>Notifications ({filteredNotifications.length})</span>
              </CardTitle>
              <CardDescription>
                Manage and respond to system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getTypeIcon(notification.type)
                  const isUnread = notification.status === "unread"
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        isUnread ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-medium ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {notification.title}
                                </h3>
                                {isUnread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                {notification.actionRequired && (
                                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                </div>
                                {notification.studentName && (
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{notification.studentName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsArchived(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {filteredNotifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications found</h3>
                  <p className="text-slate-600">Try adjusting your filters or check back later for new notifications.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
