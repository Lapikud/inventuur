"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import Spinner from "@/components/LoadingSpinner";

// First path segments that require canManage (admins/helpdesk_db_admins).
// categories, removedAssets, owners, and assetReservations are deliberately
// absent — they stay viewable by all logged-in users (categories is linked from
// the Header's User dropdown, not the admin one).
const ADMIN_ROUTES = [
	"dbassets",
	"categoryAssets",
	"ownerAssets",
	"locations",
	"users",
	"roles",
	"refreshTokens",
	"rooms",
	"cupboards",
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { accountInfo, canManage } = usePermissions();
	const router = useRouter();
	const pathname = usePathname();
	// trailingSlash is on — match the first segment, not the raw pathname.
	// Case-insensitive: on case-insensitive filesystems Next serves routes
	// under any casing (e.g. /CupboardsInRooms), which must not skip the gate.
	const segment = pathname.split("/")[1]?.toLowerCase();
	// Segment equality, not substring: `includes("/login")` would treat /loginX/
	// or /admin/login/ as public and skip the auth gate entirely.
	// /a/* is the anonymous public asset page (QR sticker target) — it must
	// render for logged-out visitors, so it shares the login route's gate.
	// The root ("/") is audience-aware itself: it renders the public inventory
	// table when signed out and the full overview when signed in.
	const isPublic = segment === "login" || segment === "a" || segment === "";
	const needsAdmin = ADMIN_ROUTES.some((r) => r.toLowerCase() === segment);

	useEffect(() => {
		if (isPublic) return;
		if (accountInfo === undefined) return; // still hydrating
		if (!accountInfo.id) {
			// No session: land on the public inventory table instead of the
			// login form — /login stays reachable via the header button.
			router.push("/");
		} else if (needsAdmin && !canManage) {
			router.push("/");
		}
	}, [accountInfo, router, isPublic, needsAdmin, canManage]);

	if (isPublic) return <>{children}</>;
	if (accountInfo === undefined || !accountInfo.id) return <Spinner className="h-64" />;
	if (needsAdmin && !canManage) return <Spinner className="h-64" />;

	return <>{children}</>;
}
