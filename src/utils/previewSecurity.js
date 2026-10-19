export const PREVIEW_SANDBOX = 'allow-scripts allow-modals allow-forms'

export function validPreviewMessage(event, previewWindow) {
  if (!previewWindow || event.source !== previewWindow || event.origin !== 'null') return false
  const data = event.data
  if (!data || typeof data !== 'object') return false
  if (data.type === 'NAVIGATE_TO_FILE') return typeof data.filename === 'string' && data.filename.length <= 200
  if (data.type === 'CONSOLE_MESSAGE') return ['log', 'warn', 'error', 'info'].includes(data.logType) && typeof data.message === 'string' && data.message.length <= 10000
  if (data.type === 'PREVIEW_STORAGE') return ['local', 'session'].every(key => {
    const store = data[key]
    return store && typeof store === 'object' && !Array.isArray(store) && Object.keys(store).length <= 100
      && Object.entries(store).every(([name, value]) => name.length <= 200 && typeof value === 'string' && value.length <= 10000)
  })
  return false
}
