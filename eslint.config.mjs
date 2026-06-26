import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disabled — we use `any` intentionally for API response data
      "@typescript-eslint/no-explicit-any": "off",
      // Disabled — unused imports are cleaned up in dev, not blocking prod
      "@typescript-eslint/no-unused-vars": "off",
      // Disabled — apostrophes in JSX are fine
      "react/no-unescaped-entities": "off",
    },
  },
]

export default eslintConfig
