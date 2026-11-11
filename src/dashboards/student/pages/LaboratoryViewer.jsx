import ThemeSelect from '../../../components/common/ThemeSelect'
import WorkspaceTools from '@/components/editor/WorkspaceTools'
import BlocklyWorkspace from "@/components/editor/BlocklyWorkspace";
import FileTabs from "@/components/editor/FileTabs";
import PreviewPane from "@/components/editor/PreviewPane";
import { defineFileReferenceBlocks } from "@/blockly/fileReferenceBlocks";
import { codeGeneratorService } from "@/services/codeGenerator.service";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { getOwnSubmissions, submitLaboratory, copyLearningProject } from "@/services/studentReviewService";
import { ArrowLeft, FlaskConical, Image } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const uid = () => Math.random().toString(36).slice(2, 10);

const parseLabInstruction = (value) => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : { description: value };
  } catch {
    return { description: value };
  }
};

const LaboratoryViewer = ({ lesson, onBack, onCompleted, preview = false }) => {
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  const profile = useAuthStore((state) => state.profile);
  const lab = parseLabInstruction(lesson?.laboratory?.instruction);
  const starterFiles = lab.files?.length
    ? lab.files.map((file) => ({ id: uid(), filename: file.filename, blocks_json: file.blocks_json ?? null }))
    : [{ id: uid(), filename: "index.html", blocks_json: null }];
  const [files, setFiles] = useState(starterFiles);
  const [activeFileId, setActiveFileId] = useState(starterFiles[0]?.id ?? null);
  const [previewFileId, setPreviewFileId] = useState(starterFiles.find((file) => file.filename.endsWith(".html"))?.id ?? starterFiles[0]?.id ?? null);
  const [filesWithCode, setFilesWithCode] = useState(starterFiles.map((file) => ({ id: file.id, filename: file.filename, generatedCode: "" })));
  const [generatedCode, setGeneratedCode] = useState("");
  const [mobileTab, setMobileTab] = useState("instructions");
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const submittingRef = useRef(false);
  const requestRef = useRef(crypto.randomUUID());
  const isLoadingRef = useRef(false);

  const workspace = BlocklyWorkspace({
    filename: files.find(f => f.id === activeFileId)?.filename || 'index.html',
    onWorkspaceChange: (wsRef) => {
      if (isLoadingRef.current) return;
      setSaveMessage("");
      const file = files.find((item) => item.id === activeFileId);
      if (!file) return;
      const code = codeGeneratorService.generateCode(wsRef, file.filename);
      setFilesWithCode((prev) => prev.map((item) => item.id === file.id ? { ...item, generatedCode: code } : item));
    },
    onWorkspaceLoad: () => defineFileReferenceBlocks(files),
  });

  useEffect(() => {
    if (!workspace.isInitialized) return;
    let cancelled = false;
    async function restore() {
      isLoadingRef.current = true;
      try {
        const saved = !preview && profile?.id ? (await getOwnSubmissions(lesson.id))[0] : null;
        if (cancelled) return;
        if (saved) {
          setSubmission(saved);
          const restored = saved.files.map(file => ({ ...file, id: uid() }));
          setFiles(restored); setActiveFileId(restored[0].id); setPreviewFileId(restored.find(file => file.filename.endsWith('.html'))?.id ?? restored[0].id);
          setFilesWithCode(restored.map(file => ({ id: file.id, filename: file.filename, generatedCode: file.code ?? '' })));
          restored[0].blocks_json ? workspace.loadWorkspaceState(restored[0].blocks_json) : workspace.clearWorkspace();
        } else {
          setFilesWithCode(files.map(file => ({ id: file.id, filename: file.filename, generatedCode: codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) })));
          files[0]?.blocks_json ? workspace.loadWorkspaceState(files[0].blocks_json) : workspace.clearWorkspace();
        }
      } catch (error) { addToast(error.message || 'Could not restore your laboratory work.', 'error'); }
      finally { isLoadingRef.current = false; }
    }
    restore();
    return () => { cancelled = true; };
  }, [workspace.isInitialized]);

  useEffect(() => {
    const previewFile = files.find((file) => file.id === previewFileId) ?? files[0];
    setGeneratedCode(codeGeneratorService.combineFilesForPreview(filesWithCode, previewFile?.filename));
  }, [filesWithCode, files, previewFileId]);

  const flushActiveFile = () => {
    const state = workspace.getWorkspaceState?.() ?? null;
    const updated = files.map((file) => file.id === activeFileId ? { ...file, blocks_json: state } : file);
    setFiles(updated);
    return updated;
  };

  const handleFileChange = (fileId) => {
    const updated = flushActiveFile();
    const file = updated.find((item) => item.id === fileId);
    setActiveFileId(fileId);
    isLoadingRef.current = true;
    file?.blocks_json ? workspace.loadWorkspaceState(file.blocks_json) : workspace.clearWorkspace();
    setTimeout(() => { isLoadingRef.current = false; }, 150);
    if (file?.filename.endsWith(".html")) setPreviewFileId(fileId);
  };

  const runCode = () => {
    const file = files.find((item) => item.id === activeFileId);
    if (!file || !workspace.getWorkspace()) return;
    const code = codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename);
    setFilesWithCode((prev) => prev.map((item) => item.id === activeFileId ? { ...item, generatedCode: code } : item));
  };

  const createFile = (filename) => {
    if (!/^[\w-]+\.(html|css|js)$/i.test(filename)) return addToast('Use a filename such as page.html, style.css, or script.js.', 'error');
    if (files.some(file => file.filename.toLowerCase() === filename.toLowerCase())) return addToast('A file with that name already exists.', 'error');
    if (files.length >= 32) return addToast('A laboratory supports up to 32 files.', 'error');
    const next = { id: uid(), filename, blocks_json: null };
    const updated = [...flushActiveFile(), next];
    setFiles(updated); setFilesWithCode(previous => [...previous, { ...next, generatedCode: '' }]);
    setActiveFileId(next.id); workspace.clearWorkspace(); defineFileReferenceBlocks(updated);
    if (filename.endsWith('.html')) setPreviewFileId(next.id);
  };

  const deleteFile = (id) => {
    if (files.length <= 1) return;
    const updated = flushActiveFile().filter(file => file.id !== id);
    setFiles(updated); setFilesWithCode(previous => previous.filter(file => file.id !== id));
    if (activeFileId === id) {
      setActiveFileId(updated[0].id);
      updated[0].blocks_json ? workspace.loadWorkspaceState(updated[0].blocks_json) : workspace.clearWorkspace();
    }
    if (previewFileId === id) setPreviewFileId(updated.find(file => file.filename.endsWith('.html'))?.id ?? updated[0].id);
    defineFileReferenceBlocks(updated);
  };

  const submitWork = async (draft = false) => {
    if (preview || !profile?.id || submittingRef.current || (submission?.is_final && submission.review_status !== "needs_revision")) return;
    submittingRef.current = true; setSubmitting(true);
    setSaveMessage("");
    setSaveError(false);
    try {
      const snapshot = flushActiveFile().map(file => ({
        filename: file.filename, blocks_json: file.blocks_json,
        code: file.id === activeFileId && workspace.getWorkspace() ? codeGeneratorService.generateCode(workspace.getWorkspace(), file.filename) : codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename),
      }));
      const saved = await submitLaboratory({ lessonId: lesson.id, files: snapshot, requestKey: requestRef.current, draft });
      requestRef.current = crypto.randomUUID();
      setSubmission(saved);
      if (draft) setSaveMessage('Project progress saved. Your teacher cannot view or grade this draft yet. Remember to submit it when you are ready.');
      else {
        setSaveMessage('Project submitted for grading. Your teacher can now review it.');
        try { await copyLearningProject(lesson.id); } catch (error) { console.error('Project copy could not be saved:', error); }
        await onCompleted?.();
      }
    } catch (error) {
      setSaveError(true);
      setSaveMessage(error.message || (draft ? 'Could not save your progress. Try again.' : 'Could not submit your project. Try again.'));
    }
    finally { submittingRef.current = false; setSubmitting(false); }
  };

  const activeFile = files.find((file) => file.id === activeFileId);
  const htmlFiles = files.filter((file) => file.filename.endsWith(".html"));

  return (
    <div className="h-screen bg-muted flex flex-col overflow-hidden">
      <header className="shrink-0 flex flex-wrap items-center gap-3 border-b bg-card px-4 py-2.5">
        <button onClick={onBack ?? (() => navigate(-1))} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </button>
        <span className="text-slate-300">|</span>
        {preview && <span className="text-xs text-amber-700 dark:text-amber-300">Preview · Progress is not saved</span>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">{lesson?.title || "Laboratory"}</p>
          <p className="truncate text-xs text-muted-foreground">{lesson?.topic?.title}</p>
        </div>
        {!preview && <button disabled={submitting || (submission?.is_final && submission.review_status !== "needs_revision")} onClick={() => submitWork(true)} className="rounded-xl border bg-card px-4 py-2 text-xs font-bold text-foreground disabled:opacity-50">{submitting ? 'Saving…' : 'Save progress / draft'}</button>}
        {!preview && <button disabled={submitting || (submission?.is_final && submission.review_status !== "needs_revision")} onClick={() => submitWork(false)} className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{submitting ? 'Submitting…' : submission?.review_status === 'needs_revision' ? 'Resubmit for grading' : submission?.is_final ? 'Submitted for grading' : 'Submit for grading'}</button>}
      <ThemeSelect compact />
      </header>
      {saveMessage && <div role={saveError ? 'alert' : 'status'} aria-live="polite" className={`shrink-0 border-b px-4 py-3 text-sm font-medium ${saveError ? 'border-red-200 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100' : submission?.is_final ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100' : 'border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-100'}`}>{saveMessage}</div>}

      <nav aria-label="Learning panels" role="tablist" className="flex shrink-0 border-b bg-card md:hidden">
        {[['instructions', 'Instructions'], ['editor', 'Editor'], ['preview', 'Preview']].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold ${mobileTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className={`${mobileTab === 'instructions' ? 'flex flex-col' : 'hidden'} w-full shrink-0 overflow-y-auto bg-card p-4 space-y-4 md:flex md:w-80 md:border-r`}>
          {submission && <div className="rounded-xl border border-sky-200 bg-sky-50 dark:bg-sky-950/50 p-4 text-sm"><p className="font-bold">{submission.graded_at ? `${submission.review_status === "needs_revision" ? "Needs revision" : "Passed"}: ${submission.score}%` : submission.is_final ? 'Submitted for grading · Awaiting teacher review' : 'Draft saved'}</p>{!submission.is_final && <p className="mt-2">Your teacher cannot view or grade this draft yet. Remember to submit it when you are ready.</p>}{submission.feedback && <p className="mt-2 whitespace-pre-wrap">{submission.feedback}</p>}</div>}
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <FlaskConical className="size-4 text-emerald-500" /> Challenge
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{lab.description || "Complete the laboratory activity."}</p>
          </div>
          <div className="rounded-xl border p-4 text-sm"><h2 className="font-bold">Grading rubric · Pass: {submission?.passing_score_snapshot ?? lesson?.laboratory?.passing_score ?? 75}%</h2>{(submission?.rubric_snapshot ?? lesson?.laboratory?.rubric ?? []).map(c => <p key={c.id} className="mt-2">{c.label}: {c.max} points</p>)}<p className="mt-3 text-xs text-foreground">Your teacher grades this project after you submit it.</p></div>
          {lab.referenceImageUrl && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Image className="size-4 text-blue-500" /> Expected Result
              </div>
              <img src={lab.referenceImageUrl} alt="Expected laboratory result" className="w-full rounded-lg border object-contain" />
            </div>
          )}
        </aside>

        <main className={`${mobileTab === 'instructions' ? 'hidden' : 'flex'} flex-1 min-h-0 overflow-hidden md:flex`}>
          <section className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-card md:flex md:border-r`}>
            <FileTabs files={files} activeFile={activeFileId} isLocal={false} onFileChange={handleFileChange} onFileCreate={createFile} onFileDelete={deleteFile} />
            <WorkspaceTools workspace={workspace} />
          <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
          </section>
          <section className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} min-w-0 w-full overflow-hidden md:flex md:w-[28rem] md:shrink-0`}>
            <PreviewPane
              storageScope={`laboratory:${lesson?.id || 'preview'}`}
            generatedCode={generatedCode}
              currentFileCode={filesWithCode.find((file) => file.id === activeFileId)?.generatedCode || ""}
              currentFileName={activeFile?.filename || ""}
              previewFileName={files.find((file) => file.id === previewFileId)?.filename || ""}
              htmlFiles={htmlFiles}
              onRunCode={runCode}
              onNavigateToFile={(filename) => {
                const file = files.find((item) => item.filename === filename);
                if (file) setPreviewFileId(file.id);
              }}
              responsive={responsive}
              selectedDevice={selectedDevice}
              onToggleResponsive={() => setResponsive((value) => !value)}
              onSelectDevice={setSelectedDevice}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default LaboratoryViewer;
