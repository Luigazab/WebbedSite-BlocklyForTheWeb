import { useState, useRef, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

export function ResizableImageNode({ node, updateAttributes, selected }) {
  const { src, alt, width = '100%' } = node.attrs
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const imgRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    startX.current = e.clientX
    startWidth.current = imgRef.current?.offsetWidth || 300
    setIsResizing(true)

    const onMouseMove = (e) => {
      const delta = e.clientX - startX.current
      const newWidth = Math.max(100, startWidth.current + delta)
      updateAttributes({ width: `${newWidth}px` })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [updateAttributes])

  return (
    <NodeViewWrapper className="resizable-image-wrapper" style={{ display: 'block', position: 'relative', width }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          display: 'block',
          outline: selected ? '2px solid #6366f1' : 'none',
          borderRadius: 4,
        }}
      />
      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 12,
          height: 12,
          background: '#6366f1',
          borderRadius: 2,
          cursor: 'se-resize',
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
    </NodeViewWrapper>
  )
}