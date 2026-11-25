import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { KnipConfig, KnipConfiguration } from 'knip'

/** Wrap a project's knip config with shared defaults, appending project arrays. */
export const defineKnipConfig =
  (config: KnipConfig): KnipConfig =>
  async (options) => {
    const project = await (typeof config === 'function' ? config(options) : config)
    const manifest = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8'))
    const defaults: KnipConfiguration = { includeEntryExports: true, tags: ['-lintignore'] }

    if (manifest.dependencies?.['vite-plus'] !== undefined || manifest.devDependencies?.['vite-plus'] !== undefined) {
      defaults.husky = { config: ['.vite-hooks/pre-commit', '.vite-hooks/commit-msg'] }
    } else {
      // Vite+ runs its own oxlint, and knip hints at unused ignoreBinaries entries.
      defaults.ignoreBinaries = ['oxlint']
    }

    const defaultValues = new Map(Object.entries(defaults))
    return {
      ...defaults,
      ...Object.fromEntries(
        Object.entries(project).map(([key, value]) => {
          const defaultValue = defaultValues.get(key)
          return [key, Array.isArray(defaultValue) && Array.isArray(value) ? [...defaultValue, ...value] : value]
        })
      ),
    }
  }
