export async function uploadProjectThumbnail(client, projectId, blob) {
  const fileName = `workspace_snapshots/${projectId}_${crypto.randomUUID()}.png`
  const bucket = client.storage.from('thumbnails')
  const { error: uploadError } = await bucket.upload(fileName, blob, {
    contentType: 'image/png', cacheControl: '3600',
  })
  if (uploadError) throw uploadError
  const { data: { publicUrl } } = bucket.getPublicUrl(fileName)
  const { data, error } = await client.from('projects')
    .update({ thumbnail_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', projectId).select('id, thumbnail_url').single()
  if (error || !data) {
    await bucket.remove([fileName])
    throw error || new Error('The project thumbnail could not be updated.')
  }
  return data.thumbnail_url
}
