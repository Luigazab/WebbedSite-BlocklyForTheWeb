# Text and Blocks modes

`htmlTextModes.js` enhances headings, paragraphs, links, strong/emphasis, and
the b/i/mark/small/del/ins/sub/sup blocks with a Text/Blocks dropdown.

Text is the default. Blocks mode replaces the text field with a CONTENT
statement input and transfers the existing text to a plain text child. The
attribute socket and other fields, such as heading level and link URL, stay
on the parent.

To build `<h1>Hello <span>World</span></h1>`:

1. Set the heading text to `Hello `, including the trailing space.
2. Choose Blocks on the heading.
3. Attach a span after the plain text child.
4. Put a plain text block containing `World` inside the span.

Switching back to Text combines a chain of enabled plain text children. If
there are nested elements or disabled children, the dropdown stays on Blocks
and displays a warning. Move those children out before switching back.

The shape, dropdown and child edits are grouped for undo/redo. JSON extra state
and XML mutation state preserve the mode; saved text-only blocks without this
state still load in Text mode.

The generators for these text elements and span emit exact content without
adding indentation or newlines between inline children. Plain text is escaped
so `<`, `>`, and `&` display literally. A literal HTML snippet typed into a
text field is therefore displayed as text; use nested blocks for markup.

Run `node --test tests/htmlTextModes.test.mjs` for mixed-content output,
JSON/XML persistence, switching, undo/redo, and legacy text-field loading.
