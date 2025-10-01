"use client"

// Simple in-memory cache (in production, use Redis or similar)
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000 // Maximum number of entries

  // Set cache entry
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to track hits/misses for this
    }
  }

  // Clean expired entries
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheService = new CacheService()

// Cache keys
export const CACHE_KEYS = {
  STUDENTS: 'students',
  STUDENT: (id: string) => `student:${id}`,
  MENTORS: 'mentors',
  MENTOR: (id: string) => `mentor:${id}`,
  MENTOR_STUDENTS: (id: string) => `mentor_students:${id}`,
  MENTOR_STATS: (id: string) => `mentor_stats:${id}`,
  INTERVENTIONS: 'interventions',
  INTERVENTION: (id: string) => `intervention:${id}`,
  ASSIGNMENTS: 'assignments',
  ANALYTICS: 'analytics',
  USER: (id: string) => `user:${id}`,
  CHAT_HISTORY: (userId: string, conversationId?: string) => 
    conversationId ? `chat:${userId}:${conversationId}` : `chat:${userId}`
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000 // 1 hour
}

// Cache wrapper for API calls
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = cacheService.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch data and cache it
  try {
    const data = await fetcher()
    cacheService.set(key, data, ttl)
    return data
  } catch (error) {
    console.error(`Cache fetch error for key ${key}:`, error)
    throw error
  }
}

// Invalidate cache entries by pattern
export function invalidateCache(pattern: string): void {
  const regex = new RegExp(pattern)
  for (const key of cacheService['cache'].keys()) {
    if (regex.test(key)) {
      cacheService.delete(key)
    }
  }
}

// Cache middleware for API routes
export function cacheMiddleware(ttl: number = CACHE_TTL.MEDIUM) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      // Try cache first
      const cached = cacheService.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      cacheService.set(cacheKey, result, ttl)
      return result
    }
  }
}

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  cacheService.cleanExpired()
}, 5 * 60 * 1000)

// Database query optimization helpers
export const QueryOptimizer = {
  // Add pagination to queries
  addPagination(query: string, page: number = 1, limit: number = 10): string {
    const offset = (page - 1) * limit
    return `${query} LIMIT ${limit} OFFSET ${offset}`
  },

  // Add search filters
  addSearch(query: string, searchTerm: string, searchFields: string[]): string {
    if (!searchTerm) return query

    const searchConditions = searchFields
      .map(field => `LOWER(${field}) LIKE LOWER('%${searchTerm}%')`)
      .join(' OR ')

    const whereClause = query.includes('WHERE') ? 'AND' : 'WHERE'
    return `${query} ${whereClause} (${searchConditions})`
  },

  // Add sorting
  addSorting(query: string, sortBy: string, sortOrder: 'ASC' | 'DESC' = 'ASC'): string {
    return `${query} ORDER BY ${sortBy} ${sortOrder}`
  },

  // Add date range filter
  addDateRange(
    query: string, 
    dateField: string, 
    startDate?: string, 
    endDate?: string
  ): string {
    if (!startDate && !endDate) return query

    let dateCondition = ''
    if (startDate && endDate) {
      dateCondition = `${dateField} BETWEEN '${startDate}' AND '${endDate}'`
    } else if (startDate) {
      dateCondition = `${dateField} >= '${startDate}'`
    } else if (endDate) {
      dateCondition = `${dateField} <= '${endDate}'`
    }

    const whereClause = query.includes('WHERE') ? 'AND' : 'WHERE'
    return `${query} ${whereClause} ${dateCondition}`
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  static startTimer(label: string): void {
    this.timers.set(label, performance.now())
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`Timer ${label} was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(label)
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static measureAsync<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label)
    return operation().finally(() => {
      this.endTimer(label)
    })
  }
}

// Export cache service as default
export default cacheService
