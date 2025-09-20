"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface DatabaseTestResult {
  success: boolean
  message: string
  data?: {
    connection: string
    statistics: {
      totalStudents: number
      highRiskStudents: number
      mediumRiskStudents: number
      lowRiskStudents: number
      criticalRiskStudents: number
      dropoutStudents: number
      avgAttendance: number
      avgPerformance: number
    }
    sampleStudents: Array<{
      StudentID: string
      RiskLevel: string
      RiskScore: number
      IsDropout: boolean
    }>
  }
  error?: string
}

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDatabase = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-db')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test database",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Critical":
        return "bg-red-600 text-white"
      case "High":
        return "bg-red-100 text-red-600"
      case "Medium":
        return "bg-yellow-100 text-yellow-600"
      case "Low":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Connection Test
          </CardTitle>
          <CardDescription>
            Test the MySQL database connection and verify data import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testDatabase} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Database...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Test Database Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "Success" : "Failed"}
                </Badge>
              </div>
              
              <div>
                <span className="font-medium">Message:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {testResult.message}
                </p>
              </div>

              {testResult.error && (
                <div>
                  <span className="font-medium text-red-600">Error:</span>
                  <p className="text-sm text-red-600 mt-1">
                    {testResult.error}
                  </p>
                </div>
              )}

              {testResult.success && testResult.data && (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Connection:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {testResult.data.connection}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium">Statistics:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-2xl font-bold text-primary">
                          {testResult.data.statistics.totalStudents}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Students</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-2xl font-bold text-red-600">
                          {testResult.data.statistics.criticalRiskStudents}
                        </div>
                        <div className="text-xs text-muted-foreground">Critical Risk</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-2xl font-bold text-yellow-600">
                          {testResult.data.statistics.highRiskStudents}
                        </div>
                        <div className="text-xs text-muted-foreground">High Risk</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {testResult.data.statistics.lowRiskStudents}
                        </div>
                        <div className="text-xs text-muted-foreground">Low Risk</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Sample Students:</span>
                    <div className="space-y-2 mt-2">
                      {testResult.data.sampleStudents.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono text-sm">{student.StudentID}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskBadgeColor(student.RiskLevel)}>
                              {student.RiskLevel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Score: {student.RiskScore}
                            </span>
                            {student.IsDropout && (
                              <Badge variant="destructive">Dropped Out</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

