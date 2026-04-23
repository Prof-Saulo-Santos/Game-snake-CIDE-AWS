import js from "@eslint/js";
export default [
    js.configs.recommended,
    { ignores: ["**/node_modules/**", "**/dist/**", "**/.vscode/**"] },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: { window: "readonly", document: "readonly", console: "readonly", localStorage: "readonly", Math: "readonly" }
        },
        rules: { "no-unused-vars": "warn", "no-undef": "error", "semi": ["error", "always"] }
    }
];
