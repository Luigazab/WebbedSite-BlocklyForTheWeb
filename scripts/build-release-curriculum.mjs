import { mkdir,writeFile } from 'node:fs/promises'
import { build } from 'esbuild'
// Build from the same block definitions and generator used by the browser.
await mkdir('node_modules/.cache/release-curriculum',{recursive:true})
await build({entryPoints:['scripts/release-curriculum-source.mjs'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'node_modules/.cache/release-curriculum/generate.mjs'})
await import('../node_modules/.cache/release-curriculum/generate.mjs')
