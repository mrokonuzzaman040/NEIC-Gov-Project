import { NextRequest, NextResponse } from 'next/server';

// Clear common NextAuth cookies by expiring them immediately
function expireAuthCookies(response: NextResponse) {
  const names = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.pkce.code_verifier',
    '__Secure-next-auth.pkce.code_verifier'
  ];
  for (const name of names) {
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectParam = searchParams.get('redirect') || '/admin/login';
    const response = NextResponse.redirect(new URL(redirectParam, request.url));
    expireAuthCookies(response);
    return response;
  } catch (err) {
    console.error('Error clearing auth cookies:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

