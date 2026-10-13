export const REMI_ARTBOARD = 'Remi'
export const REMI_STATE_MACHINE = 'Remi Controller'
export const REMI_VIEW_MODEL = 'RemiModel'

export const REMI_EMOTIONS = Object.freeze([
  'idle',
  'thinking',
  'explaining',
  'happy',
  'confused',
  'sleep',
])

export const REMI_TRIGGERS = Object.freeze([
  'blink',
  'wave',
  'celebrate',
])

export const REMI_DEFAULTS = Object.freeze({
  emotion: 'idle',
  lookX: 0,
  lookY: 0,
  reducedMotion: false,
})

export function normalizeRemiLook(value = {}) {
  const clamp = (number) => Math.max(-1, Math.min(1, Number(number) || 0))
  return { x: clamp(value.x), y: clamp(value.y) }
}

export function isRemiEmotion(value) {
  return REMI_EMOTIONS.includes(value)
}
