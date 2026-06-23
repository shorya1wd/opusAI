import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/clerk(.*)',
  '/api/uploadthing(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/sso-callback(.*)'
]);

export default clerkMiddleware(async (auth, req) => {

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const authState = await auth();
  const {userId}=await auth()

  const isAuthenticated = !!userId;

  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL(
        isAuthenticated ? "/dashboard" : "/sign-in",
        req.url
      )
    );
  }
  
  if (authState.userId) {
    const currentPath = req.nextUrl.pathname;

    if (isPublicRoute(req) && !currentPath.startsWith('/api')) {
      if (!currentPath.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};