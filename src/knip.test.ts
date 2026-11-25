import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, test } from 'node:test'

import type { KnipConfig } from 'knip'

import { defineKnipConfig } from './index.ts'

const originalCwd = process.cwd()
let scratch = ''

beforeEach(() => {
  scratch = mkdtempSync(join(tmpdir(), 'devkit-knip-'))
  process.chdir(scratch)
  writeFileSync('package.json', '{}')
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(scratch, { force: true, recursive: true })
})

const resolveConfig = async (config: KnipConfig, production = false) => {
  const wrapped = defineKnipConfig(config)
  assert.ok(typeof wrapped === 'function')
  return await wrapped({ production })
}

await test('Vite+ projects get hook files without an ignored oxlint binary', async () => {
  const expected = {
    husky: { config: ['.vite-hooks/pre-commit', '.vite-hooks/commit-msg'] },
    includeEntryExports: true,
    tags: ['-lintignore'],
  }
  writeFileSync('package.json', JSON.stringify({ dependencies: { 'vite-plus': 'latest' } }))
  assert.deepEqual(await resolveConfig({}), expected)
  writeFileSync('package.json', JSON.stringify({ devDependencies: { 'vite-plus': 'latest' } }))
  assert.deepEqual(await resolveConfig({}), expected)
})

await test('projects without Vite+ ignore the oxlint binary', async () => {
  const config = await resolveConfig({})
  assert.deepEqual(config, {
    ignoreBinaries: ['oxlint'],
    includeEntryExports: true,
    tags: ['-lintignore'],
  })
})

await test('project arrays extend defaults in order', async () => {
  const config = await resolveConfig({ ignoreBinaries: ['fmt'], tags: ['-generated'] })
  assert.deepEqual(config.ignoreBinaries, ['oxlint', 'fmt'])
  assert.deepEqual(config.tags, ['-lintignore', '-generated'])
})

await test('project scalars and objects replace defaults without a deep merge', async () => {
  writeFileSync('package.json', JSON.stringify({ devDependencies: { 'vite-plus': 'latest' } }))
  const config = await resolveConfig({ husky: { entry: ['hooks.ts'] }, includeEntryExports: false })
  assert.equal(config.includeEntryExports, false)
  assert.deepEqual(config.husky, { entry: ['hooks.ts'] })
})

await test('function configs receive knip options and their async result is merged', async () => {
  const config = await resolveConfig(async (options) => {
    await Promise.resolve()
    assert.deepEqual(options, { production: true })
    return { entry: options.production ? ['src/main.ts'] : ['src/**/*.ts'], tags: ['-generated'] }
  }, true)
  assert.deepEqual(config, {
    entry: ['src/main.ts'],
    ignoreBinaries: ['oxlint'],
    includeEntryExports: true,
    tags: ['-lintignore', '-generated'],
  })
})
