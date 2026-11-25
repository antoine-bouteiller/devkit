import { defineConfig } from 'oxfmt'

import { fmt } from './src/index.ts'

export default defineConfig({
  ...fmt,
  ignorePatterns: ['dist/**', 'pnpm-lock.yaml'],
})
