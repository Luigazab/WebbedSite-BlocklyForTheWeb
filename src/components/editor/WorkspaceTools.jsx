import ReusableBlocksPanel from './ReusableBlocksPanel'
export default function WorkspaceTools({ workspace }) {
  return <><ReusableBlocksPanel workspace={workspace} filename={workspace.filename} /><div className="shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
    <div className="flex items-center gap-2">
      <label htmlFor="block-palette">Blocks</label>
      <select id="block-palette" value={workspace.palette} onChange={event => workspace.setPalette(event.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1">
        {workspace.hasLessonPalette && <option value="lesson">This lesson</option>}
        <option value="beginner">Beginner</option><option value="full">Full</option>
      </select>
      <button className="rounded border border-slate-300 bg-white px-2 py-1" onClick={workspace.fitBlocks}>Fit blocks</button>
      <span className="text-slate-500">Saved blocks remain available in your workspace.</span>
    </div>
    {workspace.issues.length > 0 && <div role="status" className="mt-2 text-amber-900">
      {workspace.issues.slice(0, 3).map((issue, index) => <button key={`${issue.blockId}-${index}`} className="text-left underline decoration-dotted" onClick={() => {
        if (issue.blockId) workspace.getWorkspace()?.getBlockById(issue.blockId)?.select?.();
      }}>{issue.message}</button>)}
      {workspace.issues.length > 3 && <span>{workspace.issues.length - 3} more checks appear on the blocks.</span>}
    </div>}
  </div></>
}
