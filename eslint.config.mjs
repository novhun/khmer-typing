import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** Flat config (ESLint 9). `next lint` is deprecated in Next 15, so ESLint runs directly. */
const config = [
  { ignores: [".next/**", ".next-check/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // The game is a client island; no server/client boundary lint noise needed
      // beyond the defaults. Keep hook correctness strict — it guards the engine.
      "react-hooks/exhaustive-deps": "error",
    },
  },
];

export default config;
