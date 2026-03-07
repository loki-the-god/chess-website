/** @type {import("eslint").FlatESLintConfig} */
const config = [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
            },
        },
        rules: {
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
        },
    },
];

export default config;
