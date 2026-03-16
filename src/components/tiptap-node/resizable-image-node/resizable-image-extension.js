import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageNode } from './resizable-image-node'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attrs) => ({ style: `width: ${attrs.width}` }),
        parseHTML: (el) => el.style.width || '100%',
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNode)
  },
})