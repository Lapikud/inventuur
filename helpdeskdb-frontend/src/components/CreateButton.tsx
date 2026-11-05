import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

interface CreateButtonProps {
	onClick: () => void;
	/** Defaults to the common CreateNewLink label. */
	label?: string;
	/** "outline" is the secondary style for pages with two create actions. */
	variant?: "solid" | "outline";
}

/**
 * The create CTA passed into ListPageWrapper's `createButton` slot — a ui
 * Button so it shares the app-wide focus ring and disabled handling.
 */
export default function CreateButton({
	onClick,
	label,
	variant = "solid",
}: CreateButtonProps) {
	const { t: tCommon } = useTranslation("common");

	return (
		<Button
			type="button"
			size="lg"
			onClick={onClick}
			variant={variant === "solid" ? "default" : "outline"}
			className={variant === "outline" ? "border-brand text-brand-hover hover:bg-orange-50" : ""}
		>
			{label ?? tCommon("CreateNewLink")}
		</Button>
	);
}
