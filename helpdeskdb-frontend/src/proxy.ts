import { NextRequest, NextResponse } from "next/server";

// The Next server proxies /api/* to the backend (see rewrites() in next.config.ts), but its
// proxy does not add X-Forwarded-Proto on its own. Forward the browser's real scheme so the
// backend's UseForwardedHeaders sees HTTPS requests as HTTPS and marks the auth cookies Secure.
//
// When a TLS-terminating proxy (Caddy, nginx, ...) sits in front of this server, it already
// sets X-Forwarded-Proto to the browser's scheme while the hop to Next is plain HTTP — keep
// the proxy's value instead of clobbering it with "http". Spoofing is not a concern: in
// deployment the Next port is loopback/compose-network only, so only the proxy reaches it.
// Without a proxy (dev, dev:https) the header is absent and the request's own scheme is used.
//
// Next.js 16 renamed middleware to proxy (same API); this is the ONLY such file in the
// project. Do not add a second one at the repo root: Next resolves the proxy from the src
// directory when src/app exists, so a root copy is either ignored or ambiguously preferred
// depending on dev vs build — and a version of this that unconditionally overwrote the header
// silently dropped Secure from the auth cookies behind the production TLS proxy.
export default function proxy(request: NextRequest) {
	const headers = new Headers(request.headers);
	if (!headers.has("x-forwarded-proto")) {
		headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
	}
	return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/:path*" };
