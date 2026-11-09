import * as Blockly from 'blockly/core'
import Modern from '@blockly/theme-modern'

// Inherit all block/category styles; only workspace chrome changes.
const themes = {}
export function workspaceTheme(resolvedTheme) {
  if (!themes[resolvedTheme]) {
    const dark = resolvedTheme === 'dark'
    themes[resolvedTheme] = Blockly.Theme.defineTheme(`webbedsite_${resolvedTheme}`, {
      name: `webbedsite_${resolvedTheme}`,
      base: Modern,
      componentStyles: {
        workspaceBackgroundColour: dark ? '#0b1220' : '#f8fafc',
        toolboxBackgroundColour: dark ? '#111a2e' : '#ffffff',
        toolboxForegroundColour: dark ? '#f1f5f9' : '#0f172a',
        flyoutBackgroundColour: dark ? '#1a2540' : '#f1f5f9',
        flyoutForegroundColour: dark ? '#f1f5f9' : '#0f172a',
        flyoutOpacity: 1,
        scrollbarColour: dark ? '#7F9DBC' : '#6282A7',
        insertionMarkerColour: dark ? '#ffffff' : '#0f172a',
      },
    })
  }
  return themes[resolvedTheme]
}
