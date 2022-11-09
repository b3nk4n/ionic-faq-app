module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "capacitor.config.ts",
    "/src/react-app-env.d.ts",
    "/src/reportWebVitals.ts",
    "/src/setupTests.ts",
    "/build/**/*",
    "/src/firebase-messaging-sw.js",
    "/public/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "max-len": ["error", { "code": 120 }],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": 0,
    "@typescript-eslint/no-explicit-any": "off",
  },
};
