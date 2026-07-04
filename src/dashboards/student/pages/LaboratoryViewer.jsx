import BlocklyWorkspace from "@/components/editor/BlocklyWorkspace";
import FileTabs from "@/components/editor/FileTabs";
import PreviewPane from "@/components/editor/PreviewPane";
import { defineFileReferenceBlocks } from "@/blockly/fileReferenceBlocks";
import { codeGeneratorService } from "@/services/codeGenerator.service";
import { useUIStore } from "@/store/uiStore";
import { ArrowLeft, CheckCircle2, FlaskConical, Image, XCircle } from "lucide-react";
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

const sameWorkspace = (left, right) => JSON.stringify(left ?? {}) === JSON.stringify(right ?? {});

const LaboratoryViewer = ({ lesson, onNext, onPrevious, navigation }) => {
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  const lab = parseLabInstruction(lesson?.laboratory?.instruction);
  const starterFiles = lab.files?.length
    ? lab.files.map((file) => ({ id: uid(), filename: file.filename, blocks_json: file.blocks_json ?? null }))
    : [{ id: uid(), filename: "index.html", blocks_json: null }];
  const [files, setFiles] = useState(starterFiles);
  const [activeFileId, setActiveFileId] = useState(starterFiles[0]?.id ?? null);
  const [previewFileId, setPreviewFileId] = useState(starterFiles.find((file) => file.filename.endsWith(".html"))?.id ?? starterFiles[0]?.id ?? null);
  const [filesWithCode, setFilesWithCode] = useState(starterFiles.map((file) => ({ id: file.id, filename: file.filename, generatedCode: "" })));
  const [generatedCode, setGeneratedCode] = useState("");
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [validationState, setValidationState] = useState("idle");
  const isLoadingRef = useRef(false);

  const workspace = BlocklyWorkspace({
    onWorkspaceChange: (wsRef) => {
      if (isLoadingRef.current) return;
      const file = files.find((item) => item.id === activeFileId);
      if (!file) return;
      const code = codeGeneratorService.generateCode(wsRef, file.filename);
      setFilesWithCode((prev) => prev.map((item) => item.id === file.id ? { ...item, generatedCode: code } : item));
    },
    onWorkspaceLoad: () => defineFileReferenceBlocks(files),
  });

  useEffect(() => {
    if (!workspace.isInitialized) return;
    isLoadingRef.current = true;
    starterFiles[0]?.blocks_json ? workspace.loadWorkspaceState(starterFiles[0].blocks_json) : workspace.clearWorkspace();
    setTimeout(() => { isLoadingRef.current = false; }, 150);
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

  const checkWork = () => {
    const current = workspace.getWorkspaceState?.();
    if (!lab.expectedBlocks) {
      addToast("No validator was saved for this laboratory yet.", "error");
      return;
    }
    const passed = sameWorkspace(current, lab.expectedBlocks);
    setValidationState(passed ? "passed" : "failed");
    addToast(passed ? "Laboratory complete!" : "Not quite yet. Compare your blocks with the goal.", passed ? "success" : "error");
  };

  const activeFile = files.find((file) => file.id === activeFileId);
  const htmlFiles = files.filter((file) => file.filename.endsWith(".html"));

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 border-b bg-white px-4 py-2.5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back
        </button>
        <span className="text-slate-300">|</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-800">{lesson?.title || "Laboratory"}</p>
          <p className="truncate text-xs text-slate-400">{lesson?.topic?.title}</p>
        </div>
        <button onClick={checkWork} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-400">
          Check Work
        </button>
        <button onClick={() => onNext?.(navigation?.next ? "next" : "topic")} className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
          Continue
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r bg-white p-4 space-y-4">
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <FlaskConical className="size-4 text-emerald-500" /> Challenge
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{lab.description || "Complete the laboratory activity."}</p>
          </div>
          {lab.referenceImageUrl && (
            <div className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Image className="size-4 text-blue-500" /> Expected Result
              </div>
              <img src={lab.referenceImageUrl} alt="Expected laboratory result" className="w-full rounded-lg border object-contain" />
            </div>
          )}
          {validationState !== "idle" && (
            <div className={`rounded-xl border p-4 text-sm font-semibold ${validationState === "passed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {validationState === "passed" ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Your blocks match the validator.</span>
              ) : (
                <span className="flex items-center gap-2"><XCircle className="size-4" /> Keep working, then check again.</span>
              )}
            </div>
          )}
        </aside>

        <main className="flex flex-1 overflow-hidden">
          <section className="flex flex-col flex-1 bg-white border-r">
            <FileTabs files={files} activeFile={activeFileId} isLocal={false} onFileChange={handleFileChange} onFileCreate={() => {}} onFileDelete={() => {}} />
            <div ref={workspace.blocklyDiv} className="blocklyDiv flex-1" />
          </section>
          <section className="w-[28rem] overflow-hidden">
            <PreviewPane
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
