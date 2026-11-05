import { cn } from "@/lib/utils";

/**
 * A pulse-shaded placeholder block. Built-in gray-200 under light, no motion
 * when the user prefers reduced motion.
 */
export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none",
				className,
			)}
		/>
	);
}
