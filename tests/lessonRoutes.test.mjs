import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { matchRoutes } from 'react-router';
import { classroomPath, coursePreviewPath, legacyLessonDestination, lessonPath } from '../src/utils/lessonRoutes.js';

test('lesson links and old bookmarks preserve their classroom context', () => {
  assert.equal(lessonPath('html', 'heading', 'class-a'), '/student/classrooms/class-a/lessons/html/heading');
  assert.equal(lessonPath('html', 'heading', 'class-b'), '/student/classrooms/class-b/lessons/html/heading');
  assert.equal(lessonPath('html css', 'hello/world', 'class-a'), '/student/classrooms/class-a/lessons/html%20css/hello%2Fworld');
  assert.equal(legacyLessonDestination('html', 'heading', '?classroomId=class-a&mode=review'), '/student/classrooms/class-a/lessons/html/heading?mode=review');
  assert.equal(legacyLessonDestination('html', null, '?classroomId=class-a'), classroomPath('class-a'));
  assert.equal(legacyLessonDestination('html', 'heading'), '/student/classrooms');
  assert.equal(coursePreviewPath('course-a', 'html', 'heading'), '/teacher/lessons/course-a/html/heading');
});

// Load the real route definitions with page components stubbed. This checks
// route matching and layout ancestry without initializing Blockly or Supabase.
async function loadRoutes(name) {
  const entry = fileURLToPath(new URL(`../src/router/${name}Routes.jsx`, import.meta.url));
  const result = await build({
    entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-router'],
    plugins: [{
      name: 'stub-page-components',
      setup(builder) {
        builder.onResolve({ filter: /^(?:\.|@|#)/ }, args => {
          if (args.kind === 'entry-point') return;
          const component = args.path.split('/').at(-1).replace(/\.jsx$/, '');
          return { path: component, namespace: 'test-component' };
        });
        builder.onLoad({ filter: /.*/, namespace: 'test-component' }, args => ({
          contents: `export default function ${args.path}() { return null; }`, loader: 'js',
        }));
      },
    }],
  });
  const temp = new URL(`.lesson-routes-${randomUUID()}.mjs`, import.meta.url);
  try {
    await writeFile(temp, result.outputFiles[0].text);
    const module = await import(pathToFileURL(fileURLToPath(temp)).href);
    return module[`${name}Routes`];
  } finally {
    await unlink(temp);
  }
}

// Resolve lazy imports before inspecting the stub component identity.
async function componentName(type) {
  if (type?.name) return type.name;
  const payload = type?._payload;
  if (!payload) return undefined;
  const loaded = typeof payload._result === 'function' ? await payload._result() : await payload._result;
  return loaded.default.name;
}
async function routeNames(matches) {
  return Promise.all(matches.filter(match => match.route.element).map(match => componentName(match.route.element.type)));
}

test('student lesson viewers match a dedicated layout outside the dashboard', async () => {
  const routes = [{ path: '/student', children: await loadRoutes('student') }];
  for (const slug of ['lecture', 'quiz', 'tutorial', 'laboratory']) {
    const matches = matchRoutes(routes, `/student/classrooms/class-a/lessons/html/${slug}`);
    assert.deepEqual(await routeNames(matches), ['LessonLayout', 'LessonPage']);
    assert.equal(matches.at(-1).params.classroomId, 'class-a');
    assert.equal(matches.at(-1).params.slug, slug);
  }
  assert.deepEqual(await routeNames(matchRoutes(routes, '/student/classrooms/class-a')), ['StudentLayout', 'StudentClassroomHub']);
  assert.equal(matchRoutes(routes, '/student/learn').at(-1).route.element.props.to, '/student/classrooms');
  assert.equal(await componentName(matchRoutes(routes, '/student/learn/html/heading').at(-1).route.element.type), 'LegacyLessonRedirect');
});

test('teacher previews also match a dedicated layout and old URLs redirect', async () => {
  const routes = [{ path: '/teacher', children: await loadRoutes('teacher') }];
  const matches = matchRoutes(routes, '/teacher/lessons/course-a/html/heading');
  assert.deepEqual(await routeNames(matches), ['LessonLayout', 'LessonPage']);
  assert.equal(matches.at(-1).route.element.props.preview, true);
  const old = matchRoutes(routes, '/teacher/courses/course-a/view/html/heading');
  assert.equal(await componentName(old.at(-1).route.element.type), 'LegacyLessonRedirect');
  assert.equal(old.at(-1).route.element.props.preview, true);
});
