import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  // Static output and one-off dev scripts, not application code.
  {
    ignores: ["public/**", ".next/**", "out/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Pre-existing pattern across the dialogs: resetting form state in an
      // effect when the dialog opens. The react-hooks v6 rule wants derived
      // state or a key-remount instead — a deliberate refactor for later.
      // Warn rather than fail until that pass happens.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
