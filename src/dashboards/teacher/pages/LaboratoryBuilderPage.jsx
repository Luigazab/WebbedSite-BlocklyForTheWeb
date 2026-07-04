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
import { Camera, Check, FlaskConical, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

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
  const [selectedDevice, setSelectedDevice] = useState("desktop");
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
    if (!selectedTopicId) return addToast("Select a topic for this laboratory.", "error");
    if (!expectedBlocks) return addToast("Capture the final expected workspace before saving.", "error");

    setSaving(true);
    try {
      const latestFiles = flushActiveFile();
      const lesson = lessonId
        ? await updateLessonBase({ lessonId, topicId: selectedTopicId, title })
        : await createLessonBase({ topicId: selectedTopicId, authorId: user.id, title, type: "laboratory" });
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
    <div className="h-screen bg-slate-100 overflow-hidden flex flex-col">
      <div className="shrink-0 bg-white border-b px-4 py-3">
        <AppBreadcrumb items={[
          { label: "Home", href: "/teacher" },
          { label: "Content Management", href: "/teacher/content" },
          { label: isEditMode ? "Edit Laboratory" : "Create Laboratory", href: "/teacher/laboratory/create" },
        ]} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-96 shrink-0 overflow-y-auto border-r bg-white p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FlaskConical className="size-5" /> Laboratory Builder</CardTitle>
              <CardDescription>Build one challenge, one final validator, and a reference result image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingLab && <p className="text-sm text-muted-foreground">Loading laboratory...</p>}
              <div>
                <Label>Title *</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Build a profile card" />
              </div>
              <div>
                <Label>Topic *</Label>
                <select value={selectedTopicId} onChange={(event) => setSelectedTopicId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">{loadingTopics ? "Loading topics..." : "Select a topic"}</option>
                  {courseTopics.map((group) => (
                    <optgroup key={group.course} label={group.course}>
                      {group.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
                    </optgroup>
                  ))}
                </select>
                {selectedTopic && <p className="mt-1 text-xs text-slate-500">Selected: {selectedTopic.title}</p>}
              </div>
              <div>
                <Label>Student Instructions</Label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Explain what the final webpage should do or look like." />
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
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="ghost" onClick={() => navigate("/teacher/content")}>Back</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}><Save /> {saving ? "Saving..." : "Save Lab"}</Button>
            </CardFooter>
          </Card>
        </aside>
        <main className="flex flex-1 overflow-hidden">
          <section className="flex flex-col flex-1 bg-white border-r">
            <FileTabs files={files} activeFile={activeFileId} isLocal onFileChange={handleFileChange} onFileCreate={handleCreateFile} onFileDelete={handleDeleteFile} />
            <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
          </section>
          <section className="w-96 overflow-hidden">
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
