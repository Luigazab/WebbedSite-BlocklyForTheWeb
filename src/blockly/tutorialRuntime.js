import { expandReusableState } from './reusableBlocks.js'
import { Blockly } from './core.js'
import { DOMParser } from 'linkedom'
import { registerBlocklyBlocks } from './registerBlocks.js'
import { assertValidSource } from '../utils/javascriptSource.js'
import { workspaceDiagnostics } from './workspaceDiagnostics.js'
import { isIdentifier, validNameField } from './jsSupport.js'
import { defineFileReferenceBlocks } from './fileReferenceBlocks.js'
import { codeGeneratorService } from '../services/codeGenerator.service.js'

let initialized = false
export function initializeTutorialRuntime() {
  if (initialized) return
  initialized = true
  // Headless workers have no browser document. Blockly's serialization/events
  // still need XML helpers; inject an inert document rather than a full browser.
  Blockly.utils.xml.injectDependencies({
    document: new DOMParser().parseFromString('<xml/>', 'text/xml'),
    DOMParser,
    XMLSerializer: class { serializeToString(node) { return node.toString() } },
  })
  registerBlocklyBlocks()
}

function checkWorkspaceLimits(state) {
  let count = 0
  const visit = (value, depth) => {
    if (depth > 100) throw new Error('Workspace nesting exceeds the limit')
    if (value && typeof value === 'object') {
      if (typeof value.type === 'string' && ++count > 5000) throw new Error('Workspace exceeds the block limit')
      if (value.type?.startsWith('js_') && value.fields) {
        for (const name of ['NAME', 'VAR', 'ERR', 'RESULT']) if (typeof value.fields[name] === 'string' && !validNameField(value.type, name, value.fields[name])) throw new Error(`Invalid ${name.toLowerCase()}: ${value.fields[name]}`)
        if (typeof value.fields.PARAMS === 'string' && value.fields.PARAMS.trim() && !value.fields.PARAMS.split(',').every(name => isIdentifier(name.trim()))) throw new Error('Function parameters must be valid names.')
        if (['js_new_instance', 'js_instanceof'].includes(value.type) && typeof value.fields.CLASS === 'string' && !value.fields.CLASS.split('.').every(isIdentifier)) throw new Error('Constructor names must be valid names.')
      }
      for (const child of Object.values(value)) visit(child, depth + 1)
    }
  }
  visit(state, 0)
}

// Ignore browser-supplied code for blocks. Never eval generated source.
export function canonicalTutorialFiles(files, mode, fileDefinitions) {
  if (!Array.isArray(files) || !files.length || files.length > 32) throw new Error('Submit between 1 and 32 files')
  if (!['block', 'text'].includes(mode)) throw new Error('Unsupported tutorial mode')
  const filenames = new Set()
  if (mode === 'block') { initializeTutorialRuntime(); defineFileReferenceBlocks(fileDefinitions) }
  return files.map(file => {
    if (!file || typeof file.filename !== 'string' || filenames.has(file.filename)) throw new Error('File names must be unique')
    if (!fileDefinitions.some(definition => definition.filename === file.filename)) throw new Error('Unknown tutorial file')
    filenames.add(file.filename)
    if (mode === 'text') {
      if (typeof file.code !== 'string') throw new Error('Text files must include source code')
      assertValidSource(file.code, file.filename)
      return { filename: file.filename, code: file.code, blocks_json: null }
    }
    if (!file.blocks_json || typeof file.blocks_json !== 'object' || Array.isArray(file.blocks_json)) throw new Error('Block files must include a workspace')
    checkWorkspaceLimits(expandReusableState(file.blocks_json))
    const workspace = new Blockly.Workspace()
    try {
      Blockly.serialization.workspaces.load(expandReusableState(file.blocks_json), workspace)
      const issues = workspaceDiagnostics(workspace, file.filename).filter(issue => issue.severity !== 'hint')
      if (issues.length) throw new Error(issues.map(issue => issue.message).join(' • '))
      const code = codeGeneratorService.generateCode(workspace, file.filename)
      assertValidSource(code, file.filename)
      return { filename: file.filename, blocks_json: file.blocks_json, code }
    } finally { workspace.dispose() }
  })
}
