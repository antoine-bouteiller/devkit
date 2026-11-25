import type { Plugin } from '@oxlint/plugins'

import { noConditionalEmptyObjectSpreadRule } from './rules/no-conditional-empty-object-spread.ts'
import { noKnownValueWideningRule } from './rules/no-known-value-widening.ts'
import { noLowSignalSymbolNamesRule } from './rules/no-low-signal-symbol-names.ts'
import { noModuleMockingRule } from './rules/no-module-mocking.ts'
import { noObjectParametersRule } from './rules/no-object-parameters.ts'
import { noSpecIdsInTestNamesRule } from './rules/no-spec-ids-in-test-names.ts'
import { noUnknownTypeAliasesRule } from './rules/no-unknown-type-aliases.ts'
import { noUnsafeDictionaryTypeRule } from './rules/no-unsafe-dictionary-type.ts'

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const plugin: Plugin = {
  meta: { name: 'devkit' },
  rules: {
    'no-conditional-empty-object-spread': noConditionalEmptyObjectSpreadRule,
    'no-known-value-widening': noKnownValueWideningRule,
    'no-low-signal-symbol-names': noLowSignalSymbolNamesRule,
    'no-module-mocking': noModuleMockingRule,
    'no-object-parameters': noObjectParametersRule,
    'no-spec-ids-in-test-names': noSpecIdsInTestNamesRule,
    'no-unknown-type-aliases': noUnknownTypeAliasesRule,
    'no-unsafe-dictionary-type': noUnsafeDictionaryTypeRule,
  },
}

export default plugin
