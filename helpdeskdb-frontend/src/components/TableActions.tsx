import Link from "next/link";

/** Utilities every action button shares; size and palette are added per variant. */
export const btnBase =
	"text-sm font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
	// The table/overview default: fills its column.
	md: "py-2 px-4 rounded-xl text-center block w-full",
	// For buttons sitting inline in a row, e.g. the cupboard locations list.
	sm: "py-1.5 px-3 rounded-lg",
};

type ButtonSize = keyof typeof sizes;

/** Wraps action buttons in the actions cell */
export function ActionCell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex justify-center">
			<div className="flex flex-col gap-1.5 w-24">{children}</div>
		</div>
	);
}

interface ActionButtonProps {
	href?: string;
	onClick?: () => void;
	label: string;
	className: string;
	disabled?: boolean;
	size?: ButtonSize;
}

function ActionButton({
	href,
	onClick,
	label,
	className,
	disabled = false,
	size = "md",
}: ActionButtonProps) {
	const classes = `${btnBase} ${sizes[size]} ${className}`;

	if (href) {
		return (
			<Link href={href} className={classes}>
				{label}
			</Link>
		);
	}
	return (
		<button onClick={onClick} disabled={disabled} className={classes}>
			{label}
		</button>
	);
}

interface VariantProps {
	href?: string;
	onClick?: () => void;
	label?: string;
	disabled?: boolean;
	size?: ButtonSize;
}

export function EditButton({ label = "Edit", ...rest }: VariantProps) {
	return (
		<ActionButton
			{...rest}
			label={label}
			className="bg-[#e3f2fd] hover:bg-blue-100 text-[#50b3f1]"
		/>
	);
}

export function DeleteButton({ label = "Delete", ...rest }: VariantProps) {
	return (
		<ActionButton
			{...rest}
			label={label}
			className="bg-[#ffebee] hover:bg-red-100 text-[#ea6e6c]"
		/>
	);
}

export function DetailsButton({ label = "Details", ...rest }: VariantProps) {
	return (
		<ActionButton
			{...rest}
			label={label}
			className="bg-[#eeeeee] hover:bg-gray-200 text-[#616161]"
		/>
	);
}

/** The orange call-to-action button — reserve, return, change reservation. */
export function PrimaryButton({ label = "", ...rest }: VariantProps) {
	return (
		<ActionButton
			{...rest}
			label={label}
			className="bg-[#ff9800] hover:bg-[#f0941d] text-white"
		/>
	);
}
