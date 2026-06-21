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
  // 1. Protect non-public routes instantly
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 2. Grab the auth state
  const authState = await auth();
  
  // 3. Route logic for logged-in users
  if (authState.userId) {
    const currentPath = req.nextUrl.pathname;

    // If a logged-in user hits the homepage or sign-in, push them to the dashboard
    // We ignore '/api' paths so UploadThing webhooks don't get redirected!
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