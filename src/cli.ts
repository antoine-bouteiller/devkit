#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const commitPattern =
  /^(?:(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([^)]+\))?!?: .+|(?:Merge|Revert|fixup!|squash!|amend!) )/
const commitError = 'Commit message must follow Conventional Commits: type(scope)?: subject\n'
const usage = 'Usage: devkit commit-msg <file> | devkit commit-msg --from <sha> --to <sha> | devkit knip [...args]\n'

const firstLine = (message: string) => message.split('\n', 1)[0] ?? ''

const readMessages = (args: string[]) => {
  const { positionals, values } = parseArgs({ allowPositionals: true, args, options: { from: { type: 'string' }, to: { type: 'string' } } })
  if (values.from !== undefined && values.to !== undefined) {
    const log = execFileSync('git', ['log', '-z', '--format=%B', `${values.from}..${values.to}`], { encoding: 'utf8' })
    return log.split('\0').slice(0, -1)
  }
  const [file] = positionals
  if (file === undefined) {
    return undefined
  }
  return [readFileSync(file, 'utf8')]
}

const checkCommitMessages = (args: string[]) => {
  const messages = readMessages(args)
  if (messages === undefined) {
    process.stderr.write(usage)
    return 1
  }
  const invalid = messages.map(firstLine).filter((subject) => !commitPattern.test(subject))
  if (invalid.length === 0) {
    return 0
  }
  process.stderr.write(commitError + invalid.map((subject) => `${subject}\n`).join(''))
  return 1
}

const runKnip = (args: string[]) => {
  // Resolved from this file, so the knip pinned in devkit's dependencies runs even if the project installs another.
  const bin = fileURLToPath(new URL('../bin/knip.js', import.meta.resolve('knip')))
  return spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit' }).status ?? 1
}

const [command, ...args] = process.argv.slice(2)

if (command === 'commit-msg') {
  process.exitCode = checkCommitMessages(args)
} else if (command === 'knip') {
  process.exitCode = runKnip(args)
} else {
  process.stderr.write(usage)
  process.exitCode = 1
}
