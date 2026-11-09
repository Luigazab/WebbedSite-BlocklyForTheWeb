import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly/core'
import { workspaceTheme } from '../../blockly/workspaceTheme'
import { useTheme } from '../../hooks/useTheme'
import { initBlockly } from '../../blockly/initBlockly'
import { defineFileReferenceBlocks } from '../../blockly/fileReferenceBlocks'
import '../../blockly/custom'

export default function SavedBlocksPreview({ file, files }) {
  const { resolvedTheme } = useTheme()
  const workspaceRef = useRef(null)
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const state = file?.blocks_json
  const hasBlocks = Boolean(state?.blocks?.blocks?.length)

  useEffect(() => {
    if (!hasBlocks || !containerRef.current) return
    let workspace
    let observer
    let frame
    try {
      initBlockly()
      defineFileReferenceBlocks(files)
      workspace = Blockly.inject(containerRef.current, {
        readOnly: true, theme: workspaceTheme(resolvedTheme), renderer: 'custom_renderer', sounds: false,
        zoom: { controls: true, wheel: true, startScale: 0.8, maxScale: 3, minScale: 0.1, scaleSpeed: 1.2 },
        move: { scrollbars: true, drag: true, wheel: true },
      })
      workspaceRef.current = workspace
      Blockly.serialization.workspaces.load(state, workspace)
      const fit = () => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          Blockly.svgResize(workspace)
          workspace.zoomToFit()
          workspace.scrollCenter()
        })
      }
      observer = new ResizeObserver(fit)
      observer.observe(containerRef.current)
      fit()
    } catch (error) {
      console.error('Error rendering saved blocks:', error)
      setError('These saved blocks could not be loaded. Open the project in the editor to inspect them.')
    }
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      workspaceRef.current = null
      workspace?.dispose()
    }
  }, [files, state, hasBlocks])

  useEffect(() => { workspaceRef.current?.setTheme(workspaceTheme(resolvedTheme)) }, [resolvedTheme, files, state, hasBlocks])

  if (!hasBlocks) return <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
    {file?.blocks_json == null && file?.code != null
      ? 'This file was written as code and has no saved blocks.'
      : 'This file has no saved blocks yet.'}
  </div>

  return <div className="relative min-h-0 flex-1">
    <div ref={containerRef} className="absolute inset-0 bg-muted" />
    {error && <div role="alert" className="absolute inset-0 flex items-center justify-center bg-muted p-6 text-sm text-red-700 dark:text-red-300">{error}</div>}
  </div>
}
