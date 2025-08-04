import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保護されたページのリスト
  const protectedPages = ['/dashboard', '/learn', '/process', '/results', '/add-video']
  const authPages = ['/login', '/register']

  const isProtectedPage = protectedPages.some(page => req.nextUrl.pathname.startsWith(page))
  const isAuthPage = authPages.some(page => req.nextUrl.pathname.startsWith(page))

  // ミドルウェアのログ出力
  console.log('ミドルウェア実行:', {
    pathname: req.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    isProtectedPage,
    isAuthPage,
    timestamp: new Date().toISOString()
  })

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/process/:path*',
    '/results/:path*',
    '/add-video/:path*',
    '/login',
    '/register',
  ],
} 