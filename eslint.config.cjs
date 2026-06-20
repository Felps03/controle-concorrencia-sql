const js = require("@eslint/js");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "no-unused-vars": ["error", { args: "none" }],
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  {
    files: ["eslint.config.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
      },
    },
  },
  {
    ignores: ["node_modules/", "src/generated/"],
  },
];
