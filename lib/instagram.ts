import { InstagramVideoStats } from './types'

/**
 * Parse Instagram URL to extract video ID
 * Supports both reel and post formats:
 * - https://www.instagram.com/reel/ABC123/
 * - https://www.instagram.com/p/ABC123/
 */
export function extractInstagramVideoId(url: string): string | null {
  try {
    const patterns = [
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Normalize Instagram URL to standard format
 */
export function normalizeInstagramUrl(url: string): string {
  try {
    // Remove trailing slashes and query params
    url = url.replace(/\/$/, '').split('?')[0]
    
    // If it's a reel/post/tv link, ensure it ends with /
    if (url.includes('/reel/') || url.includes('/p/') || url.includes('/tv/')) {
      if (!url.endsWith('/')) {
        url += '/'
      }
    }
    
    return url
  } catch {
    return url
  }
}

/**
 * Fetch Instagram video stats using InstaScrape API (real data)
 * Returns actual views, likes, comments from Instagram posts
 */
export async function fetchInstagramVideoStats(url: string): Promise<InstagramVideoStats | null> {
  try {
    const videoId = extractInstagramVideoId(url)
    
    if (!videoId) {
      console.error('Invalid Instagram URL format')
      return null
    }

    // Use InstaScrape.io API - free tier with real Instagram data
    // Alternative: Use Instagram's Graph API with token if available
    try {
      const apiUrl = `https://www.instagram.com/graphql/query/?query_hash=b3055c4b4e8face2f9829f7304226b99&variables={"shortcode":"${videoId}"}`
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
        },
        next: { revalidate: 3600 }
      })

      if (response.ok) {
        const data = await response.json()
        const stats = parseInstagramGraphQL(data)
        if (stats) {
          console.log('Fetched real Instagram stats:', stats)
          return stats
        }
      }
    } catch (e) {
      console.warn('GraphQL endpoint failed, trying alternative method')
    }

    // Fallback: Try oembed endpoint (works for public posts)
    try {
      const oembedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(normalizeInstagramUrl(url))}`
      const response = await fetch(oembedUrl, {
        next: { revalidate: 3600 }
      })

      if (response.ok) {
        const data = await response.json()
        // oembed doesn't have stats, but we can extract from HTML
        if (data.html) {
          const stats = extractStatsFromHtml(data.html)
          if (stats) return stats
        }
      }
    } catch (e) {
      console.warn('Oembed endpoint failed')
    }

    // Fallback: Fetch page HTML and parse stats from script tag
    try {
      const pageResponse = await fetch(normalizeInstagramUrl(url), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 3600 }
      })

      if (pageResponse.ok) {
        const html = await pageResponse.text()
        const stats = parseInstagramHtml(html)
        if (stats) return stats
      }
    } catch (e) {
      console.warn('HTML parsing failed')
    }

    console.log('Could not fetch real Instagram data - please enter manually')
    return null
  } catch (error) {
    console.error('Error fetching Instagram stats:', error)
    return null
  }
}

/**
 * Parse Instagram GraphQL response for real stats
 */
function parseInstagramGraphQL(data: any): InstagramVideoStats | null {
  try {
    const post = data?.data?.shortcode_media
    
    if (post) {
      return {
        views: post.video_view_count || post.plays || 0,
        likes: post.edge_media_preview_like?.count || post.edge_liked_by?.count || 0,
        comments: post.edge_media_to_comment?.count || post.edge_media_to_parent_comment?.count || 0,
      }
    }
    return null
  } catch (error) {
    console.warn('Failed to parse GraphQL response:', error)
    return null
  }
}

/**
 * Extract stats from Instagram HTML page
 */
function parseInstagramHtml(html: string): InstagramVideoStats | null {
  try {
    // Look for data in script tags
    const scriptMatch = html.match(/<script[^>]*>window._sharedData\s*=\s*({.*?})<\/script>/s)
    if (scriptMatch) {
      const data = JSON.parse(scriptMatch[1])
      const post = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media
      
      if (post) {
        return {
          views: post.video_view_count || 0,
          likes: post.edge_media_preview_like?.count || post.edge_liked_by?.count || 0,
          comments: post.edge_media_to_comment?.count || post.edge_media_to_parent_comment?.count || 0,
        }
      }
    }

    // Fallback: Extract from meta tags
    const likesMatch = html.match(/"edge_liked_by":{"count":(\d+)}/)
    const commentsMatch = html.match(/"edge_media_to_parent_comment":{"count":(\d+)}/)
    const viewsMatch = html.match(/"video_view_count":(\d+)/)

    if (likesMatch || commentsMatch || viewsMatch) {
      return {
        views: parseInt(viewsMatch?.[1] || '0'),
        likes: parseInt(likesMatch?.[1] || '0'),
        comments: parseInt(commentsMatch?.[1] || '0'),
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to parse HTML:', error)
    return null
  }
}

/**
 * Extract stats from oembed HTML
 */
function extractStatsFromHtml(html: string): InstagramVideoStats | null {
  try {
    // Instagram oembed HTML contains stats in the caption
    const likesMatch = html.match(/(\d+)\s*likes?/i)
    const commentsMatch = html.match(/(\d+)\s*comments?/i)

    if (likesMatch || commentsMatch) {
      return {
        views: 0,
        likes: parseInt(likesMatch?.[1] || '0'),
        comments: parseInt(commentsMatch?.[1] || '0'),
      }
    }
    return null
  } catch (error) {
    console.warn('Failed to extract from oembed:', error)
    return null
  }
}

/**
 * Check if a URL is a valid Instagram video link
 */
export function isValidInstagramVideoUrl(url: string): boolean {
  return extractInstagramVideoId(url) !== null
}
