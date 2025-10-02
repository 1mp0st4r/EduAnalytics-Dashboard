import { NextRequest, NextResponse } from "next/server"
import { cacheService } from "../../../../lib/cache"
import { databaseOptimizer } from "../../../../lib/database-optimizer"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const cacheStats = cacheService.getStats()
    
    // Get database statistics
    const databaseStats = databaseOptimizer.getDatabaseStats()
    
    // Mock system statistics (in production, these would come from system monitoring)
    const systemStats = {
      memoryUsage: Math.floor(Math.random() * 500000000) + 200000000, // 200MB - 700MB
      cpuUsage: Math.floor(Math.random() * 40) + 20, // 20% - 60%
      responseTime: Math.floor(Math.random() * 300) + 50, // 50ms - 350ms
      uptime: Date.now() - (Math.floor(Math.random() * 86400000) + 3600000) // 1 hour to 1 day
    }

    const performanceStats = {
      cache: cacheStats,
      database: databaseStats,
      system: systemStats,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: performanceStats
    })

  } catch (error) {
    console.error('[API] Error fetching performance stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance statistics' },
      { status: 500 }
    )
  }
}
