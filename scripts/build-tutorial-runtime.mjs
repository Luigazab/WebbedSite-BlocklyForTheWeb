import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
await mkdir('supabase/functions/_shared', { recursive: true })
await build({
  stdin: {
    contents: "export { canonicalTutorialFiles } from './src/blockly/tutorialRuntime.js'; export { validateTestCases } from './src/utils/validation/tutorialCodeValidation.js'; export { validateTutorialStep, validateTutorialReference } from './src/utils/validation/tutorialStepValidation.js';",
    resolveDir: process.cwd(), sourcefile: 'tutorial-runtime-entry.js',
  },
  // Bundle browser-compatible dependencies so the worker does not load Node's
  // jsdom wrapper or depend on a different npm resolver/generator version.
  bundle: true, format: 'esm', platform: 'browser', minify: true,
  outfile: 'supabase/functions/_shared/tutorial-runtime.generated.js',
})
console.log('Built shared tutorial runtime from the application sources')
