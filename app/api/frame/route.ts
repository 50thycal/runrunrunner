import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const score = searchParams.get('score') || '0'
  const username = searchParams.get('username') || 'Anonymous'
  const rank = searchParams.get('rank') || ''

  // Get the base URL from the request
  const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${request.headers.get('host')}`

  // Build image URL with parameters
  const imageParams = new URLSearchParams({ score, username })
  if (rank) imageParams.set('rank', rank)
  const imageUrl = `${baseUrl}/api/frame/image?${imageParams.toString()}`

  // Frame HTML with Open Graph and Farcaster Frame meta tags
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>runrunrunner - Score: ${score}</title>

  <!-- Open Graph -->
  <meta property="og:title" content="@${username} scored ${score} in runrunrunner!" />
  <meta property="og:description" content="Can you beat this score? Play now!" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:type" content="website" />

  <!-- Farcaster Frame -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Play Now" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}" />
</head>
<body>
  <script>window.location.href = "${baseUrl}";</script>
  <p>Redirecting to runrunrunner...</p>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
