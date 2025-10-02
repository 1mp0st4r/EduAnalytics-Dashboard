"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Gauge
} from "lucide-react"

interface PerformanceStats {
  cache: {
    size: number
    hitRate: number
    totalHits: number
    totalMisses: number
    memoryUsage: number
  }
  database: {
    totalQueries: number
    avgExecutionTime: number
    cacheHitRate: number
    slowQueries: Array<{
      query: string
      executionTime: number
      timestamp: number
      cached: boolean
    }>
    connectionPool: {
      active: number
      idle: number
      total: number
    }
  }
  system: {
    memoryUsage: number
    cpuUsage: number
    responseTime: number
    uptime: number
  }
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchPerformanceStats()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchPerformanceStats, 5000) // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch('/api/performance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch('/api/performance/clear-cache', {
        method: 'POST'
      })
      if (response.ok) {
        fetchPerformanceStats()
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  const getPerformanceColor = (value: number, thresholds: { good: number, warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load performance data</p>
        <Button onClick={fetchPerformanceStats} className="mt-4">
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
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Monitor system performance and optimize resources</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchPerformanceStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearCache}>
            <Zap className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.cache.hitRate, { good: 80, warning: 60 })}`}>
              {stats.cache.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cache.totalHits} hits / {stats.cache.totalMisses} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.database.avgExecutionTime, { good: 100, warning: 500 })}`}>
              {formatDuration(stats.database.avgExecutionTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.database.totalQueries} total queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.system.memoryUsage, { good: 70, warning: 85 })}`}>
              {formatBytes(stats.system.memoryUsage)}
            </div>
            <p className="text-xs text-muted-foreground">
              System memory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.system.responseTime, { good: 200, warning: 500 })}`}>
              {formatDuration(stats.system.responseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              API response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cache" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hit Rate</span>
                    <span>{stats.cache.hitRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.cache.hitRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Hits</div>
                    <div className="font-semibold">{stats.cache.totalHits}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Misses</div>
                    <div className="font-semibold">{stats.cache.totalMisses}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cache Size</div>
                    <div className="font-semibold">{stats.cache.size} items</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Memory Usage</div>
                    <div className="font-semibold">{formatBytes(stats.cache.memoryUsage)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Status</span>
                    <Badge variant={stats.cache.hitRate > 70 ? "default" : "destructive"}>
                      {stats.cache.hitRate > 70 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Efficiency</span>
                    <Badge variant={stats.cache.memoryUsage < 1000000 ? "default" : "secondary"}>
                      {stats.cache.memoryUsage < 1000000 ? "Optimal" : "High Usage"}
                    </Badge>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" onClick={clearCache} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Queries</div>
                    <div className="text-2xl font-bold">{stats.database.totalQueries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Execution Time</div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(stats.database.avgExecutionTime, { good: 100, warning: 500 })}`}>
                      {formatDuration(stats.database.avgExecutionTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                    <div className="text-2xl font-bold">{stats.database.cacheHitRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Slow Queries</div>
                    <div className="text-2xl font-bold text-orange-600">{stats.database.slowQueries.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slow Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.database.slowQueries.length > 0 ? (
                    stats.database.slowQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{query.query}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(query.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {formatDuration(query.executionTime)}
                          </Badge>
                          {query.cached ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No slow queries detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{formatBytes(stats.system.memoryUsage)}</span>
                  </div>
                  <Progress value={stats.system.memoryUsage / 1000000000 * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{stats.system.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.system.cpuUsage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Response Time</div>
                    <div className="font-semibold">{formatDuration(stats.system.responseTime)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div className="font-semibold">{formatDuration(stats.system.uptime)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Status</span>
                    <Badge variant={stats.system.memoryUsage < 800000000 ? "default" : "destructive"}>
                      {stats.system.memoryUsage < 800000000 ? "Healthy" : "High Usage"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Status</span>
                    <Badge variant={stats.system.cpuUsage < 70 ? "default" : "destructive"}>
                      {stats.system.cpuUsage < 70 ? "Normal" : "High Load"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant={stats.system.responseTime < 500 ? "default" : "destructive"}>
                      {stats.system.responseTime < 500 ? "Fast" : "Slow"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.cache.hitRate < 70 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Low Cache Hit Rate</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Consider increasing cache TTL or implementing more aggressive caching strategies.
                      </p>
                    </div>
                  )}

                  {stats.database.avgExecutionTime > 500 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">Slow Database Queries</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Database queries are taking longer than expected. Consider adding indexes or optimizing queries.
                      </p>
                    </div>
                  )}

                  {stats.system.memoryUsage > 800000000 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">High Memory Usage</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Memory usage is high. Consider clearing cache or optimizing data structures.
                      </p>
                    </div>
                  )}

                  {stats.cache.hitRate > 80 && stats.database.avgExecutionTime < 200 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Excellent Performance</span>
                      </div>
                      <p className="text-sm text-green-700">
                        System is performing optimally with good cache hit rates and fast query times.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Query Performance
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Gauge className="h-4 w-4 mr-2" />
                    Optimize Database Indexes
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Clear All Caches
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
