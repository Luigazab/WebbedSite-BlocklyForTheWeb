import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly/core'

/**
 * Highlights a toolbox category (expanding nested ones along the way) and,
 * optionally, selects a specific block inside that category's flyout.
 */
export function useRemiHighlight(getWorkspace, categoryPath, blockType) {
  const highlightedDivRef = useRef(null)

  useEffect(() => {
    const ws = getWorkspace?.()
    const toolbox = ws?.getToolbox?.()
    if (!ws || !toolbox || !categoryPath?.length) return

    let cancelled = false

    const clear = () => {
      highlightedDivRef.current?.classList.remove('remi-highlight')
      highlightedDivRef.current = null
      Blockly.common.getSelected()?.unselect()
    }
    clear()

    // Walk the path through nested toolbox items, expanding as we go
    let items = toolbox.getToolboxItems?.() ?? []
    let target = null
    for (let i = 0; i < categoryPath.length; i++) {
      target = items.find((it) => it.toolboxItemDef_?.name === categoryPath[i])
      if (!target) break
      const isLast = i === categoryPath.length - 1
      if (!isLast) {
        target.setExpanded?.(true)
        items = target.getChildToolboxItems?.() ?? []
      }
    }
    if (!target) return

    const div = target.getDiv?.()
    if (div) {
      div.classList.add('remi-highlight')
      highlightedDivRef.current = div
      div.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
    }

    // Open the flyout so the student sees the actual blocks
    toolbox.setSelectedItem?.(target)

    if (blockType) {
      setTimeout(() => {
        if (cancelled) return
        const flyoutWs = ws.getFlyout?.()?.getWorkspace?.()
        flyoutWs?.getBlocksByType?.(blockType, false)?.[0]?.select?.()
      }, 150)
    }

    return () => { cancelled = true; clear() }
  }, [getWorkspace, JSON.stringify(categoryPath), blockType])
}