import { defineConfig } from 'oxlint'

import { base } from './src/index.ts'

export default defineConfig({
  extends: [base],
  ignorePatterns: ['dist/**'],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    'filename-case': ['error', { cases: { kebabCase: true } }],
    // Separate `import type` lines keep type-only dependencies visible.
    'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
    // ESTree uses `null` for absent nodes.
    'no-null': 'off',
    'sort-keys': ['error', 'asc', { allowLineSeparatedGroups: true, natural: true }],
  },
})
