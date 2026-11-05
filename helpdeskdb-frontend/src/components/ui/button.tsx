import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The app-wide button primitive. Radix Slot was dropped with the rest of the
 * unused shadcn scaffolding — nobody used `asChild` on a button any more, and
 * a plain <button> covers every call site.
 *
 * Keyboard focus gets a visible 2px brand ring; hover/disabled transitions are
 * colors-only and disabled under prefers-reduced-motion.
 */
const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-brand text-white hover:bg-brand-hover",
				outline:
					"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
				secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
				ghost: "text-gray-600 hover:bg-gray-100",
				destructive: "bg-danger text-white hover:bg-red-600",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-10 px-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { Button, buttonVariants };
