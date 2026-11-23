import type { ESTree, Rule } from '@oxlint/plugins'

const testFunctions = new Set(['bench', 'describe', 'it', 'suite', 'test'])
// Bracketed IDs match any prefix. Bare ones need a known prefix, so `UTF-8` and `ISO-8601` stay valid.
const specIdPattern = /\[[A-Z]{1,4}-\d|\b(?:(?:CT|KD|NG|OQ|PI|SO|VC)[-_]?|[CG]-)\d/u
const specIdWordPattern = /\b(?:ct|kd|ng|oq|pi|so|vc) ?\d/iu
const storyFilePattern = /\.stories\.[cm]?[jt]sx?$/u

const calleeRoot = (callee: ESTree.Node): string | undefined => {
  switch (callee.type) {
    case 'Identifier': {
      return callee.name
    }
    case 'MemberExpression': {
      return calleeRoot(callee.object)
    }
    case 'CallExpression': {
      return calleeRoot(callee.callee)
    }
    default: {
      return undefined
    }
  }
}

const staticText = (node: ESTree.Node): string | undefined => {
  if (node.type === 'Literal') {
    return typeof node.value === 'string' ? node.value : undefined
  }
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(' ')
  }
  return undefined
}

const identifierWords = (name: string): string => name.replaceAll(/(?<=[a-z\d])(?=[A-Z])/gu, ' ').replaceAll('_', ' ')

const unwrapExpression = (node: ESTree.Expression): ESTree.Expression =>
  node.type === 'TSSatisfiesExpression' || node.type === 'TSAsExpression' ? unwrapExpression(node.expression) : node

const storyNameValue = (init: ESTree.Expression): ESTree.Node | undefined => {
  const story = unwrapExpression(init)
  if (story.type !== 'ObjectExpression') {
    return undefined
  }
  const nameProperty = story.properties.find(
    (property) => property.type === 'Property' && !property.computed && property.key.type === 'Identifier' && property.key.name === 'name'
  )
  return nameProperty?.type === 'Property' ? nameProperty.value : undefined
}

/** Ban spec item IDs such as `VC-4` or `KD-8` in test, suite, and story names. */
export const noSpecIdsInTestNamesRule: Rule = {
  createOnce(context) {
    const reportText = (node: ESTree.Node): void => {
      const text = staticText(node)
      if (text !== undefined && specIdPattern.test(text)) {
        context.report({ messageId: 'specId', node })
      }
    }

    return {
      CallExpression(node) {
        const [title] = node.arguments
        const root = calleeRoot(node.callee)
        if (title !== undefined && root !== undefined && testFunctions.has(root)) {
          reportText(title)
        }
      },
      ExportNamedDeclaration(node) {
        if (!storyFilePattern.test(context.filename) || node.declaration?.type !== 'VariableDeclaration') {
          return
        }
        for (const declarator of node.declaration.declarations) {
          if (declarator.id.type === 'Identifier' && specIdWordPattern.test(identifierWords(declarator.id.name))) {
            context.report({ messageId: 'specId', node: declarator.id })
          }
          const name = declarator.init == null ? undefined : storyNameValue(declarator.init)
          if (name !== undefined) {
            reportText(name)
          }
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow spec item IDs such as `VC-4` or `KD-8` in test, suite, and Storybook story names.',
    },
    messages: {
      specId: 'Name the test after the behavior it checks, not the spec item ID; the ID means nothing outside the spec.',
    },
    type: 'suggestion',
  },
}
