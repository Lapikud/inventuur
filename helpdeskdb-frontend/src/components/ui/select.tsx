import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A native <select> with the shared input chrome — no Radix Select. Native
 * selects are lighter, keyboard/screen-reader-solid, and what the filter bar
 * already used.
 *
 * Pass the field's translated label as `aria-label` when there is no visible
 * label bound via htmlFor/id.
 */
const Select = React.forwardRef<
	HTMLSelectElement,
	React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
	<select
		ref={ref}
		className={cn(
			"flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-colors focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
			className,
		)}
		{...props}
	>
		{children}
	</select>
));
Select.displayName = "Select";

export { Select };
