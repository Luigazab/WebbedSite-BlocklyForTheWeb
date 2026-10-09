// Blockly's saved state contains IDs, coordinates, and editor metadata that do
// not describe what a student built. Match only the required block hierarchy.
const topBlocks = (state) => state?.blocks?.blocks ?? []
const childBlock = (connection) => connection?.block ?? connection?.shadow ?? null

function matchesBlock(actual, expected, path, failures) {
  if (!actual || actual.type !== expected.type) {
    failures.push(`${path}: expected ${expected.type} block`)
    return false
  }

  for (const [name, connection] of Object.entries(expected.inputs ?? {})) {
    const required = childBlock(connection)
    if (!required) continue
    const present = childBlock(actual.inputs?.[name])
    if (!present) {
      failures.push(`${path}: place ${required.type} inside ${actual.type} (${name})`)
      return false
    }
    if (!matchesBlock(present, required, `${path} > ${name}`, failures)) return false
  }

  const requiredNext = childBlock(expected.next)
  if (requiredNext) {
    // Extra sibling blocks are harmless if the required sequence remains in order.
    let sibling = childBlock(actual.next)
    while (sibling) {
      const local = []
      if (matchesBlock(sibling, requiredNext, `${path} > next`, local)) return true
      sibling = childBlock(sibling.next)
    }
    failures.push(`${path}: add ${requiredNext.type} after ${actual.type}`)
    return false
  }
  return true
}

export function validateWorkspaceStructure(actualState, expectedState) {
  const required = topBlocks(expectedState)
  if (!required.length) return { passed: false, failures: ['No expected blocks are configured.'] }
  const actual = topBlocks(actualState)
  const failures = []
  const used = new Set()
  for (const block of required) {
    let matched = false
    let bestFailure = []
    for (const [index, candidate] of actual.entries()) {
      if (used.has(index) || candidate.type !== block.type) continue
      const local = []
      if (matchesBlock(candidate, block, block.type, local)) { matched = true; used.add(index); break }
      if (!bestFailure.length || local.length < bestFailure.length) bestFailure = local
    }
    if (!matched) failures.push(...(bestFailure.length ? bestFailure : [`Add a ${block.type} block.`]))
  }
  return { passed: failures.length === 0, failures }
}
