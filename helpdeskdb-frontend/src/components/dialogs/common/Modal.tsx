import { ReactNode } from "react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	/**
	 * Disables the ✕ while a save is in flight. Required whenever the dialog
	 * surfaces save errors inline: closing mid-save clears the parent's selection,
	 * which unmounts this subtree (see the early return below), so the `{ error }`
	 * the confirm handler is about to resolve would land on an unmounted component
	 * — the failure disappears silently and the user's input goes with it.
	 * ModalFooter already disables Cancel and Confirm on the same flag.
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
	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div
				className={`bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col ${className}`}
			>
				<div className="flex justify-end px-4 pt-3 shrink-0">
					<button
						onClick={onClose}
						disabled={closeDisabled}
						className={`text-orange-400 text-5xl leading-none ${
							closeDisabled
								? "opacity-50 cursor-not-allowed"
								: "hover:text-gray-700"
						}`}
						aria-label="Close"
					>
						&times;
					</button>
				</div>
				<div className="overflow-y-auto px-6 pb-6">
					{children}
				</div>
			</div>
		</div>
	);
};
