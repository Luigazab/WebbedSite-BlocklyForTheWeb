// Fresh objects let each toolbox entry and button action own its child state.
export const listItemPreset = () => ({
  type: 'li',
  inputs: { CONTENT: { block: { type: 'html_plain_text', fields: { TEXT: '' } } } },
})
