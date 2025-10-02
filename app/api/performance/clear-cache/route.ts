import { NextRequest, NextResponse } from "next/server"
import { cacheService } from "../../../../lib/cache"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { tags } = await request.json().catch(() => ({}))
    
    if (tags && Array.isArray(tags)) {
      // Clear cache by specific tags
      cacheService.clearByTags(tags)
    } else {
      // Clear all cache
      cacheService.clear()
    }

    return NextResponse.json({
      success: true,
      message: tags ? `Cache cleared for tags: ${tags.join(', ')}` : 'All cache cleared successfully'
    })

  } catch (error) {
    console.error('[API] Error clearing cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
