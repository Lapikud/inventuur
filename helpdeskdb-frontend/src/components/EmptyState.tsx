import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	/** The main line, e.g. "No assets to display". */
	message: string;
	/** Optional one-line hint under the message. */
	hint?: string;
	/** Optional primary CTA (a Button) rendered centered under the hint. */
	action?: ReactNode;
	className?: string;
}

/**
 * The shared empty state for list pages — one clear message, a hint at what
 * to do next, and optionally the CTA that does it, instead of bare gray text.
 */
export default function EmptyState({
	message,
	hint,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"bg-white border border-gray-100 rounded-lg shadow-card py-12 px-6 text-center",
				className,
			)}
		>
			<p className="text-gray-600">{message}</p>
			{hint && <p className="text-sm text-gray-400 mt-1">{hint}</p>}
			{action && (
				<div className="mt-4 flex justify-center">{action}</div>
			)}
		</div>
	);
}
