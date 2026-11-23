import { RuleTester } from 'oxlint/plugins-dev'

import { noSpecIdsInTestNamesRule } from './no-spec-ids-in-test-names.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const error = { messageId: 'specId' }
const storyFile = 'issues-view.stories.tsx'

tester.run('lint-config/no-spec-ids-in-test-names', noSpecIdsInTestNamesRule, {
  invalid: [
    { code: "it('[VC-2] draws the issue in date order', () => {});", errors: [error] },
    { code: "test('profile VC-6: badges show the picture', () => {});", errors: [error] },
    { code: "describe('persistedStore (VC-5)', () => {});", errors: [error] },
    { code: "test.skip('VC-4 boundary: a single half', () => {});", errors: [error] },
    { code: "it.each([1, 2])('VC-9.1 handles %s', () => {});", errors: [error] },
    { code: `test(\`VC-3 \${label}\`, () => {});`, errors: [error] },
    {
      code: "export const Admin: Story = { name: 'VC-4 — Admin can retry a failed issue' };",
      errors: [error],
      filename: storyFile,
    },
    {
      code: "export const Admin = { name: 'Monthly issue VC-7 — A failed change' } satisfies Story;",
      errors: [error],
      filename: storyFile,
    },
    { code: "test('[VC-5] / [KD-8] a date outside the issue year shows its year', () => {});", errors: [error] },
    { code: "it('[NFR-2] answers within a second', () => {});", errors: [error] },
    { code: "it('CT-6 invalid token', () => {});", errors: [error] },
    { code: "it('KD8 dates show their year', () => {});", errors: [error] },
    { code: "it('rejects a missing name (C-3)', () => {});", errors: [error] },
    { code: 'export const Vc4Member: Story = {};', errors: [error], filename: storyFile },
    { code: 'export const Ct6InvalidToken: Story = {};', errors: [error], filename: storyFile },
    { code: 'export const AdminKd8: Story = {};', errors: [error], filename: storyFile },
    { code: 'export const SO_2_MEMBER: Story = {};', errors: [error], filename: storyFile },
  ],
  valid: [
    "it('draws the issue in date order', () => {});",
    "expect(screen.getByText('VC-4')).toBeVisible();",
    "it('accepts the ADVC-4 serial', () => {});",
    "it('parses ISO-8601 dates as UTF-8 and hashes them with SHA-256', () => {});",
    "it('reads the [x] checkbox and array[0]', () => {});",
    { code: 'export const Topic4: Story = {};', filename: storyFile },
    { code: 'export const SoftDelete2: Story = {};', filename: storyFile },
    "const user = { name: 'VC-4' };",
    { code: "export const Admin: Story = { args: { name: 'VC-4' }, name: 'Admin can retry' };", filename: storyFile },
    "export const Vc4Member = { name: 'VC-4 member' };",
  ],
})
