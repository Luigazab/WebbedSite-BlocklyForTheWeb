import { Blockly } from './core.js'
import { listItemPreset } from './htmlListPresets.js'

const plusIcon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="9" fill="none" stroke="white"/><path d="M5 10h10M10 5v10" stroke="white" stroke-width="2"/></svg>')
const children = {
  ul: [['li', 'Add item']],
  ol: [['li', 'Add item']],
  select: [['option', 'Add option']],
  html_dl: [['html_dt', 'Add term'], ['html_dd', 'Add description']],
}

// Append to CONTENT, never to the parent's outer next connection.
export function appendListChild(parent, type) {
  const workspace = parent.workspace
  if (parent.isInFlyout || workspace.options.readOnly || !parent.isEditable()
    || !children[parent.type]?.some(([allowed]) => allowed === type)
    || workspace.remainingCapacity() < (type === 'li' ? 2 : 1)) return null
  let connection = parent.getInput('CONTENT')?.connection
  if (!connection) return null
  while (connection?.targetBlock()) connection = connection.targetBlock().nextConnection
  if (!connection) return null

  const group = Blockly.Events.getGroup()
  Blockly.Events.setGroup(group || true)
  try {
    const child = Blockly.serialization.blocks.append(type === 'li' ? listItemPreset() : { type }, workspace, { recordUndo: true })
    connection.connect(child.previousConnection)
    return child
  } finally { Blockly.Events.setGroup(group) }
}

export function defineListControls() {
  for (const [type, actions] of Object.entries(children)) {
    const definition = Blockly.Blocks[type]
    const init = definition.init
    definition.init = function () {
      init.call(this)
      const controls = this.appendDummyInput('LIST_ACTIONS')
      for (const [childType, label] of actions) {
        controls.appendField(new Blockly.FieldImage(plusIcon, 20, 20, label, () => appendListChild(this, childType)))
          .appendField(label)
      }
      // Keep the controls above the content cavity.
      this.moveInputBefore('LIST_ACTIONS', 'CONTENT')
      // Value and dummy inputs share the header; CONTENT still starts its own row.
      this.setInputsInline(true)
    }
  }
}
