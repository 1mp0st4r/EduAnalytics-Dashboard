"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Server,
  Plug,
  Play,
  Pause,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
} from "lucide-react"

interface DatabaseConnection {
  id: string
  name: string
  type: "mysql" | "postgresql" | "mongodb" | "sqlite"
  host: string
  port: number
  database: string
  status: "connected" | "disconnected" | "error"
  lastSync: string
  recordCount: number
}

const mockConnections: DatabaseConnection[] = [
  {
    id: "1",
    name: "StudentAnalyticsDB (Primary)",
    type: "mysql",
    host: "localhost",
    port: 3306,
    database: "StudentAnalyticsDB",
    status: "connected",
    lastSync: "2024-01-28T10:30:00Z",
    recordCount: 12470,
  },
  {
    id: "2",
    name: "Academic Records System",
    type: "mysql",
    host: "academic-db.university.edu",
    port: 3306,
    database: "academic_records",
    status: "connected",
    lastSync: "2024-01-28T09:15:00Z",
    recordCount: 45678,
  },
  {
    id: "3",
    name: "Attendance Management System",
    type: "mysql",
    host: "attendance-db.university.edu",
    port: 3306,
    database: "attendance_data",
    status: "error",
    lastSync: "2024-01-27T14:22:00Z",
    recordCount: 23456,
  },
]

const dataMapping = [
  { source: "Students.StudentID", target: "Analytics.StudentID", type: "Primary Key", status: "mapped" },
  { source: "Students.DateOfBirth", target: "Analytics.Age", type: "Calculated", status: "mapped" },
  { source: "Students.Gender", target: "Analytics.Gender", type: "ENUM", status: "mapped" },
  { source: "Students.AccommodationType", target: "Analytics.AccommodationType", type: "ENUM", status: "mapped" },
  { source: "Students.FamilyAnnualIncome", target: "Analytics.FamilyAnnualIncome", type: "Integer", status: "mapped" },
  {
    source: "Academic_Records.MarksObtained",
    target: "Analytics.AvgMarks_LatestTerm",
    type: "Calculated",
    status: "mapped",
  },
  {
    source: "Attendance.AttendancePercentage",
    target: "Analytics.AvgAttendance_LatestTerm",
    type: "Calculated",
    status: "mapped",
  },
  {
    source: "Educational_History.MarksPercentage",
    target: "Analytics.AvgPastPerformance",
    type: "Calculated",
    status: "mapped",
  },
  { source: "Student_Status_Records.IsDropout", target: "Analytics.IsDropout", type: "Boolean", status: "mapped" },
]

export default function DatabaseManagement() {
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: "",
    type: "mysql",
    host: "",
    port: 3306,
    database: "",
    username: "",
    password: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-600"
      case "disconnected":
        return "bg-gray-100 text-gray-600"
      case "error":
        return "bg-red-100 text-red-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4" />
      case "disconnected":
        return <Clock className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const testConnection = async () => {
    setIsConnecting(true)
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnecting(false)
  }

  const syncData = async () => {
    setIsSyncing(true)
    // Simulate data sync
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
          <p className="text-gray-600">Connect and manage your institutional databases for student analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={syncData} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync All"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Schema
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Run SQL Script
          </Button>
        </div>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockConnections.length}</div>
            <p className="text-sm text-gray-500">Total Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockConnections.filter((c) => c.status === "connected").length}</div>
            <p className="text-sm text-gray-500">Active Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {mockConnections.reduce((sum, c) => sum + c.recordCount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-gray-500">Database Tables</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Database Management */}
      <Tabs defaultValue="schema" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="queries">Query Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="space-y-6">
          {/* Database Schema Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                StudentAnalyticsDB Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      Primary Table
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>• StudentID (Primary Key)</div>
                    <div>• DateOfBirth, Gender</div>
                    <div>• AccommodationType</div>
                    <div>• FamilyAnnualIncome</div>
                    <div>• Parent Education Details</div>
                    <div>• Technology Access</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Academic_Records</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      Performance Data
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>• RecordID (Primary Key)</div>
                    <div>• StudentID (Foreign Key)</div>
                    <div>• Term, SubjectName</div>
                    <div>• MarksObtained, MaxMarks</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      Behavioral Data
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>• AttendanceID (Primary Key)</div>
                    <div>• StudentID (Foreign Key)</div>
                    <div>• Term, SubjectName</div>
                    <div>• AttendancePercentage</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Educational_History</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      Historical Data
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>• HistoryID (Primary Key)</div>
                    <div>• StudentID (Foreign Key)</div>
                    <div>• Qualification</div>
                    <div>• MediumOfInstruction</div>
                    <div>• MarksPercentage</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Student_Status_Records</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      Target Variable
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>• StatusID (Primary Key)</div>
                    <div>• StudentID (Foreign Key)</div>
                    <div>• IsDropout (Target)</div>
                    <div>• StatusDate, Reason</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Analytics Feature Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-700">Demographic Features</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Age, Gender, Accommodation Type</div>
                      <div>• Rural/Urban, Commute Time</div>
                      <div>• Caste Category, Admission Quota</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-700">Academic Features</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Average Past Performance</div>
                      <div>• Latest Term Average Marks</div>
                      <div>• Performance Trend, Failure Rate</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-yellow-700">Socio-Economic Features</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Family Annual Income</div>
                      <div>• Parent Education & Literacy</div>
                      <div>• First Generation Learner Status</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-red-700">Behavioral Features</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Average Attendance</div>
                      <div>• Part-time Work Status</div>
                      <div>• Technology Access (Laptop, Internet)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          {/* Existing Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Database Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Database</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockConnections.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-medium">{connection.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{connection.type.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          {connection.host}:{connection.port}
                        </TableCell>
                        <TableCell>{connection.database}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(connection.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(connection.status)}
                              {connection.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{connection.recordCount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(connection.lastSync).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
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

          {/* Add New Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5 text-green-500" />
                Add New Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conn-name">Connection Name</Label>
                  <Input
                    id="conn-name"
                    placeholder="e.g., Student Information System"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="conn-type">Database Type</Label>
                  <Select
                    value={newConnection.type}
                    onValueChange={(value) => setNewConnection({ ...newConnection, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="conn-host">Host</Label>
                  <Input
                    id="conn-host"
                    placeholder="localhost or db.example.com"
                    value={newConnection.host}
                    onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="conn-port">Port</Label>
                  <Input
                    id="conn-port"
                    type="number"
                    placeholder="3306"
                    value={newConnection.port}
                    onChange={(e) => setNewConnection({ ...newConnection, port: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="conn-database">Database Name</Label>
                  <Input
                    id="conn-database"
                    placeholder="database_name"
                    value={newConnection.database}
                    onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="conn-username">Username</Label>
                  <Input
                    id="conn-username"
                    placeholder="username"
                    value={newConnection.username}
                    onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="conn-password">Password</Label>
                  <Input
                    id="conn-password"
                    type="password"
                    placeholder="password"
                    value={newConnection.password}
                    onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={testConnection} disabled={isConnecting}>
                  {isConnecting ? "Testing..." : "Test Connection"}
                </Button>
                <Button variant="outline">Save Connection</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Data Field Mapping for Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Field</TableHead>
                      <TableHead>Target Analytics Field</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataMapping.map((mapping, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{mapping.source}</TableCell>
                        <TableCell className="font-mono text-sm">{mapping.target}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{mapping.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              mapping.status === "mapped"
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                            }
                          >
                            {mapping.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Data Synchronization & Analytics Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Sync Frequency</Label>
                    <Select defaultValue="hourly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Analytics Processing</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-calculate</SelectItem>
                        <SelectItem value="manual">Manual trigger</SelectItem>
                        <SelectItem value="scheduled">Scheduled batch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Risk Score Update</Label>
                    <Select defaultValue="sync">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sync">With data sync</SelectItem>
                        <SelectItem value="daily">Daily recalculation</SelectItem>
                        <SelectItem value="weekly">Weekly batch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Analytics Processing Progress</Label>
                  <Progress value={85} className="h-3" />
                  <p className="text-sm text-gray-500">Processing risk scores... 10,567 / 12,470 students analyzed</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={syncData} disabled={isSyncing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Processing..." : "Sync & Analyze"}
                  </Button>
                  <Button variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Processing
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                SQL Query Builder for Student Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Quick Query Templates</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-risk">High Risk Students</SelectItem>
                        <SelectItem value="low-attendance">Low Attendance Students</SelectItem>
                        <SelectItem value="first-gen">First Generation Learners</SelectItem>
                        <SelectItem value="failing">Students with Failing Grades</SelectItem>
                        <SelectItem value="rural-students">Rural Students Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="query-input">SQL Query</Label>
                  <Textarea
                    id="query-input"
                    placeholder="SELECT s.StudentID, s.Gender, s.FamilyAnnualIncome, 
       AVG(ar.MarksObtained/ar.MaxMarks*100) as AvgMarks,
       AVG(a.AttendancePercentage) as AvgAttendance
FROM Students s
JOIN Academic_Records ar ON s.StudentID = ar.StudentID
JOIN Attendance a ON s.StudentID = a.StudentID
WHERE s.IsFirstGenerationLearner = TRUE
GROUP BY s.StudentID
HAVING AvgMarks < 50 OR AvgAttendance < 75
ORDER BY AvgMarks ASC;"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button>Execute Query</Button>
                  <Button variant="outline">Validate SQL</Button>
                  <Button variant="outline">Save Query</Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="text-sm text-gray-600 mb-2">Query Results Preview:</p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    <div>StudentID | Gender | FamilyIncome | AvgMarks | AvgAttendance</div>
                    <div>---------|--------|-------------|----------|-------------</div>
                    <div>A-2025-102 | Male | 180000 | 42.1 | 67.3</div>
                    <div>A-2025-156 | Female | 150000 | 38.7 | 72.1</div>
                    <div>...</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
