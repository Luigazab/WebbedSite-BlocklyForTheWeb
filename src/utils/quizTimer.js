export function splitQuizTime(totalSeconds) {
  if (totalSeconds == null || totalSeconds === '') return { minutes: '', seconds: '' }
  const total = Number(totalSeconds)
  return { minutes: String(Math.floor(total / 60)), seconds: String(total % 60) }
}

export function quizTimeInSeconds(minutes, seconds) {
  const values = [String(minutes), String(seconds)]
  if (values.some(value => value !== '' && !/^\d+$/.test(value))) throw new Error('Enter whole, non-negative numbers for the quiz timer.')
  const min = Number(minutes || 0)
  const sec = Number(seconds || 0)
  const total = min * 60 + sec
  if (sec > 59) throw new Error('Seconds must be between 0 and 59.')
  if (!Number.isSafeInteger(total) || total > 2147483647) throw new Error('The quiz timer is too large.')
  return total || null
}
