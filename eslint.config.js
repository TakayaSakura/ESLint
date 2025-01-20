import redosPlugin from "./eslint-rules/index.js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
    },
    plugins: {
      redos: redosPlugin,
    },
    rules: {
      "redos/redos-detection": "error",
    },
  },
];
