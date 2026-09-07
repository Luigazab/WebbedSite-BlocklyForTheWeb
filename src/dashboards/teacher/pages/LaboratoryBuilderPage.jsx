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
import { Link, useNavigate, useParams } from "react-router";
import BackButton from "#components/common/BackButton";
import SwitchButton from "#components/editor/SwitchButton";

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

const LaboratoryBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((state) => state.addToast);
  const isEditMode = Boolean(id);
  const [lessonId, setLessonId] = useState(id || null);
  const [title, setTitle] = useState("");
  const [baseXp, setBaseXp] = useState("50");
  const [description, setDescription] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [courseTopics, setCourseTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingLab, setLoadingLab] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [expectedBlocks, setExpectedBlocks] = useState(null);
  const [files, setFiles] = useState([makeFile()]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [filesWithCode, setFilesWithCode] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewFileId, setPreviewFileId] = useState(null);
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState();
  const [activeTab, setActiveTab] = useState("initial");
  const [panelOpen, setPanelOpen] = useState(true);
  const [metaOpen, setMetaOpen] = useState(true);
  const isLoadingRef = useRef(false);

  const workspace = BlocklyWorkspace({
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
        setCourseTopics(await fetchTopicGroupsForAuthoring());
      } catch (error) {
        addToast(error.message || "Failed to load topics.", "error");
      } finally {
        setLoadingTopics(false);
      }
    })();
  }, [addToast]);

  useEffect(() => {
    if (!isEditMode) return;
    ;(async () => {
      setLoadingLab(true);
      try {
        const data = await fetchLaboratoryEditorData(id);
        const lab = parseLabInstruction(data.laboratory?.instruction);
        const loadedFiles = lab.files?.length ? lab.files.map((file) => ({
          id: uid(),
          filename: file.filename,
          blocks_json: file.blocks_json ?? null,
        })) : [makeFile()];
        setLessonId(data.id);
        setTitle(data.title || "");
        setBaseXp((data.base_xp ?? 50).toString());
        setSelectedTopicId(data.topics_id || "");
        setDescription(lab.description || "");
        setReferenceImageUrl(lab.referenceImageUrl || "");
        setExpectedBlocks(lab.expectedBlocks || null);
        setFiles(loadedFiles);
        setActiveFileId(loadedFiles[0]?.id ?? null);
        setPreviewFileId(loadedFiles.find((file) => file.filename.endsWith(".html"))?.id ?? loadedFiles[0]?.id ?? null);
        setFilesWithCode(loadedFiles.map((file) => ({ id: file.id, filename: file.filename, generatedCode: "" })));
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
    const remaining = files.filter((file) => file.id !== fileId);
    setFiles(remaining);
    setFilesWithCode((prev) => prev.filter((file) => file.id !== fileId));
    if (activeFileId === fileId) handleFileChange(remaining[0].id);
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
    if (!selectedTopicId) return addToast("Select a topic for this laboratory.", "error");
    if (!expectedBlocks) return addToast("Capture the final expected workspace before saving.", "error");

    setSaving(true);
    try {
      const latestFiles = flushActiveFile();
      const lesson = lessonId
        ? await updateLessonBase({ lessonId, topicId: selectedTopicId, title, baseXp: Number(baseXp) })
        : await createLessonBase({ topicId: selectedTopicId, authorId: user.id, title, type: "laboratory", baseXp: Number(baseXp) });
      setLessonId(lesson.id);
      await upsertLaboratoryContent({
        lessonId: lesson.id,
        instruction: JSON.stringify({
          description,
          referenceImageUrl,
          expectedBlocks,
          files: latestFiles.map(({ filename, blocks_json }) => ({ filename, blocks_json })),
        }),
      });
      addToast(isEditMode ? "Laboratory updated successfully." : "Laboratory saved successfully.", "success");
      if (!isEditMode) navigate(`/teacher/laboratory/edit/${lesson.id}`, { replace: true });
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
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 ">
        <Link to="/"><img src="/icon.png" alt="icon image" className='w-8 h-8' /></Link>
        <BackButton />
        <span className="text-slate-500">/</span>
        <span className="font-bold text-slate-700 truncate max-w-xs">
          {title || 'New Laboratory'}
        </span>
          
        <div className='ml-auto flex truncate max-w-xs'>
          <Button variant='ghost'>
            <Sun size={20}/>Light Mode
          </Button>
          <Button variant='secondary'>
            Save Laboratory
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
                <div className="rounded-xl border p-3 space-y-3">
                  <Label className="flex items-center gap-2"><Camera className="size-4" /> Reference Image</Label>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  {referenceImageUrl && <img src={referenceImageUrl} alt="Expected result" className="w-full rounded-lg border object-contain" />}
                </div>
                <Button type="button" variant={expectedBlocks ? "secondary" : "primary"} className="w-full" onClick={() => {
                  setExpectedBlocks(workspace.getWorkspaceState?.());
                  addToast("Final validator captured.", "success");
                }}>
                  <Check /> {expectedBlocks ? "Validator Captured" : "Capture Final Validator"}
                </Button>
              </div>
            </div>
            )}
          </div>
        </aside>
        <main className="flex flex-1 overflow-hidden gap-1.5">
          <section className="flex flex-col flex-1 bg-white border border-border rounded">
            <FileTabs files={files} activeFile={activeFileId} isLocal onFileChange={handleFileChange} onFileCreate={handleCreateFile} onFileDelete={handleDeleteFile} />
            <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1 relative">
              <SwitchButton activeTab={activeTab} setActiveTab={setActiveTab}/>
            </div>
          </section>
          <section className="w-1/3 overflow-hidden">
            <PreviewPane
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
