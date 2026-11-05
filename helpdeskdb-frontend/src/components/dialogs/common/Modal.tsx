import { ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	/**
	 * Disables the ✕/Escape while a save is in flight. Required whenever the
	 * dialog surfaces save errors inline: closing mid-save clears the parent's
	 * selection, which unmounts this subtree (see the early return below), so
	 * the `{ error }` the confirm handler is about to resolve would land on an
	 * unmounted component — the failure disappears silently and the user's
	 * input goes with it. ModalFooter already disables Cancel and Confirm on
	 * the same flag.
	 */
	closeDisabled?: boolean;
	className?: string;
}

export const Modal = ({
	open,
	onClose,
	children,
	closeDisabled = false,
	className = "",
}: ModalProps) => {
	const { t: tCommon } = useTranslation("common");
	const panelRef = useRef<HTMLDivElement>(null);

	// Keyboard flow: focus moves into the dialog on open and back to whatever
	// opened it on close. A full focus trap is deliberately not attempted —
	// the panel is focusable and tabbing within it reaches the footer and
	// wraps by browser default at the document level, which is "near enough"
	// for these short forms.
	useEffect(() => {
		if (!open) return;
		const previouslyFocused = document.activeElement as HTMLElement | null;
		panelRef.current?.focus();
		return () => previouslyFocused?.focus?.();
	}, [open]);

	// Escape closes — unless a save is in flight (the closeDisabled contract
	// above).
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape" && !closeDisabled) onClose();
	};

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
			onKeyDown={handleKeyDown}
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}
				className={`bg-white rounded-lg shadow-raised max-w-md w-full max-h-[90vh] flex flex-col outline-none ${className}`}
			>
				<div className="flex justify-end px-4 pt-2 shrink-0">
					<button
						onClick={onClose}
						disabled={closeDisabled}
						className={`text-gray-400 hover:text-gray-700 text-3xl leading-none px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
							closeDisabled
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						aria-label={tCommon("Close")}
					>
						&times;
					</button>
				</div>
				<div className="overflow-y-auto px-6 pb-6">{children}</div>
			</div>
		</div>
	);
};
