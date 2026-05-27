import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/profili(.*)',
  '/raport/i-ri(.*)',
  '/admin(.*)',
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/harta(.*)',
  '/lista(.*)',
  '/statistika(.*)',
  '/raport/((?!i-ri).*)',
  '/api/reports(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
