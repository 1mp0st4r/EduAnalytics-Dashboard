"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  GraduationCap,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Eye,
  Filter
} from "lucide-react"
import { SimpleChart } from "@/components/ui/simple-chart"

interface AnalyticsData {
  trends: any
  predictions: any
  interventions: any
  comparative: any
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')
  const [selectedMetric, setSelectedMetric] = useState('all')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedTimeframe])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const [trendsRes, predictionsRes, interventionsRes, comparativeRes] = await Promise.all([
        fetch('/api/analytics/insights?type=trends'),
        fetch('/api/analytics/insights?type=predictions'),
        fetch('/api/analytics/insights?type=interventions'),
        fetch('/api/analytics/insights?type=comparative')
      ])

      const [trends, predictions, interventions, comparative] = await Promise.all([
        trendsRes.json(),
        predictionsRes.json(),
        interventionsRes.json(),
        comparativeRes.json()
      ])

      setData({
        trends: trends.data,
        predictions: predictions.data,
        interventions: interventions.data,
        comparative: comparative.data
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'analytics',
          format: format,
          includeCharts: true,
          filters: {
            timeframe: selectedTimeframe,
            metric: selectedMetric
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics_${selectedTimeframe}_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and predictions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="risk">Risk Analysis</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.predictions.totalAtRisk}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5.2%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Dropouts</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.predictions.nextMonthDropouts.total}</div>
            <p className="text-xs text-muted-foreground">
              Confidence: {data.predictions.nextMonthDropouts.confidence}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interventions</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.interventions.interventionTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Success rate: {data.interventions.successRates.overallSuccessRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Allocation</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.predictions.resourceAllocation.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Budget utilization: 78%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="comparative">Comparative</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.trends.riskTrends.map((trend: any) => ({
                    label: trend.level,
                    value: trend.count
                  }))}
                  type="bar"
                  title="Risk Distribution"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.trends.performanceTrends.map((trend: any) => ({
                    label: trend.range,
                    value: trend.count
                  }))}
                  type="pie"
                  title="Performance Distribution"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.trends.seasonalPatterns.map((pattern: any) => ({
                    label: pattern.month,
                    value: parseFloat(pattern.attendanceRate)
                  }))}
                  type="line"
                  title="Monthly Attendance Trends"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropout Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Next 6 months</span>
                    <Badge variant="destructive">
                      {data.trends.dropoutPredictions.predictedDropouts} students
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence</span>
                    <Badge variant="secondary">
                      {data.trends.dropoutPredictions.confidence}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Factors:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {data.trends.dropoutPredictions.factors.map((factor: string, index: number) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Month Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {data.predictions.nextMonthDropouts.criticalRisk.predictedDropouts}
                      </div>
                      <div className="text-sm text-red-600">Critical Risk</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {data.predictions.nextMonthDropouts.highRisk.predictedDropouts}
                      </div>
                      <div className="text-sm text-orange-600">High Risk</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      Total: {data.predictions.nextMonthDropouts.total}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {data.predictions.nextMonthDropouts.confidence}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.predictions.resourceAllocation.allocations.map((allocation: any) => ({
                    label: allocation.category,
                    value: allocation.amount
                  }))}
                  type="pie"
                  title="Budget Distribution"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Early Warning Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.predictions.earlyWarningSignals.signals.map((signal: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{signal.signal}</h4>
                        <Badge 
                          variant={signal.severity === 'Critical' ? 'destructive' : 
                                  signal.severity === 'High' ? 'destructive' : 'secondary'}
                        >
                          {signal.severity}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">{signal.count}</div>
                      <p className="text-sm text-muted-foreground">{signal.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intervention Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.interventions.interventionTypes.map((intervention: any) => ({
                    label: intervention.type,
                    value: intervention.successRate
                  }))}
                  type="bar"
                  title="Success Rates"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost-Benefit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${data.interventions.costBenefit.totalInvestment.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Investment</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {data.interventions.costBenefit.roi}%
                      </div>
                      <div className="text-sm text-green-600">ROI</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {data.interventions.costBenefit.studentsRetained} students retained
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Break-even: {data.interventions.costBenefit.breakEvenPoint}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Intervention Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.interventions.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.type}</h4>
                        <div className="flex gap-2">
                          <Badge 
                            variant={rec.priority === 'Critical' ? 'destructive' : 
                                    rec.priority === 'High' ? 'destructive' : 'secondary'}
                          >
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {rec.students} students
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Cost: ${rec.estimatedCost.toLocaleString()}</span>
                        <span className="text-green-600">{rec.expectedOutcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.comparative.classComparison.map((comp: any) => ({
                    label: `Class ${comp.class}`,
                    value: parseFloat(comp.highRiskPercentage)
                  }))}
                  type="bar"
                  title="High Risk Students by Class"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.comparative.genderComparison.map((comp: any) => ({
                    label: comp.gender,
                    value: parseFloat(comp.avgPerformance)
                  }))}
                  type="pie"
                  title="Average Performance by Gender"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.comparative.schoolComparison.map((school: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{school.school}</h4>
                        <p className="text-sm text-muted-foreground">
                          {school.totalStudents} students
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {school.highRiskCount} high risk
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {school.dropoutRate}% dropout rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={data.comparative.regionalAnalysis.map((region: any) => ({
                    label: region.region,
                    value: parseFloat(region.dropoutRate)
                  }))}
                  type="bar"
                  title="Dropout Rate by Region"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
