import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The shared text input. Matches the native select wrapper's box: same border,
 * radius, and the 2px-offset brand focus ring's visible-keyboard-nav cousin.
 */
const Input = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
	<input
		type={type}
		ref={ref}
		className={cn(
			"flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
			className,
		)}
		{...props}
	/>
));
Input.displayName = "Input";

export { Input };
