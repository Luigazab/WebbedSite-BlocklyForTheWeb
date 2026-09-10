import { toolboxConfig } from './toolboxConfig'

function walk(contents, parentPath = []) {
  const entries = []
  for (const item of contents) {
    if (item.kind !== 'category') continue
    const path = [...parentPath, item.name]
    const blockTypes = (item.contents ?? [])
      .filter((c) => c.kind === 'block')
      .map((c) => c.type)
    entries.push({ path, label: path.join(' › '), blockTypes })
    if (item.contents) entries.push(...walk(item.contents, path))
  }
  return entries
}

export function getToolboxCategoryOptions() {
  return walk(toolboxConfig.contents)
}