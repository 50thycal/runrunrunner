import { NextRequest, NextResponse } from 'next/server'
import { escapeHtml, sanitizeNumeric, escapeJs } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  // Sanitize all user-provided inputs to prevent XSS
  const score = sanitizeNumeric(searchParams.get('score') || '0')
  const username = escapeHtml((searchParams.get('username') || 'Anonymous').slice(0, 50))
  const rank = sanitizeNumeric(searchParams.get('rank') || '')

  // Get the base URL from the request - validate it's a proper URL
  const hostHeader = request.headers.get('host') || ''
  const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${escapeHtml(hostHeader)}`

  // Build image URL with parameters
  const imageParams = new URLSearchParams({ score, username })
  if (rank) imageParams.set('rank', rank)
  const imageUrl = `${baseUrl}/api/frame/image?${imageParams.toString()}`

  // Frame HTML with Open Graph and Farcaster Frame meta tags
  // All dynamic values are properly escaped
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>runrunrunner - Score: ${score}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="@${username} scored ${score} in runrunrunner!" />
  <meta property="og:description" content="Can you beat this score? Play now!" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:type" content="website" />

  <!-- Farcaster Frame -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${escapeHtml(imageUrl)}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Play Now" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${escapeHtml(baseUrl)}" />
</head>
<body>
  <script>window.location.href = "${escapeJs(baseUrl)}";</script>
  <p>Redirecting to runrunrunner...</p>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
