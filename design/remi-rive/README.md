# Remi Rive source package

This folder is the handoff source for a Rive version of Remi. The artwork is original vector work guided by the supplied blue-spider expression reference; it is not a trace of that image.

## Included

- `remi-rig-source.svg` — import this into Rive. Its named groups are the rig hierarchy.
- `RIG-AND-MOTION-SPEC.md` — bones, controls, timelines, state machine, and runtime contract.

The SVG is intentionally a neutral pose with alternate eyelids and mouths present at zero opacity. Keep imported names intact; the runtime and animation spec refer to them.

## Import checklist

1. Create a `512 × 384` artboard named `Remi`.
2. Import `remi-rig-source.svg` centered at `256, 192`.
3. Confirm that Rive retained the group names.
4. Set transform origins at the pivots described in the rig specification.
5. Build the timelines before wiring `Remi Controller`.

The shadow is intentionally separate from `remi_root`, so vertical body motion does not lift the shadow.
