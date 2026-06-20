import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: [
            ".expo/**",
            ".corepack/**",
            "node_modules/**",
            "dist/**",
            "coverage/**",
            "babel.config.js",
            "metro.config.js",
            "tailwind.config.js",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "no-empty": "off",
            "no-undef": "off",
            "preserve-caught-error": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-restricted-imports": ["error", {
                paths: [
                    {
                        name: "@/db/schema",
                        message: "Use db/services instead of importing schema outside the data layer.",
                    },
                    {
                        name: "@/db/client",
                        message: "Only app/_layout.tsx and db/services may initialize or query the database.",
                    },
                    {
                        name: "drizzle-orm",
                        message: "Keep Drizzle usage inside db/services.",
                    },
                ],
            }],
        },
    },
    {
        files: ["app/_layout.tsx", "db/**/*.ts"],
        rules: {
            "no-restricted-imports": "off",
        },
    },
    {
        files: ["scripts/**/*.mjs"],
        languageOptions: {
            globals: {
                console: "readonly",
                process: "readonly",
            },
        },
    },
];
