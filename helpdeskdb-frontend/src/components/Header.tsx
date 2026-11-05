"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AccountContext } from "../context/AccountContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Syncopate } from "next/font/google";
import { accountService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";

// Lapikud brand typeface, self-hosted by next/font at build time.
const syncopate = Syncopate({
	weight: ["400", "700"],
	subsets: ["latin"],
});

export default function Header() {
	const { t: tLayout } = useTranslation("_layout");
	const { t: tCommon } = useTranslation("common");
	const { t: tLoginPartial } = useTranslation("_loginpartial");

	const { accountInfo, setAccountInfo } = useContext(AccountContext);
	const router = useRouter();
	// Active-nav state: match the first path segment (trailingSlash is on, and
	// AuthGuard already established the lowercase-first-segment convention).
	const pathname = usePathname() || "/";
	const activeSegment = pathname.split("/")[1]?.toLowerCase() ?? "";
	const isHome = activeSegment === "";
	const desktopLinkClass = (href: string) => {
		const active =
			href === "/" ? isHome : activeSegment === href.split("/")[1]?.toLowerCase();
		return `block px-4 py-2 text-sm hover:bg-gray-100 ${
			active ? "text-ink font-semibold" : "text-gray-700"
		}`;
	};
	const mobileLinkClass = (href: string) => {
		const active =
			href === "/" ? isHome : activeSegment === href.split("/")[1]?.toLowerCase();
		return `block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 pl-5 ${
			active ? "text-ink font-semibold" : ""
		}`;
	};
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const userDropdownRef = useRef<HTMLDivElement>(null);

	const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
	const adminDropdownRef = useRef<HTMLDivElement>(null);

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [logoutError, setLogoutError] = useState<string | null>(null);

	const { canManage } = usePermissions();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(event.target as Node)
			) {
				setIsUserDropdownOpen(false);
			}
			if (
				adminDropdownRef.current &&
				!adminDropdownRef.current.contains(event.target as Node)
			) {
				setIsAdminDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [userDropdownRef, adminDropdownRef]);

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	// preventDefault matters: these are <a href="#"> triggers, and the browser would
	// otherwise perform the "#" navigation while this is still awaiting — including on
	// the failure path below, where we deliberately stay put.
	const handleLogout = async (event: React.MouseEvent) => {
		event.preventDefault();
		const result = await accountService.logoutAsync();

		if (result.errors?.length || (result.statusCode ?? 0) >= 400) {
			// The backend did not delete the refresh token and did not clear the
			// cookies, so the session is still live. Claiming otherwise would leave
			// it usable by whoever reloads this browser next.
			setLogoutError(tCommon("LogoutFailed"));
			return;
		}

		setLogoutError(null);
		// Clearing the identity is what drops the query cache — QueryCacheReset
		// watches it, so no explicit queryClient.clear() belongs here.
		setAccountInfo!({});
		router.push("/");
		closeMobileMenu();
	};

	return (
		<nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-card mb-3 text-left">
			{/* Desktop + tablet bar */}
			<div className="px-4 md:px-14 py-2.5 md:py-3 flex items-center justify-between">
				{/* Left side: Brand + Main nav (hidden on mobile) */}
				<div className="flex items-center space-x-6">
					<Link
						href="/"
						className="flex items-center gap-3 font-semibold text-gray-800"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/lapikud-logo.svg"
							alt="Lapikud"
							className="h-8 md:h-9 w-auto"
						/>
						{/* The product name — same in every language, short
						    enough to fit on any screen. */}
						<span
							className={`${syncopate.className} text-sm md:text-lg text-ink`}
						>
							inventuur
						</span>
					</Link>

					<Link
						href="/"
						aria-current={isHome ? "page" : undefined}
						className={`hidden md:inline hover:text-blue-500 ${
							isHome ? "text-ink font-semibold" : "text-gray-700"
						}`}
					>
						{tCommon("Home")}
					</Link>

					{/* User Dropdown — desktop only */}
					{accountInfo?.id && (
						<div className="relative hidden md:block" ref={userDropdownRef}>
							<button
								onClick={() =>
									setIsUserDropdownOpen(!isUserDropdownOpen)
								}
								aria-haspopup="menu"
								aria-expanded={isUserDropdownOpen}
								className="text-gray-700 hover:text-blue-500 flex items-center gap-1"
							>
								{tLayout("User")}
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>
							{isUserDropdownOpen && (
								<div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow z-50">
									<Link
										href="/assetReservations"
										className={desktopLinkClass("/assetReservations")}
										onClick={() =>
											setIsUserDropdownOpen(false)
										}
									>
										{tLayout("AssetReservations")}
									</Link>
									<Link
										href="/categories"
										className={desktopLinkClass("/categories")}
										onClick={() =>
											setIsUserDropdownOpen(false)
										}
									>
										{tLayout("Categories")}
									</Link>
									<Link
										href="/owners"
										className={desktopLinkClass("/owners")}
										onClick={() =>
											setIsUserDropdownOpen(false)
										}
									>
										{tLayout("Owners")}
									</Link>
									<Link
										href="/removedAssets"
										className={desktopLinkClass("/removedAssets")}
										onClick={() =>
											setIsUserDropdownOpen(false)
										}
									>
										{tLayout("RemovedAssets")}
									</Link>
								</div>
							)}
						</div>
					)}
					{/* Admin Dropdown — desktop only */}
					{accountInfo?.id && canManage && (
						<div className="relative hidden md:block" ref={adminDropdownRef}>
							<button
								onClick={() =>
									setIsAdminDropdownOpen(!isAdminDropdownOpen)
								}
								aria-haspopup="menu"
								aria-expanded={isAdminDropdownOpen}
								className="text-gray-700 hover:text-blue-500 flex items-center gap-1"
							>
								{tLayout("Admin")}
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>
							{isAdminDropdownOpen && (
								<div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow z-50">
									<Link
										href="/dbassets"
										className={desktopLinkClass("/dbassets")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Assets")}
									</Link>
									<Link
										href="/assetReservations"
										className={desktopLinkClass("/assetReservations")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("AssetReservations")}
									</Link>
									<Link
										href="/categories"
										className={desktopLinkClass("/categories")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Categories")}
									</Link>
									<Link
										href="/tags"
										className={desktopLinkClass("/tags")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Tags")}
									</Link>
									<Link
										href="/categoryAssets"
										className={desktopLinkClass("/categoryAssets")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("CategoryAssets")}
									</Link>
									<Link
										href="/cupboards"
										className={desktopLinkClass("/cupboards")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Cupboards")}
									</Link>
									<Link
										href="/locations"
										className={desktopLinkClass("/locations")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Locations")}
									</Link>
									<Link
										href="/owners"
										className={desktopLinkClass("/owners")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Owners")}
									</Link>
									<Link
										href="/ownerAssets"
										className={desktopLinkClass("/ownerAssets")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("OwnerAssets")}
									</Link>
									<Link
										href="/rooms"
										className={desktopLinkClass("/rooms")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Rooms")}
									</Link>
									<Link
										href="/removedAssets"
										className={desktopLinkClass("/removedAssets")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("RemovedAssets")}
									</Link>
									<hr className="my-1 border-gray-200" />
									<Link
										href="/users"
										className={desktopLinkClass("/users")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Users")}
									</Link>
									<Link
										href="/roles"
										className={desktopLinkClass("/roles")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("Roles")}
									</Link>
									<Link
										href="/refreshTokens"
										className={desktopLinkClass("/refreshTokens")}
										onClick={() =>
											setIsAdminDropdownOpen(false)
										}
									>
										{tLayout("RefreshTokens")}
									</Link>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Right side — desktop */}
				<div className="hidden md:flex items-center space-x-6">
					<LanguageSwitcher />
					{accountInfo?.id && (
						<div className="flex items-center space-x-4">
							<span>
								{tLoginPartial("Greeting")}, {accountInfo.name}
							</span>
							<a
								className="text-gray-700 hover:text-blue-500"
								href="#"
								onClick={handleLogout}
							>
								{tCommon("Logout")}
							</a>
						</div>
					)}
					{!accountInfo?.id && (
						<Link
							href="/login"
							className="text-gray-700 hover:text-blue-500"
						>
							{tCommon("LoginLink")}
						</Link>
					)}
				</div>

				{/* Hamburger button — mobile only */}
				<button
					className="md:hidden p-2 rounded text-gray-700 hover:bg-gray-100"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{isMobileMenuOpen ? (
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					) : (
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					)}
				</button>
			</div>

			{/* Mobile menu drawer: capped to the viewport and scrollable in
			    itself — with the full admin section it is taller than any
			    phone screen, and without the cap the page body scrolls under
			    the sticky header instead of the menu list. */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-1 max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain">
					<Link href="/" className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100" onClick={closeMobileMenu}>
						{tCommon("Home")}
					</Link>

					{accountInfo?.id && (
						<>
							<div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
								{tLayout("User")}
							</div>
							<Link href="/assetReservations" className={mobileLinkClass("/assetReservations")} onClick={closeMobileMenu}>
								{tLayout("AssetReservations")}
							</Link>
							<Link href="/categories" className={mobileLinkClass("/categories")} onClick={closeMobileMenu}>
								{tLayout("Categories")}
							</Link>
							<Link href="/owners" className={mobileLinkClass("/owners")} onClick={closeMobileMenu}>
								{tLayout("Owners")}
							</Link>
							<Link href="/removedAssets" className={mobileLinkClass("/removedAssets")} onClick={closeMobileMenu}>
								{tLayout("RemovedAssets")}
							</Link>
						</>
					)}

					{accountInfo?.id && canManage && (
						<>
							<div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
								{tLayout("Admin")}
							</div>
							<Link href="/dbassets" className={mobileLinkClass("/dbassets")} onClick={closeMobileMenu}>
								{tLayout("Assets")}
							</Link>
							<Link href="/assetReservations" className={mobileLinkClass("/assetReservations")} onClick={closeMobileMenu}>
								{tLayout("AssetReservations")}
							</Link>
							<Link href="/categories" className={mobileLinkClass("/categories")} onClick={closeMobileMenu}>
								{tLayout("Categories")}
							</Link>
							<Link href="/tags" className={mobileLinkClass("/tags")} onClick={closeMobileMenu}>
								{tLayout("Tags")}
							</Link>
							<Link href="/categoryAssets" className={mobileLinkClass("/categoryAssets")} onClick={closeMobileMenu}>
								{tLayout("CategoryAssets")}
							</Link>
							<Link href="/cupboards" className={mobileLinkClass("/cupboards")} onClick={closeMobileMenu}>
								{tLayout("Cupboards")}
							</Link>
							<Link href="/locations" className={mobileLinkClass("/locations")} onClick={closeMobileMenu}>
								{tLayout("Locations")}
							</Link>
							<Link href="/owners" className={mobileLinkClass("/owners")} onClick={closeMobileMenu}>
								{tLayout("Owners")}
							</Link>
							<Link href="/ownerAssets" className={mobileLinkClass("/ownerAssets")} onClick={closeMobileMenu}>
								{tLayout("OwnerAssets")}
							</Link>
							<Link href="/rooms" className={mobileLinkClass("/rooms")} onClick={closeMobileMenu}>
								{tLayout("Rooms")}
							</Link>
							<Link href="/removedAssets" className={mobileLinkClass("/removedAssets")} onClick={closeMobileMenu}>
								{tLayout("RemovedAssets")}
							</Link>
							<hr className="my-1 border-gray-200" />
							<Link href="/users" className={mobileLinkClass("/users")} onClick={closeMobileMenu}>
								{tLayout("Users")}
							</Link>
							<Link href="/roles" className={mobileLinkClass("/roles")} onClick={closeMobileMenu}>
								{tLayout("Roles")}
							</Link>
							<Link href="/refreshTokens" className={mobileLinkClass("/refreshTokens")} onClick={closeMobileMenu}>
								{tLayout("RefreshTokens")}
							</Link>
						</>
					)}

					<hr className="my-2 border-gray-200" />
					<div className="flex items-center justify-between px-3 py-2">
						<LanguageSwitcher />
						{accountInfo?.id ? (
							<div className="flex items-center gap-3">
								<span className="text-sm text-gray-600">{accountInfo.name}</span>
								<a className="text-sm text-gray-700 hover:text-blue-500" href="#" onClick={handleLogout}>
									{tCommon("Logout")}
								</a>
							</div>
						) : (
							<Link href="/login" className="text-gray-700 hover:text-blue-500" onClick={closeMobileMenu}>
								{tCommon("LoginLink")}
							</Link>
						)}
					</div>
				</div>
			)}
			{logoutError && (
				<div
					role="alert"
					className="mx-3 mb-3 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm"
				>
					{logoutError}
				</div>
			)}
		</nav>
	);
}
