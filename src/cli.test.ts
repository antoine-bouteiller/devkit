import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('cli.ts', import.meta.url))
const errorText = 'Commit message must follow Conventional Commits: type(scope)?: subject'
const scratch = mkdtempSync(join(tmpdir(), 'devkit-cli-'))

process.on('exit', () => rmSync(scratch, { force: true, recursive: true }))

const runCli = (args: string[], cwd = scratch) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' })

const checkMessage = (message: string) => {
  const file = join(scratch, 'COMMIT_EDITMSG')
  writeFileSync(file, message)
  return runCli(['commit-msg', file])
}

await test('commit-msg accepts conventional subjects, merges, and autosquash commits', () => {
  for (const message of ['feat(api): add x', 'fix!: y', 'fixup! feat: x', "Merge branch 'main'", 'chore: a\n\nbody without a type\n']) {
    assert.equal(checkMessage(message).status, 0, message)
  }
})

await test('commit-msg rejects a first line that is not a conventional subject', () => {
  for (const message of ['update stuff', 'Feat: x', 'feat: ', 'wip\nfeat: x']) {
    const result = checkMessage(message)
    assert.equal(result.status, 1, message)
    assert.ok(result.stderr.includes(errorText), message)
  }
})

await test('commit-msg checks every subject in a git range', async (context) => {
  const repo = mkdtempSync(join(scratch, 'repo-'))
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.hooksPath=/dev/null', ...args], {
      cwd: repo,
      encoding: 'utf8',
    }).trim()
  git('init', '-q')
  git('commit', '-q', '--allow-empty', '-m', 'chore: root')
  const root = git('rev-parse', 'HEAD')
  git('commit', '-q', '--allow-empty', '-m', 'chore: a')
  const valid = git('rev-parse', 'HEAD')
  git('commit', '-q', '--allow-empty', '-m', 'wip')

  await context.test('accepts a range of conforming subjects', () => {
    assert.equal(runCli(['commit-msg', '--from', root, '--to', valid], repo).status, 0)
  })

  await context.test('rejects a range with a nonconforming subject and names it', () => {
    const result = runCli(['commit-msg', '--from', root, '--to', 'HEAD'], repo)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /^wip$/m)
    assert.doesNotMatch(result.stderr, /chore: a/)
  })

  await context.test('rejects a range containing an empty commit message', () => {
    const from = git('rev-parse', 'HEAD')
    git('commit', '-q', '--allow-empty', '--allow-empty-message', '-m', '')
    const result = runCli(['commit-msg', '--from', from, '--to', 'HEAD'], repo)
    assert.equal(result.status, 1)
    assert.ok(result.stderr.includes(errorText))
  })
})

await test('knip runs the pinned version even when PATH contains another knip', () => {
  const { dependencies } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const bin = mkdtempSync(join(scratch, 'bin-'))
  writeFileSync(join(bin, 'knip'), '#!/bin/sh\nprintf "0.0.0-fake\\n"\n', { mode: 0o755 })
  const result = spawnSync(process.execPath, [cli, 'knip', '--version'], {
    cwd: scratch,
    encoding: 'utf8',
    env: { ...process.env, PATH: [bin, dirname(process.execPath)].join(delimiter) },
  })
  assert.equal(result.status, 0)
  assert.equal(result.stdout.trim(), dependencies.knip)
})

await test('knip exits with the knip exit code', () => {
  // Knip exits 2 on a fatal error, here a directory without package.json.
  assert.equal(runCli(['knip']).status, 2)
})
