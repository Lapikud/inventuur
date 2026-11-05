import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ModalFooterProps {
	onCancel: () => void;
	isLoading: boolean;
	/** Already-translated confirm label (callers own their namespaces). */
	confirmLabel: string;
	/** Red confirm button for delete/remove dialogs. */
	destructive?: boolean;
	/**
	 * "submit" for dialogs whose body is a <form>; "button" for imperative
	 * dialogs, which must also pass `onConfirm`.
	 */
	confirmType?: "submit" | "button";
	onConfirm?: () => void;
}

/** The shared Cancel/Confirm footer used by every modal dialog. */
export const ModalFooter = ({
	onCancel,
	isLoading,
	confirmLabel,
	destructive = false,
	confirmType = "submit",
	onConfirm,
}: ModalFooterProps) => {
	const { t: tCommon } = useTranslation("common");

	return (
		<div className="flex justify-end gap-3 mt-6">
			<Button
				type="button"
				variant="secondary"
				onClick={onCancel}
				disabled={isLoading}
			>
				{tCommon("Cancel")}
			</Button>
			<Button
				type={confirmType}
				variant={destructive ? "destructive" : "default"}
				onClick={confirmType === "button" ? onConfirm : undefined}
				disabled={isLoading}
			>
				{isLoading ? tCommon("Processing") : confirmLabel}
			</Button>
		</div>
	);
};
