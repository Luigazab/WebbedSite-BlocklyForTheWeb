import CaptureValidationPanel from '@/components/editor/CaptureValidationPanel'
import { capturedTests, countChecks } from '@/utils/validation/generatedCodeChecks'
import { validateTestCases, validateTutorialCode } from '@/utils/validation/tutorialCodeValidation'
import AssessmentSettings from '@/components/shared/AssessmentSettings'
import RubricEditor from '@/components/shared/RubricEditor'
import { DEFAULT_RUBRIC } from '@/lib/assessment'
import WorkspaceTools from '@/components/editor/WorkspaceTools'
import { AppBreadcrumb } from "#components/common/breadcrumb";
import { Button } from "#components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#components/ui/card";
import { Label } from "#components/ui/label";
import { Input } from "#components/ui/input";
import { Textarea } from "#components/ui/textarea";
import BlocklyWorkspace from "@/components/editor/BlocklyWorkspace";
import FileTabs from "@/components/editor/FileTabs";
import PreviewPane from "@/components/editor/PreviewPane";
import { defineFileReferenceBlocks } from "@/blockly/fileReferenceBlocks";
import { codeGeneratorService } from "@/services/codeGenerator.service";
import { useAuth } from "@/hooks/useAuth";
import {
  createLessonBase,
  fetchLaboratoryEditorData,
  fetchTopicGroupsForAuthoring,
  updateLessonBase,
  upsertLaboratoryContent,
} from "@/services/contentCreationService";
import { useUIStore } from "@/store/uiStore";
import { BookOpen, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, FlaskConical, ListOrdered, Save, Sun, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import BackButton from "#components/common/BackButton";
import { toast } from "sonner";
import { validateWorkspaceStructure } from "@/utils/validation/workspaceStructure";

const uid = () => Math.random().toString(36).slice(2, 10);
const makeFile = (filename = "index.html", blocks_json = null) => ({ id: uid(), filename, blocks_json });

const parseLabInstruction = (value) => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : { description: value };
  } catch {
    return { description: value };
  }
};

const LaboratoryBuilderPage = ({ context = "teacher" }) => {
  const isAdmin = context === "admin";
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get("classroomId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((state) => state.addToast);
  const isEditMode = Boolean(id);
  const [lessonId, setLessonId] = useState(id || null);
  const [rubric, setRubric] = useState(DEFAULT_RUBRIC);
  const [passingScore, setPassingScore] = useState(75);
  const [title, setTitle] = useState("");
  const [baseXp, setBaseXp] = useState("50");
  const [description, setDescription] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(() => id ? "" : searchParams.get("topicId") || "");
  const [courseTopics, setCourseTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingLab, setLoadingLab] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [initialFiles, setInitialFiles] = useState(null);
  const [expectedByFile, setExpectedByFile] = useState({});
  const [testDrafts, setTestDrafts] = useState({});
  const [expectedBlocks, setExpectedBlocks] = useState(null);
  const [expectedFilename, setExpectedFilename] = useState(null);
  const [requiredSelector, setRequiredSelector] = useState("");
  const [requiredText, setRequiredText] = useState("");
  const [requiredCode, setRequiredCode] = useState("");
  const [files, setFiles] = useState([makeFile()]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [filesWithCode, setFilesWithCode] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewFileId, setPreviewFileId] = useState(null);
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState();
  const [panelOpen, setPanelOpen] = useState(true);
  const [metaOpen, setMetaOpen] = useState(true);
  const isLoadingRef = useRef(false);

  const workspace = BlocklyWorkspace({
    filename: files.find(f => f.id === activeFileId)?.filename || 'index.html',
    onWorkspaceChange: (wsRef) => {
      if (isLoadingRef.current) return;
      const file = files.find((item) => item.id === activeFileId);
      if (!file) return;
      const code = codeGeneratorService.generateCode(wsRef, file.filename);
      setFilesWithCode((prev) =>
        prev.some((item) => item.id === file.id)
          ? prev.map((item) => item.id === file.id ? { ...item, generatedCode: code } : item)
          : [...prev, { id: file.id, filename: file.filename, generatedCode: code }]
      );
    },
    onWorkspaceLoad: () => defineFileReferenceBlocks(files),
  });

  useEffect(() => {
    ;(async () => {
      setLoadingTopics(true);
      try {
        setCourseTopics(await fetchTopicGroupsForAuthoring({ masterOnly: isAdmin, classroomId, lessonId: id }));
      } catch (error) {
        toast.error(error.message || "Failed to load topics.");
      } finally {
        setLoadingTopics(false);
      }
    })();
  }, [isAdmin, classroomId, id]);

  useEffect(() => {
    if (!isEditMode) return;
    ;(async () => {
      setLoadingLab(true);
      try {
        const data = await fetchLaboratoryEditorData(id);
        const lab = parseLabInstruction(data.laboratory?.instruction);
        const authorFiles = lab.authorFiles ?? lab.files;
        const loadedFiles = authorFiles?.length ? authorFiles.map((file) => ({
          id: uid(),
          filename: file.filename,
          blocks_json: file.blocks_json ?? null,
        })) : [makeFile()];
        setLessonId(data.id);
        setRubric(data.laboratory?.rubric || DEFAULT_RUBRIC);
        setPassingScore(data.laboratory?.passing_score || 75);
        setTitle(data.title || "");
        setBaseXp((data.base_xp ?? 50).toString());
        setSelectedTopicId(data.topics_id || "");
        setDescription(lab.description || "");
        setReferenceImageUrl(lab.referenceImageUrl || "");
        setInitialFiles(lab.files?.length ? lab.files : null);
        setExpectedByFile(lab.codeValidation?.expectedByFile ?? {});
        setExpectedBlocks(lab.expectedBlocks || null);
        setExpectedFilename(lab.expectedFilename || loadedFiles[0]?.filename || null);
        setRequiredSelector(lab.requiredSelector || "");
        setRequiredText(lab.requiredText || "");
        setRequiredCode(lab.requiredCode || "");
        setFiles(loadedFiles);
        setActiveFileId(loadedFiles[0]?.id ?? null);
        setPreviewFileId(loadedFiles.find((file) => file.filename.endsWith(".html"))?.id ?? loadedFiles[0]?.id ?? null);
        setFilesWithCode(loadedFiles.map((file) => ({ id: file.id, filename: file.filename, generatedCode: codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) })));
        if (workspace.isInitialized) {
          isLoadingRef.current = true;
          loadedFiles[0]?.blocks_json ? workspace.loadWorkspaceState(loadedFiles[0].blocks_json) : workspace.clearWorkspace();
          setTimeout(() => { isLoadingRef.current = false; }, 150);
        }
      } catch (error) {
        addToast(error.message || "Failed to load laboratory.", "error");
      } finally {
        setLoadingLab(false);
      }
    })();
  }, [id, isEditMode, addToast, workspace.isInitialized]);

  useEffect(() => {
    if (files.length === 0) return;
    setActiveFileId((current) => current || files[0].id);
    setPreviewFileId((current) => current || files.find((file) => file.filename.endsWith(".html"))?.id || files[0].id);
    defineFileReferenceBlocks(files);
  }, [files]);

  useEffect(() => {
    const previewFile = files.find((file) => file.id === previewFileId) ?? files[0];
    setGeneratedCode(codeGeneratorService.combineFilesForPreview(filesWithCode, previewFile?.filename));
  }, [filesWithCode, files, previewFileId]);

  const flushActiveFile = useCallback(() => {
    const state = workspace.getWorkspaceState?.() ?? null;
    setFiles((prev) => prev.map((file) => file.id === activeFileId ? { ...file, blocks_json: state } : file));
    return files.map((file) => file.id === activeFileId ? { ...file, blocks_json: state } : file);
  }, [activeFileId, files, workspace]);

  const handleFileChange = (fileId) => {
    const updated = flushActiveFile();
    const target = updated.find((file) => file.id === fileId);
    setActiveFileId(fileId);
    isLoadingRef.current = true;
    target?.blocks_json ? workspace.loadWorkspaceState(target.blocks_json) : workspace.clearWorkspace();
    setTimeout(() => { isLoadingRef.current = false; }, 150);
    if (target?.filename.endsWith(".html")) setPreviewFileId(fileId);
  };

  const handleCreateFile = (filename) => {
    const updated = flushActiveFile();
    const newFile = makeFile(filename);
    setFiles([...updated, newFile]);
    setFilesWithCode((prev) => [...prev, { id: newFile.id, filename, generatedCode: "" }]);
    setActiveFileId(newFile.id);
    if (filename.endsWith(".html")) setPreviewFileId(newFile.id);
    isLoadingRef.current = true;
    workspace.clearWorkspace();
    setTimeout(() => { isLoadingRef.current = false; }, 150);
  };

  const handleDeleteFile = (fileId) => {
    if (files.length <= 1) return;
    const removed = files.find(file => file.id === fileId);
    const remaining = flushActiveFile().filter((file) => file.id !== fileId);
    setFiles(remaining);
    setFilesWithCode((prev) => prev.filter((file) => file.id !== fileId));
    setExpectedByFile(previous => { const next = { ...previous }; delete next[removed.filename]; return next; });
    setTestDrafts(previous => { const next = { ...previous }; delete next[removed.filename]; return next; });
    setInitialFiles(previous => previous?.filter(file => file.filename !== removed.filename) ?? null);
    if (activeFileId === fileId) {
      setActiveFileId(remaining[0].id);
      isLoadingRef.current = true;
      workspace.loadWorkspaceState(remaining[0].blocks_json ?? {});
      setTimeout(() => { isLoadingRef.current = false; }, 150);
    }
    if (previewFileId === fileId) setPreviewFileId(remaining.find(file => file.filename.endsWith('.html'))?.id ?? remaining[0].id);
  };

  const snapshotProject = () => flushActiveFile().map(file => ({ ...file, blocks_json: file.blocks_json ?? {}, code: codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) }));
  const captureStarting = () => {
    if (Object.keys(testDrafts).length) throw new Error('Apply your manual tests before recapturing.');
    const snapshot = snapshotProject();
    const next = {};
    for (const file of snapshot) {
      const expected = expectedByFile[file.filename];
      if (expected) {
        const testCases = capturedTests(file.code, expected.code, file.filename, expected.testCases);
        validateTestCases(testCases);
        next[file.filename] = { ...expected, testCases };
      }
    }
    setInitialFiles(snapshot);
    setExpectedByFile(next);
    addToast('Starting project captured.', 'success');
  };
  const captureExpected = () => {
    if (!initialFiles || files.some(file => !initialFiles.some(initial => initial.filename === file.filename))) throw new Error('Capture the starting project, including all files, first.');
    if (Object.keys(testDrafts).length) throw new Error('Apply your manual tests before recapturing.');
    const next = {};
    for (const file of snapshotProject()) {
      const initial = initialFiles.find(item => item.filename === file.filename);
      const initialCode = codeGeneratorService.generateCodeFromState(initial.blocks_json, file.filename);
      const testCases = capturedTests(initialCode, file.code, file.filename, expectedByFile[file.filename]?.testCases ?? []);
      validateTestCases(testCases);
      next[file.filename] = { blocksJson: file.blocks_json, code: file.code, testCases };
    }
    setExpectedByFile(next);
    setExpectedBlocks(null);
    addToast('Expected project captured and code checks generated.', 'success');
  };
  const loadSnapshot = expected => {
    const next = files.map(file => ({ ...file, blocks_json: expected ? expectedByFile[file.filename]?.blocksJson ?? {} : initialFiles?.find(item => item.filename === file.filename)?.blocks_json ?? {} }));
    setFiles(next);
    setFilesWithCode(next.map(file => ({ ...file, generatedCode: codeGeneratorService.generateCodeFromState(file.blocks_json, file.filename) })));
    isLoadingRef.current = true;
    workspace.loadWorkspaceState(next.find(file => file.id === activeFileId)?.blocks_json ?? {});
    setTimeout(() => { isLoadingRef.current = false; }, 150);
  };
  const applyTests = (filename, testCases) => {
    validateTestCases(testCases);
    setExpectedByFile(previous => ({ ...previous, [filename]: { ...previous[filename], testCases } }));
    setTestDrafts(previous => { const next = { ...previous }; delete next[filename]; return next; });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReferenceImageUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const selectedTopic = useMemo(
    () => courseTopics.flatMap((group) => group.topics).find((topic) => topic.id === selectedTopicId),
    [courseTopics, selectedTopicId]
  );

  const handleSave = async () => {
    if (!user?.id) return addToast("You must be signed in to save a laboratory.", "error");
    if (!title.trim()) return addToast("Laboratory title is required.", "error");
    if (!/^\d+$/.test(baseXp) || Number(baseXp) <= 0) return addToast("Base XP must be a positive whole number.", "error");
    if (!selectedTopic) return addToast("Select a topic for this laboratory.", "error");
    if (rubric.reduce((sum,c)=>sum+Number(c.max),0)!==100) return addToast("Rubric points must total 100.", "error");
    if (expectedBlocks && !validateWorkspaceStructure(expectedBlocks, expectedBlocks).passed) return addToast("Capture a workspace with at least one required block.", "error");
    if (requiredText.trim() && !requiredSelector.trim()) return addToast("Choose an HTML selector for required text.", "error");

    setSaving(true);
    try {
      const latestFiles = flushActiveFile();
      const expected = Object.fromEntries(Object.entries(expectedByFile).filter(([filename]) => latestFiles.some(file => file.filename === filename)).map(([filename, value]) => {
        const testCases = testDrafts[filename] != null ? JSON.parse(testDrafts[filename]) : value.testCases;
        validateTestCases(testCases);
        const result = validateTutorialCode(value.code, value.code, testCases);
        if (!result.passed) throw new Error(filename + ': ' + result.failures.join(' • '));
        return [filename, { ...value, testCases }];
      }));
      if (Object.keys(expected).length && !Object.values(expected).some(value => countChecks(value.testCases))) throw new Error('Add at least one active code check before saving the expected project.');
      const lesson = lessonId
        ? await updateLessonBase({ lessonId, topicId: selectedTopicId, title, baseXp: Number(baseXp) })
        : await createLessonBase({ topicId: selectedTopicId, authorId: user.id, title, type: "laboratory", baseXp: Number(baseXp) });
      setLessonId(lesson.id);
      await upsertLaboratoryContent({
        lessonId: lesson.id, rubric, passingScore,
        instruction: JSON.stringify({
          description,
          referenceImageUrl,
          expectedBlocks,
          expectedFilename,
          requiredSelector: requiredSelector.trim(),
          requiredText: requiredText.trim(),
          requiredCode: requiredCode.trim(),
          files: latestFiles.map(({ filename }) => ({ filename, blocks_json: initialFiles?.find(file => file.filename === filename)?.blocks_json ?? {} })),
          authorFiles: latestFiles.map(({ filename, blocks_json }) => ({ filename, blocks_json })),
          codeValidation: Object.keys(expected).length ? { version: 1, expectedByFile: expected } : undefined,
        }),
      });
      setExpectedByFile(expected);
      setTestDrafts({});
      addToast(isEditMode ? "Laboratory updated successfully." : "Laboratory saved successfully.", "success");
      if (!isEditMode) navigate(`/${context}/laboratory/edit/${lesson.id}`, { replace: true });
    } catch (error) {
      addToast(error.message || "Failed to save laboratory.", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeFile = files.find((file) => file.id === activeFileId);
  const htmlFiles = files.filter((file) => file.filename.endsWith(".html"));

  return (
    <div className="flex flex-col h-screen bg-gray-100 ">
      <div className="backdrop-blur-md shrink-0 flex items-center gap-3 px-4 py-2.5 ">
        <Link to="/"><img src="/icon.png" alt="icon image" className='w-8 h-8' /></Link>
        <BackButton />
        {lessonId && <details className="max-h-96 overflow-auto rounded-lg border bg-white p-2"><summary>Assessment settings</summary><AssessmentSettings lessonId={lessonId} /></details>}
        {!isAdmin && !isEditMode && !classroomId && <p className="text-sm text-muted-foreground">Open a classroom to create a lesson for its topics. <Link to="/teacher/classrooms" className="underline">Choose classroom</Link></p>}
        <span className="text-slate-500">/</span>
        <span className="font-bold text-slate-700 truncate max-w-xs">
          {title || 'New Laboratory'}
        </span>

        {isAdmin && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Master Content
          </span>
        )}
          
        <div className='ml-auto items-center flex max-w-xs'>
          <Button variant='ghost'>
            <Sun size={20}/>Light Mode
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Laboratory'}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden px-3 gap-1.5 mb-4">
        <aside className={`${panelOpen ? `w-1/3 min-w-70` : `w-10`} max-w-sm shrink-0 h-full overflow-hidden`}>
          <div className="flex flex-col h-full bg-white border border-border overflow-hidden rounded">
            <div className={`shrink-0 flex justify-between py-1 ${panelOpen ? ` bg-slate-200` : ``}`}>
              {panelOpen && (
                <div className="flex items-center gap-2 mb-1 px-4">
                  <FlaskConical size={16} className="" />
                  <span className="font-bold tracking-wider">Laboratory Builder</span>
                </div>
              )}
              <button onClick={() => {setPanelOpen(!panelOpen)}} className={`p-2 rounded hover:bg-slate-300 transition-colors! ${panelOpen ? 'mr-2' : 'mx-auto'}`}>
                {panelOpen ? <ChevronLeft size={15}/> : <ChevronRight size={15}/>}
              </button>
            </div>
            
            {panelOpen && (
            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-border">
                <button
                  onClick={() => setMetaOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors!"
                >
                  <span className="flex items-center gap-1.5"><ListOrdered size={13} /> Laboratory Info</span>
                  {metaOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {loadingLab && <p className="text-sm text-muted-foreground">Loading laboratory...</p>}
                {metaOpen && (
                <div className="px-4 pb-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Laboratory Title <span className='text-red-600 text-sm'>*</span></label>
                    <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Build a profile card" 
                      className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Topic <span className='text-red-600 text-sm'>*</span></label>
                    <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                    >
                      <option value="">{loadingTopics ? 'Loading topics...' : 'Select a topic'}</option>
                      {courseTopics.map((group) => (
                        <optgroup key={group.course} label={group.course}>
                          {group.topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>{topic.title}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Base XP <span className='text-red-600 text-sm'>*</span></label>
                    <input
                      type="number" min={1} step={1}
                      value={baseXp}
                      onChange={(e) => setBaseXp(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                    />
                  </div>
                </div>
                )}
              </div>
              <div className="px-4 py-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase">
                  Activity Content
                </h3>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Instruction <span className='text-red-600 text-sm'>*</span></label>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Explain what the final webpage should do or look like." 
                    className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white resize-none leading-relaxed"
                  />
                </div>
                <div className="rounded-xl border p-4 space-y-4">
                  <Label className="flex items-center gap-2 font-medium">
                    <Camera className="size-4" />
                    Reference Image
                  </Label>

                  <label
                    htmlFor="reference-image"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-2 text-center transition hover:border-primary hover:bg-muted/50"
                  >
                    {referenceImageUrl ? (
                      <img
                        src={referenceImageUrl}
                        alt="Reference Preview"
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <Camera className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload Reference Image</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP
                        </p>
                      </>
                    )}

                    <Input id="reference-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                  </label>
                </div>
                <p className="text-xs text-slate-500">Capture saves all project files together. Review checks for the selected file below.</p>
                <CaptureValidationPanel
                  key={activeFile?.filename}
                  filename={activeFile?.filename || ''}
                  initialCaptured={!!initialFiles && files.every(file => initialFiles.some(initial => initial.filename === file.filename))}
                  expected={expectedByFile[activeFile?.filename]}
                  onCaptureInitial={captureStarting}
                  onLoadInitial={() => loadSnapshot(false)}
                  onCaptureExpected={captureExpected}
                  onLoadExpected={() => loadSnapshot(true)}
                  onTestsChange={tests => applyTests(activeFile.filename, tests)}
                  draft={testDrafts[activeFile?.filename]}
                  onDraftChange={text => setTestDrafts(previous => ({ ...previous, [activeFile.filename]: text }))}
                  pickerHtml={codeGeneratorService.combineFilesForPreview(files.map(file => ({ filename: file.filename, generatedCode: expectedByFile[file.filename]?.code ?? '' })), files.find(file => file.id === previewFileId)?.filename)}
                />
                <div className="space-y-2 rounded-xl border p-3">
                  <RubricEditor rubric={rubric} setRubric={setRubric} passing={passingScore} setPassing={setPassingScore} />
                  {!Object.keys(expectedByFile).length && <details><summary className="cursor-pointer text-xs">Advanced settings · existing checks</summary>
                    <label className="flex flex-col gap-1 text-xs">HTML selector<input className="mt-1 w-full rounded border px-2 py-1" value={requiredSelector} onChange={event => setRequiredSelector(event.target.value)} /></label>
                    <label className="flex flex-col gap-1 text-xs">Required text<input className="mt-1 w-full rounded border px-2 py-1" value={requiredText} onChange={event => setRequiredText(event.target.value)} /></label>
                    <label className="flex flex-col gap-1 text-xs">Required code<input className="mt-1 w-full rounded border px-2 py-1" value={requiredCode} onChange={event => setRequiredCode(event.target.value)} /></label>
                  </details>}
                </div>
              </div>
            </div>
            )}
          </div>
        </aside>
        <main className="flex flex-1 overflow-hidden gap-1.5">
          <section className="flex flex-col flex-1 bg-white border border-border rounded">
            <FileTabs files={files} activeFile={activeFileId} isLocal onFileChange={handleFileChange} onFileCreate={handleCreateFile} onFileDelete={handleDeleteFile} />
            <WorkspaceTools workspace={workspace} />
            <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1 relative" />
          </section>
          <section className="w-1/3 overflow-hidden">
            <PreviewPane
              storageScope={`laboratory-author:${id || 'draft'}`}
            generatedCode={generatedCode}
              currentFileCode={filesWithCode.find((file) => file.id === activeFileId)?.generatedCode || ""}
              currentFileName={activeFile?.filename || ""}
              previewFileName={files.find((file) => file.id === previewFileId)?.filename || ""}
              htmlFiles={htmlFiles}
              onRunCode={() => {
                if (!workspace.getWorkspace() || !activeFile) return;
                const code = codeGeneratorService.generateCode(workspace.getWorkspace(), activeFile.filename);
                setFilesWithCode((prev) => prev.map((file) => file.id === activeFileId ? { ...file, generatedCode: code } : file));
              }}
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

export default LaboratoryBuilderPage;
