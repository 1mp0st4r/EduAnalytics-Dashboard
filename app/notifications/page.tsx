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
  {
    id: "1",
    title: "High Risk Student Alert",
    message: "Rahul Sharma (Class 10) has been identified as high risk for dropout. Immediate intervention required.",
    type: "alert",
    priority: "urgent",
    status: "unread",
    timestamp: "2024-01-15T10:30:00Z",
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
    timestamp: "2024-01-15T09:15:00Z",
    studentId: "RJ_2026",
    studentName: "Sunita Kumari",
    actionRequired: true
  },
  {
    id: "3",
    title: "Monthly Report Generated",
    message: "January 2024 student performance report has been successfully generated and is ready for download.",
    type: "success",
    priority: "low",
    status: "read",
    timestamp: "2024-01-15T08:00:00Z"
  },
  {
    id: "4",
    title: "Mentor Assignment",
    message: "Dr. Priya Sharma has been assigned as mentor to 5 new students in Class 9.",
    type: "info",
    priority: "medium",
    status: "read",
    timestamp: "2024-01-14T16:45:00Z"
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "Scheduled maintenance will be performed on Sunday, January 21st from 2:00 AM to 4:00 AM.",
    type: "info",
    priority: "low",
    status: "read",
    timestamp: "2024-01-14T14:20:00Z"
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
              <Button>
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
