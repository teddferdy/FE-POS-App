import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier/recommended";

export default [
  { ignores: ["build/**", "public/sw.js", "craco.config.js"] },
  pluginJs.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "error"
    }
  },
  pluginReact.configs.flat.recommended,
  pluginPrettier
];
