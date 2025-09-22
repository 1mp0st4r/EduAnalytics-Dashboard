"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  Clock, 
  Target, 
  Users, 
  BookOpen, 
  TrendingDown,
  X,
  RefreshCw
} from "lucide-react"

interface RiskExplanation {
  level: string
  score: number
  attendance: number
  performance: number
  dropoutProbability: number
  explanation: {
    primary: string
    factors: string[]
    recommendations: string[]
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }
}

interface RiskExplanationModalProps {
  student: {
    id: string
    StudentID: string
    StudentName: string
    StudentClass: number
    AvgAttendance_LatestTerm: string
    AvgMarks_LatestTerm: string
    RiskLevel: string
    DropoutProbability: string
    RiskScore: number
    Gender: string
  }
  isOpen: boolean
  onClose: () => void
}

export function RiskExplanationModal({ student, isOpen, onClose }: RiskExplanationModalProps) {
  const [explanation, setExplanation] = useState<RiskExplanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && student) {
      fetchRiskExplanation()
    }
  }, [isOpen, student])

  const fetchRiskExplanation = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/risk-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      })
      
      const data = await response.json()
      if (data.success) {
        setExplanation(data.data.explanation)
      } else {
        setError(data.error || 'Failed to generate risk explanation')
      }
    } catch (err) {
      setError('Failed to fetch risk explanation')
      console.error('Error fetching risk explanation:', err)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return '✅'
      default: return '❓'
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Risk Assessment Explanation
          </DialogTitle>
          <DialogDescription>
            Detailed analysis for {student.StudentName} (Class {student.StudentClass})
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-slate-600">Generating risk explanation...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {explanation && !loading && (
          <div className="space-y-6">
            {/* Risk Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="flex items-center justify-between">
                  <span>Risk Assessment Overview</span>
                  <Badge className={`${getUrgencyColor(explanation.explanation.urgency)} px-3 py-1`}>
                    {getUrgencyIcon(explanation.explanation.urgency)} {explanation.explanation.urgency.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{explanation.score}</div>
                    <div className="text-sm text-slate-600">Risk Score (out of 100)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{explanation.attendance.toFixed(1)}%</div>
                    <div className="text-sm text-slate-600">Attendance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{explanation.performance.toFixed(1)}%</div>
                    <div className="text-sm text-slate-600">Academic Performance</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-800 font-medium">{explanation.explanation.primary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Identified Risk Factors
                </CardTitle>
                <CardDescription>
                  Specific factors contributing to the risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {explanation.explanation.factors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-red-800 text-sm">{factor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Recommended Interventions
                </CardTitle>
                <CardDescription>
                  Specific actions to address the identified risk factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {explanation.explanation.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-blue-800 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intervention Timeline */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Intervention Timeline
                </CardTitle>
                <CardDescription>
                  Recommended timeline for implementing interventions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Immediate Actions</h4>
                    <p className="text-purple-800 text-sm">
                      {explanation.explanation.urgency === 'critical' ? 'Within 24 hours' :
                       explanation.explanation.urgency === 'high' ? 'Within 48 hours' :
                       explanation.explanation.urgency === 'medium' ? 'Within 1 week' : 'Within 2 weeks'}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Follow-up</h4>
                    <p className="text-purple-800 text-sm">
                      {explanation.explanation.urgency === 'critical' ? 'Daily monitoring' :
                       explanation.explanation.urgency === 'high' ? 'Weekly check-ins' :
                       explanation.explanation.urgency === 'medium' ? 'Bi-weekly monitoring' : 'Monthly monitoring'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {explanation && (
            <Button onClick={fetchRiskExplanation} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
