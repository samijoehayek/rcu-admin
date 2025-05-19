/* eslint-disable @typescript-eslint/no-unused-vars */
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Admin role ID constant
const ADMIN_ROLE_ID = "d000e331-249d-413f-9af1-6e056f7c1c86";

// Define which paths should be protected
const PROTECTED_PATHS = [
  '/dashboard',
  '/admin',
  '/settings',
  '/'
  // Add all admin paths that should be protected
];

// JWT token interface
interface DecodedToken {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
}

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // If there's no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    try {
      // Verify token expiration
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token expired, redirect to login
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      // For additional security, you can verify the roleId from server
      // But this would require an API call or storing the roleId in the JWT claims
      
      // Continue with the request
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // For non-protected paths, just continue
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/:path*', // This will match all paths
    // Add all admin paths that should be protected
  ],
};