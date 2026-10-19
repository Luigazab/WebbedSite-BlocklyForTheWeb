// Anonymous release/read-size check; sends no account credentials or cookies.
const origin = 'https://webbedsite.fun'
async function read(path) {
  const response = await fetch(new URL(path,origin),{signal:AbortSignal.timeout(15000)})
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return response
}
const marker = await (await read('/release.json')).json()
const html = await (await read('/')).text()
const entry = html.match(/<script[^>]+src="([^"]+)"/)?.[1]
if (!entry || new URL(entry,origin).origin !== origin) throw new Error('A local application entry asset is required.')
const response = await read(entry)
const bytes = (await response.arrayBuffer()).byteLength
console.log(JSON.stringify({checked_at:new Date().toISOString(),origin,release:marker.release,entry,decoded_bytes:bytes,encoding:response.headers.get('content-encoding'),transfer_content_length:response.headers.get('content-length')},null,2))
