# Expandable HTML attributes

The block definitions and generators live together in `htmlAttributes.js`.
`defineBlocks.jsx` calls `defineAttributeBlocks()`, and `defineGenerators.jsx`
calls `defineAttributeGenerators()`. The Attributes toolbox exposes them.

## Using the holder

1. Drag `extra_attributes` from Attributes into an element's attributes socket.
2. Connect a class, ID, style, or other attribute to its first socket.
3. Click + for another socket. Click − to remove the last socket.

Removing an occupied socket detaches the child instead of deleting it. Undo
restores the socket and connection. The holder supports zero through 32 slots.
An attribute can also connect directly to an element without a holder.

For example, a holder containing class `card`, ID `intro`, and aria-label
`Introduction` generates:

```html
<div class="card" id="intro" aria-label="Introduction">
</div>
```

## How it works

- `itemCount_` stores the number of sockets.
- `updateShape_()` adds missing inputs and removes only surplus inputs, so
  retained sockets keep their connected blocks.
- `resizeAttributes_()` groups the shape change and disconnect events for undo.
- `saveExtraState()` / `loadExtraState()` preserve the count in JSON.
- `mutationToDom()` / `domToMutation()` support XML saves.
- The first input is still named `body_style` for compatibility with existing
  saved `extra_attributes` blocks. It accepts attributes, not CSS declarations.
- Each attribute generator returns a string with a leading space and atomic
  precedence. The holder concatenates those strings; empty sockets emit nothing.
- Attribute values escape ampersands, double quotes, and less-than signs.

## Which settings belong on an element?

Keep the main teaching fields directly on the relevant element: link URL,
image source and alternative text, input type, and similar essential settings.
Use the holder for optional global settings and less common attributes.

The added blocks cover common global attributes, data-* attributes, aria-*
attributes, boolean attributes, and custom name/value attributes. Enter just
the suffix for data-* and aria-* (for example, `label`, not `aria-label`).

This is not an exhaustive HTML validity checker. Only use element-specific
attributes on elements that support them, and do not duplicate an attribute
already provided by the element or another socket. The custom block handles
less common names without requiring a separate block for every HTML attribute.
Use the boolean block for presence/absence attributes; use a value attribute
for enumerated values such as contenteditable="false" or aria-hidden="false".

## Verification

Run `node --test tests/htmlAttributes.test.mjs`. The tests cover generated
HTML, escaping, boolean omission, JSON/XML persistence, legacy saved inputs,
empty holders, bounds, and undo/redo of occupied-slot removal.
