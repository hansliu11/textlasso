// @ts-check

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: ['**/*.{js,ts}'],
  extends: [
    js.configs.recommended, 
    tseslint.configs.strict,
    tseslint.configs.stylistic,
  ],
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  }
}, globalIgnores(['dist']));