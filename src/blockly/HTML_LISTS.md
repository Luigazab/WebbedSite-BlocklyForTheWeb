# HTML list starters and Add buttons

`htmlListControls.js` adds clickable image fields to `ul`, `ol`, `select`, and
`html_dl`. Each button creates a normal child block and connects it to the end
of the existing CONTENT chain. It does not add a new statement input or change
the parent's outer next connection. Existing generators already walk CONTENT,
so they handle the added children without special generator code.

The `dl` block has separate Add term and Add description buttons, allowing
multiple descriptions per term. Children keep their own attribute sockets.
Move or delete individual children with Blockly's usual controls.

Toolbox presets in `toolboxConfig.js` use JSON, not blockxml:

```js
{
  kind: 'block',
  type: 'html_dl',
  inputs: {
    CONTENT: {
      block: {
        type: 'html_dt',
        next: { block: { type: 'html_dd' } },
      },
    },
  },
}
```

Dragging this starter creates a dl containing dt followed by dd. The outermost
block in the preset is dl: dt does not contain dl. Standalone dt and dd entries
remain available for extending existing lists. Likewise, ul/ol start with li,
and select starts with option. These are editable real blocks, not shadows.

Each new li also includes an empty `html_plain_text` block in CONTENT, whether
created from the standalone toolbox entry, an ul/ol starter, or Add item.
`htmlListPresets.js` shares that preset. The Text category also offers this
block separately. Its generator emits escaped text with no wrapping element;
an empty field emits nothing. It can be moved, removed, or stacked with other
content blocks. Existing saved li content is unchanged.

Presets apply only when dragging from the toolbox. Loading an empty saved list
keeps it empty, and loading existing children does not create duplicates.
Button actions group creation and connection into one undo step.

Run `node --test tests/htmlLists.test.mjs` to check presets, connections,
generation, persistence, and undo/redo.
