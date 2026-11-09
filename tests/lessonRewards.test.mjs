import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { build } from 'esbuild'
import JSZip from 'jszip'

await mkdir('node_modules/.cache/reward-tests', { recursive: true })
const mock = `
  const call = (name, value) => { globalThis.rewardCalls.push(name); if (globalThis.rewardFailure === name) throw new Error('Save failed'); return value };
  export const createLessonBase = async () => call('create', {id: 'new-lesson'});
  export const updateLessonBase = async ({lessonId}) => call('update', {id: lessonId});
  export const upsertLectureContent = async () => call('content');
  export const upsertQuizContent = async () => call('content');
  export const publishSavedLesson = async () => call('publish');
  export const fetchLectureEditorData = async () => ({id: 'existing', is_published: true});
  export const fetchQuizEditorData = fetchLectureEditorData;
  export const fetchTopicGroupsForAuthoring = async () => [];
  export const removeLessonById = async () => {};
  export const uploadLectureAttachment = async () => '';
`
for (const kind of ['lecture', 'quiz']) {
  await build({ entryPoints: [`src/store/${kind}Store.js`], bundle: true, format: 'esm', platform: 'node', packages: 'external', outfile: `node_modules/.cache/reward-tests/${kind}.mjs`, plugins: [{ name: 'authoring-services', setup(builder) {
    builder.onResolve({ filter: /services\/(lessonService|lectureService|quizService|lessonPublicationService)$/ }, args => ({ path: args.path, namespace: 'mock' }))
    builder.onResolve({ filter: /services\/quiz.service$/ }, args => ({ path: args.path, namespace: 'quiz-mock' }))
    builder.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: mock, loader: 'js' }))
    builder.onLoad({ filter: /.*/, namespace: 'quiz-mock' }, () => ({ contents: 'export const quizService = {}', loader: 'js' }))
  } }] })
  const name = kind[0].toUpperCase() + kind.slice(1)
  const store = (await import(`../node_modules/.cache/reward-tests/${kind}.mjs`))[`use${name}Store`]
  const values = { title: 'Lesson', topicId: 'topic', authorId: 'teacher', content: 'Content', attachments: {}, questions: [], publish: false }
  test(`${kind}: draft saves do not publish, published content is saved before exposure`, async () => {
    globalThis.rewardCalls = []; globalThis.rewardFailure = null
    await store.getState()[`create${name}`](values)
    assert.deepEqual(globalThis.rewardCalls, ['create', 'content'])
    assert.equal(store.getState()[kind].isPublished, false)
    globalThis.rewardCalls = []
    await store.getState()[`update${name}`]({ ...values, lessonId: 'new-lesson', publish: true })
    assert.deepEqual(globalThis.rewardCalls, ['update', 'content', 'publish'])
    assert.equal(store.getState()[kind].isPublished, true)
  })
  test(`${kind}: failed publication retains draft ID and releases saving state`, async () => {
    globalThis.rewardCalls = []; globalThis.rewardFailure = 'publish'
    await assert.rejects(store.getState()[`create${name}`]({ ...values, publish: true }), /Save failed/)
    assert.equal(store.getState()[kind].id, 'new-lesson')
    assert.equal(store.getState()[kind].isPublished, false)
    assert.equal(store.getState().saving, false)
    globalThis.rewardFailure = null
  })
}

test('provided dotLottie files contain playable animations', async () => {
  for (const filename of ['Trophy.lottie', 'Reward light effect.lottie']) {
    const zip = await JSZip.loadAsync(await readFile(`public/${filename}`))
    const manifest = JSON.parse(await zip.file('manifest.json').async('string'))
    assert.ok(manifest.animations.length > 0)
    const animation = zip.file(/(?:animations|a)\/.*\.json$/)[0]
    assert.ok(animation, filename)
    const data = JSON.parse(await animation.async('string'))
    assert.ok(data.w > 0 && data.h > 0 && data.op > data.ip && data.fr > 0, filename)
  }
})
