import { useTranslation } from "react-i18next";

export default function Footer() {
	const { t } = useTranslation("_layout");
	return (
		<footer className="fixed bottom-0 left-0 w-full border-t text-gray-500 text-sm bg-white">
			<div className="px-6 sm:px-14 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
				<span>
					&copy; 2026 -{" "}
					<a
						href="https://github.com/Lapikud"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-link"
					>
						Lapikud
					</a>{" "}
					<a
						href="https://github.com/Lapikud/inventuur"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-link"
					>
						Inventuuri S&uuml;steem
					</a>
				</span>
				{/* The repo link sits mid-sentence, so each language supplies
				    the text before and after it. */}
				<span className="text-gray-400">
					{t("FooterForkedFromPrefix")}
					<a
						href="https://github.com/Lapikud/helpdesk-db"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-link"
					>
						helpdesk-db
					</a>
					{t("FooterForkedFromSuffix")}
				</span>
			</div>
		</footer>
	);
}
