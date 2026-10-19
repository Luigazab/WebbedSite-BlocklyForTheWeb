import { useMemo, useRef, useState } from 'react'
import BlocklyWorkspace from '@/components/editor/BlocklyWorkspace'
import WorkspaceTools from '@/components/editor/WorkspaceTools'
import PreviewPane from '@/components/editor/PreviewPane'
import { practiceProjects } from '@/blockly/practiceProjects'
import { codeGeneratorService } from '@/services/codeGenerator.service'
import { lessonBlockTypes } from '@/blockly/learningToolbox'

export default function JavaScriptPractice() {
  const [projectId, setProjectId] = useState('counter')
  const project = practiceProjects.find(project => project.id === projectId)
  const [code, setCode] = useState('')
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [responsive, setResponsive] = useState(true)
  const loading = useRef(false)
  const workspace = BlocklyWorkspace({ filename: 'main.js', initialWorkspaceState: project.state,
    lessonBlocks: lessonBlockTypes({ tutorial_step_files: [{ blocks_json: project.state }] }), initialPalette: 'lesson',
    onWorkspaceChange: current => { if (!loading.current) setCode(codeGeneratorService.generateCode(current, 'main.js')) },
  })
  const html = useMemo(() => codeGeneratorService.combineFilesForPreview([
    { filename: 'index.html', generatedCode: project.html }, { filename: 'main.js', generatedCode: code },
  ], 'index.html'), [project, code])
  const load = (nextProject, example) => {
    loading.current = true
    setProjectId(nextProject.id)
    if (example) workspace.loadWorkspaceState(nextProject.state)
    else workspace.clearWorkspace()
    setCode(example ? codeGeneratorService.generateCodeFromState(nextProject.state, 'main.js') : '')
    loading.current = false
  }
  return <main className="h-screen flex flex-col bg-slate-100 text-slate-900">
    <div className="shrink-0 p-4 bg-white border-b border-slate-200">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">JavaScript Practice</h1>
        <label htmlFor="practice-project">Project</label>
        <select id="practice-project" className="border rounded px-2 py-1" value={projectId} onChange={event => load(practiceProjects.find(project => project.id === event.target.value), true)}>
          {practiceProjects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
        <button className="rounded bg-indigo-700 text-white px-3 py-1" onClick={() => load(project, false)}>Start exercise</button>
        <button className="rounded border px-3 py-1" onClick={() => load(project, true)}>Show example</button>
      </div>
      <p className="mt-2">{project.task}</p>
      <p className="mt-1 text-xs text-slate-600">The HTML and CSS are provided. Build the behavior in main.js. Practice storage stays with this example; practice APIs work offline.</p>
    </div>
    <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 p-3">
      <section aria-label="JavaScript blocks" className="flex flex-col flex-1 min-h-0 bg-white rounded border">
        <WorkspaceTools workspace={workspace} />
        <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1 min-h-0" />
      </section>
      <section aria-label="Project preview" className="md:w-2/5 min-h-0 flex-1">
        <PreviewPane generatedCode={html} currentFileCode={code} currentFileName="main.js" previewFileName="index.html" storageScope={`practice:${project.id}`}
          responsive={responsive} onToggleResponsive={() => setResponsive(value => !value)} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice}
          onRunCode={() => setCode(codeGeneratorService.generateCode(workspace.getWorkspace(), 'main.js'))} />
      </section>
    </div>
  </main>
}
