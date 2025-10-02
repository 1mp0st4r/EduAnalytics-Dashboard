/**
 * Caching System for EduAnalytics Dashboard
 * Provides in-memory and persistent caching for improved performance
 */

interface CacheItem<T> {
  value: T
  expiresAt: number
  createdAt: number
  hits: number
  tags?: string[]
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[] // Tags for cache invalidation
  maxSize?: number // Maximum number of items in cache
}

export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 1000
  private hitCount = 0
  private missCount = 0

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.missCount++
      return null
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    // Update hit count
    item.hits++
    this.hitCount++
    return item.value
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const expiresAt = Date.now() + ttl

    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
      hits: 0,
      tags: options.tags
    })
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * Clear cache entries by tags
   */
  clearByTags(tags: string[]): void {
    for (const [key, item] of this.cache) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hitRate: number
    totalHits: number
    totalMisses: number
    memoryUsage: number
  } {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.hitCount,
      totalMisses: this.missCount,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Get cache keys by pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys())
    
    if (!pattern) return keys
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return keys.filter(key => regex.test(key))
  }

  /**
   * Warm up cache with data
   */
  async warmup<T>(
    key: string, 
    dataFetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await dataFetcher()
    this.set(key, data, options)
    return data
  }

  /**
   * Get or set pattern
   */
  async getOrSet<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await dataFetcher()
    this.set(key, data, options)
    return data
  }

  /**
   * Batch get multiple keys
   */
  mget<T>(keys: string[]): { [key: string]: T | null } {
    const result: { [key: string]: T | null } = {}
    
    keys.forEach(key => {
      result[key] = this.get<T>(key)
    })
    
    return result
  }

  /**
   * Batch set multiple key-value pairs
   */
  mset<T>(items: { [key: string]: T }, options: CacheOptions = {}): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, options)
    })
  }

  /**
   * Evict oldest cache entries when limit is reached
   */
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, item] of this.cache) {
      totalSize += key.length * 2 // UTF-16 string
      totalSize += JSON.stringify(item).length * 2
    }
    
    return totalSize
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Set cache configuration
   */
  configure(options: { defaultTTL?: number, maxSize?: number }): void {
    if (options.defaultTTL) {
      this.defaultTTL = options.defaultTTL
    }
    if (options.maxSize) {
      this.maxSize = options.maxSize
    }
  }
}

// Cache decorators for functions
export function cached(ttl: number = 5 * 60 * 1000, tags?: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const cache = CacheService.getInstance()

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      const cached = cache.get(key)
      if (cached !== null) {
        return cached
      }

      const result = await method.apply(this, args)
      cache.set(key, result, { ttl, tags })
      return result
    }
  }
}

// Cache keys generator
export const CacheKeys = {
  students: (filters: any = {}) => `students:${JSON.stringify(filters)}`,
  studentById: (id: string) => `student:${id}`,
  analytics: (type: string, filters: any = {}) => `analytics:${type}:${JSON.stringify(filters)}`,
  reports: (type: string, filters: any = {}) => `reports:${type}:${JSON.stringify(filters)}`,
  statistics: () => 'statistics:global',
  userPermissions: (userId: string) => `permissions:${userId}`,
  auditEvents: (filters: any = {}) => `audit:${JSON.stringify(filters)}`
}

// Cache tags for invalidation
export const CacheTags = {
  students: 'students',
  analytics: 'analytics',
  reports: 'reports',
  statistics: 'statistics',
  users: 'users',
  audit: 'audit'
}

// Export singleton instance
export const cacheService = CacheService.getInstance()

// Auto cleanup every 5 minutes
setInterval(() => {
  cacheService.cleanup()
}, 5 * 60 * 1000)