import { NextRequest, NextResponse } from "next/server";

/** Gates /admin behind HTTP Basic Auth, checked server-side against
 * environment variables — the credentials never ship in the client bundle.
 * Set ADMIN_USERNAME / ADMIN_PASSWORD in your deployment environment (and
 * in .env.local for local dev); see .env.example. */
export function proxy(request: NextRequest) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // If the env vars aren't configured, fail closed rather than silently
  // leaving the admin dashboard open.
  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Admin login isn't configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dough Jo Admin"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
