"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  AlertTriangle, 
  CheckCircle, 
  Flag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Search,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RiskFlag {
  id: string
  studentId: string
  flagType: 'red' | 'green' | 'neutral'
  category: 'academic' | 'socioeconomic' | 'family' | 'behavioral' | 'infrastructure'
  factor: string
  description: string
  impact: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  identifiedAt: string
  lastUpdated: string
  metadata?: {
    source: 'shap_analysis' | 'manual' | 'automated'
    confidence: number
    modelVersion?: string
  }
}

interface RiskProfile {
  studentId: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  dropoutProbability: number
  totalFlags: number
  redFlags: RiskFlag[]
  greenFlags: RiskFlag[]
  neutralFlags: RiskFlag[]
  lastAnalyzed: string
  analysisSource: 'ml_model' | 'fallback' | 'manual'
}

interface RiskStatistics {
  totalStudents: number
  byRiskLevel: { [key: string]: number }
  byFlagType: { [key: string]: number }
  byCategory: { [key: string]: number }
  topRiskFactors: { [key: string]: number }
}

export function RiskFlagsDashboard() {
  const [flags, setFlags] = useState<RiskFlag[]>([])
  const [profiles, setProfiles] = useState<RiskProfile[]>([])
  const [statistics, setStatistics] = useState<RiskStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFlagType, setSelectedFlagType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchRiskData()
  }, [])

  const fetchRiskData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/risk-flags/stats')
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.data.statistics)
        setFlags(data.data.flags)
        setProfiles(data.data.profiles)
      }
    } catch (error) {
      console.error('Error fetching risk data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch risk flags data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getFlagIcon = (flagType: string) => {
    switch (flagType) {
      case 'red': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'green': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Flag className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'socioeconomic': return 'bg-purple-100 text-purple-800'
      case 'family': return 'bg-green-100 text-green-800'
      case 'behavioral': return 'bg-orange-100 text-orange-800'
      case 'infrastructure': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const filteredFlags = flags.filter(flag => {
    if (selectedCategory !== 'all' && flag.category !== selectedCategory) return false
    if (selectedFlagType !== 'all' && flag.flagType !== selectedFlagType) return false
    if (searchQuery && !flag.factor.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !flag.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading risk flags data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Flags Dashboard</h2>
          <p className="text-muted-foreground">Monitor and analyze student risk factors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRiskData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Students analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Red Flags</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.byFlagType.red || 0}</div>
              <p className="text-xs text-muted-foreground">
                Risk factors identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Green Flags</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.byFlagType.green || 0}</div>
              <p className="text-xs text-muted-foreground">
                Protective factors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.byRiskLevel.Critical || 0}</div>
              <p className="text-xs text-muted-foreground">
                Critical risk students
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flags">Risk Flags</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && (
                  <div className="space-y-3">
                    {Object.entries(statistics.byRiskLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(level.toLowerCase())}>
                            {level}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Flags by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && (
                  <div className="space-y-3">
                    {Object.entries(statistics.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <Badge className={getCategoryColor(category)}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && (
                  <div className="space-y-2">
                    {Object.entries(statistics.topRiskFactors)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([factor, count]) => (
                        <div key={factor} className="flex items-center justify-between">
                          <span className="text-sm">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profiles.slice(0, 5).map((profile) => (
                    <div key={profile.studentId} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{profile.studentId}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.totalFlags} flags • {formatTimestamp(profile.lastAnalyzed)}
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(profile.riskLevel.toLowerCase())}>
                        {profile.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search flags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="socioeconomic">Socioeconomic</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFlagType} onValueChange={setSelectedFlagType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="red">Red Flags</SelectItem>
                    <SelectItem value="green">Green Flags</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Flags List */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Flags ({filteredFlags.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFlags.map((flag) => (
                  <div key={flag.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getFlagIcon(flag.flagType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{flag.factor}</span>
                            <Badge variant={getSeverityColor(flag.severity)}>
                              {flag.severity}
                            </Badge>
                            <Badge className={getCategoryColor(flag.category)}>
                              {flag.category}
                            </Badge>
                            {flag.metadata?.source === 'shap_analysis' && (
                              <Badge variant="outline">SHAP</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {flag.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div>Student: {flag.studentId}</div>
                            <div>Impact: {flag.impact.toFixed(2)}</div>
                            <div>Confidence: {(flag.metadata?.confidence || 0.5) * 100}%</div>
                            <div>{formatTimestamp(flag.identifiedAt)}</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredFlags.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No risk flags found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Risk Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.studentId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{profile.studentId}</h3>
                        <Badge variant={getSeverityColor(profile.riskLevel.toLowerCase())}>
                          {profile.riskLevel}
                        </Badge>
                        <Badge variant="outline">
                          {profile.dropoutProbability.toFixed(1)}% dropout risk
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>{profile.redFlags.length} red flags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{profile.greenFlags.length} green flags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>{profile.totalFlags} total flags</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground">
                      Last analyzed: {formatTimestamp(profile.lastAnalyzed)} • 
                      Source: {profile.analysisSource}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Risk factor trend analysis and patterns over time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervention Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analysis of intervention effectiveness based on risk flag changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
