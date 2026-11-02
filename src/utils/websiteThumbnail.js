import { buildPreviewDocument } from './previewRuntime.js'

export const THUMBNAIL_WIDTH = 1280
export const THUMBNAIL_HEIGHT = 720

// Runs inside an opaque sandbox, never in the authenticated application document.
export function captureBootstrap(token, width, height) {
  const send = payload => parent.postMessage({ type: 'WEBSITE_THUMBNAIL', token, ...payload }, '*')
  window.addEventListener('load', async () => {
    try {
      await Promise.race([
        Promise.all([document.fonts.ready, ...Array.from(document.images, image => image.decode().catch(() => {}))]),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ])
      await new Promise(resolve => setTimeout(resolve, 250))
      const svg = await window.htmlToImage.toSvg(document.documentElement, {
        width, height, canvasWidth: width, canvasHeight: height,
        pixelRatio: 1, backgroundColor: '#ffffff',
        filter: node => !['SCRIPT', 'NOSCRIPT'].includes(node.tagName),
      })
      // html-to-image's toPng waits for requestAnimationFrame, which browsers
      // suspend for offscreen iframes. Decode and rasterize without that wait.
      const image = new Image()
      image.src = svg
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/png')
      send({ dataUrl })
    } catch (error) {
      send({ error: error.message || 'Could not capture the website preview.' })
    }
  }, { once: true })
}

export function validThumbnailMessage(event, frameWindow, token) {
  return event.source === frameWindow && event.origin === 'null'
    && event.data?.type === 'WEBSITE_THUMBNAIL' && event.data.token === token
}

export async function captureWebsiteThumbnail(html) {
  const { default: renderer } = await import('html-to-image/dist/html-to-image.js?raw')
  const token = crypto.randomUUID()
  const frame = document.createElement('iframe')
  frame.title = 'Generating project thumbnail'
  frame.setAttribute('sandbox', 'allow-scripts')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${THUMBNAIL_WIDTH}px;height:${THUMBNAIL_HEIGHT}px;border:0;pointer-events:none;`
  // Install capture before project scripts, without granting same-origin access.
  const script = `${renderer}\n;(${captureBootstrap.toString()})(${JSON.stringify(token)},${THUMBNAIL_WIDTH},${THUMBNAIL_HEIGHT});`
  frame.srcdoc = `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>${buildPreviewDocument(html)}`

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      frame.remove()
    }
    const onMessage = async event => {
      if (!validThumbnailMessage(event, frame.contentWindow, token)) return
      const { dataUrl, error } = event.data
      if (error || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,') || dataUrl.length > 12_000_000) {
        cleanup()
        reject(new Error(error || 'Invalid website screenshot.'))
        return
      }
      cleanup()
      try { resolve(await (await fetch(dataUrl)).blob()) } catch (error) { reject(error) }
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Website screenshot timed out. Please try saving again.'))
    }, 20000)
    window.addEventListener('message', onMessage)
    document.body.appendChild(frame)
  })
}
