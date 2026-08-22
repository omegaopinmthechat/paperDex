import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".env",
      ".env.*",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // General
      "no-console": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Code quality
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "no-constant-condition": "warn",

      // Style
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", 4],
      "array-bracket-spacing": ["error", 0],
      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],

      // Functions
      "arrow-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],

      // Equality
      eqeqeq: ["error", "always"],

      // Best practices
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
