import { NextRequest, NextResponse } from "next/server"
import { neonService } from "../../../lib/neon-service"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Health check endpoint for monitoring
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const dbStartTime = Date.now()
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    
    try {
      await neonService.testConnection()
      dbResponseTime = Date.now() - dbStartTime
    } catch (error) {
      dbStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'NEXTAUTH_SECRET'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }

    // Determine overall health status
    const isHealthy = dbStatus === 'healthy' && missingEnvVars.length === 0
    const overallStatus = isHealthy ? 'healthy' : 'unhealthy'

    const responseTime = Date.now() - startTime

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`
        },
        environment: {
          status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
          missingVariables: missingEnvVars
        },
        memory: {
          status: memoryUsageMB.heapUsed < 500 ? 'healthy' : 'warning',
          usage: memoryUsageMB
        }
      }
    }

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
