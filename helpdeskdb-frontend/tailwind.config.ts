import type { Config } from "tailwindcss";

/**
 * Plain Tailwind config. The former `withMT(...)` wrapper came from
 * @material-tailwind/react, which no source file imports — its theme merge
 * added classes this app never used, so nothing is lost by unwrapping.
 */
const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// shadcn-style CSS-variable palette (globals.css defines the vars).
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "220 70% 50%",
					"2": "160 60% 45%",
					"3": "30 80% 55%",
					"4": "280 65% 60%",
					"5": "340 75% 55%",
				},
				// ---- design tokens -----------------------------------------
				// One place for the app palette. Compose with the Tailwind
				// built-ins (gray-*, red-*); new colors should become a token
				// here, not a new scattered hex.
				ink: "#424242",
				body: "#585858",
				surface: "#efefef",
				field: "#f5f5f5",
				brand: {
					DEFAULT: "#ff9800",
					hover: "#f0941d",
				},
				link: {
					DEFAULT: "#50b3f1",
					soft: "#e3f2fd",
				},
				success: {
					DEFAULT: "#16a34a",
					soft: "#e8f5e9",
				},
				warning: {
					DEFAULT: "#ed6c02",
					soft: "#fff3e0",
				},
				danger: {
					DEFAULT: "#ea6e6c",
					soft: "#ffebee",
				},
			},
			// Subtle elevation instead of the old harsh shadow-sm/2xl soup.
			boxShadow: {
				card: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.04)",
				raised: "0 2px 8px 0 rgb(0 0 0 / 0.06), 0 8px 24px 0 rgb(0 0 0 / 0.08)",
			},
		},
	},
} as Config;

export default config;
