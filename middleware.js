// Next.js middleware to handle LuckyLabs proxy routes
// This intercepts requests to /apps/app-proxy/* and /lucky-local/shopify/*
// and rewrites them to the API routes
// 
// Note: In Hydrogen/Remix, routes like apps.app-proxy.$.jsx create routes at /apps/app-proxy/*
// In Next.js, we need to rewrite these to /api/apps/app-proxy/*

import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Log all requests to these paths for debugging
  if (pathname.startsWith('/apps/app-proxy/') || pathname.startsWith('/lucky-local/shopify/')) {
    console.log('🔍 [Middleware] Intercepted request:', {
      pathname,
      method: request.method,
      url: request.url,
    })
  }

  // Rewrite /apps/app-proxy/* to /api/apps/app-proxy/*
  if (pathname.startsWith('/apps/app-proxy/')) {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = pathname.replace('/apps/app-proxy', '/api/apps/app-proxy')
    console.log('🔄 [Middleware] Rewriting:', pathname, '->', newUrl.pathname)
    const response = NextResponse.rewrite(newUrl)
    // Add a header to confirm rewrite happened
    response.headers.set('X-Rewritten-From', pathname)
    response.headers.set('X-Rewritten-To', newUrl.pathname)
    return response
  }

  // Rewrite /lucky-local/shopify/* to /api/lucky-local/shopify/*
  if (pathname.startsWith('/lucky-local/shopify/')) {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = pathname.replace('/lucky-local/shopify', '/api/lucky-local/shopify')
    console.log('🔄 [Middleware] Rewriting:', pathname, '->', newUrl.pathname)
    const response = NextResponse.rewrite(newUrl)
    response.headers.set('X-Rewritten-From', pathname)
    response.headers.set('X-Rewritten-To', newUrl.pathname)
    return response
  }

  return NextResponse.next()
}

// Match all paths that start with these prefixes
// Using a more permissive matcher to ensure it catches the requests
export const config = {
  matcher: [
    '/apps/app-proxy/:path*',
    '/lucky-local/shopify/:path*',
    // Also match the exact paths without trailing slash
    '/apps/app-proxy',
    '/lucky-local/shopify',
  ],
}

