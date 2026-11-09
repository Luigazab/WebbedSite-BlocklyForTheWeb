import { AppBreadcrumb } from "#components/common/breadcrumb";
import AddAttachmentModal from "#components/content/AddAttachmentModal";
import { SimpleEditor } from "#components/tiptap-templates/simple/simple-editor";
import { Button } from "#components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#components/ui/card";
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from "#components/ui/combobox";
import { Input } from "#components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "#components/ui/item";
import { Label } from "#components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#components/ui/dialog";
import { Calendar, FileText, Film, Sun } from "lucide-react";
import { useLectureEditor } from "@/hooks/useLectureEditor";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import BackButton from "#components/common/BackButton";
import ThemeSelect from "#components/common/ThemeSelect";

const LecturePage = ({ context = "teacher" }) => {
  const isAdmin = context === "admin";
  const params = useParams();
  const location = useLocation();
  const editLessonId = location.state?.lessonId ?? params.id;

  const {
    isEditMode,
    topics: courseTopics,
    topicsLoading,
    lecture,
    lectureLoading,
    saving,
    deleting,
    saveLecture,
    removeLecture,
  } = useLectureEditor(editLessonId, { isAdmin, classroomId: new URLSearchParams(location.search).get("classroomId") });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [attachments, setAttachments] = useState({ file: null, video: null });
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync local form state whenever the loaded lecture changes (edit mode load, or reset on create)
  useEffect(() => {
    setTitle(lecture.title);
    setSelectedTopicId(lecture.topicId || (!isEditMode ? new URLSearchParams(location.search).get("topicId") : "") || "");
    setContent(lecture.content);
    setAttachments(lecture.attachments);
  }, [lecture.title, lecture.topicId, lecture.content, lecture.attachments]);

  const selectedTopic = useMemo(
    () => courseTopics.flatMap((group) => group.topics).find((topic) => topic.id === selectedTopicId),
    [courseTopics, selectedTopicId]
  );

  const previewFileUrl =
    attachments.file?.type === "link"
      ? attachments.file.value
      : attachments.file?.type === "file" && attachments.file.value instanceof File
      ? URL.createObjectURL(attachments.file.value)
      : null;

  const handleSaveLecture = async (publish = false) => {
    const lesson = await saveLecture({ title, topicId: selectedTopicId, content, attachments, publish });
    if (!lesson) return;

    setShowSubmittedDialog(true);

  };

  const handleDeleteLecture = async () => {
    const ok = await removeLecture();
    if (ok) setShowDeleteDialog(false);
    // navigate away here if desired, e.g. navigate("/teacher/content")
  };

  return(
    <div className="h-screen w-full bg-muted relative overflow-hidden flex">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="z-10 h-full w-full overflow-y-auto">
        <div className="top-0 sticky shrink-0 flex items-center gap-3 px-4 py-2.5 z-10 backdrop-blur-md">
          <Link to="/"><img src="/icon.png" alt="icon image" className='w-8 h-8' /></Link>
          <BackButton />
          {!isAdmin && !isEditMode && !new URLSearchParams(location.search).get("classroomId") && <p className="text-sm text-muted-foreground">Open a classroom to create a lesson for its topics. <Link to="/teacher/classrooms" className="underline">Choose classroom</Link></p>}
          <span className="text-muted-foreground">/</span>
          <span className="font-bold text-foreground truncate max-w-xs">
            {title || 'New Lecture'}
          </span>
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{lecture.isPublished ? "Published" : "Draft"}</span>
          {isAdmin && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
              Master Content
            </span>
          )}
          <div className='ml-auto justify-center items-center flex gap-1.5'>
            <ThemeSelect compact iconOnly/>
            <Button variant="primaryOutline" onClick={() => setShowPreviewDialog(true)}>Preview</Button>
            <Button variant="primary" onClick={() => handleSaveLecture(false)} disabled={saving}>
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button variant="primary" onClick={() => handleSaveLecture(true)} disabled={saving}>Publish</Button>
          </div>
        </div>
        <Card className="w-full max-w-5xl mx-auto mt-6 bg-card/60! backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">{isEditMode ? "Edit Lecture" : "Create New Lecture"}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Design engaging lectures for your students. Add multimedia content such as plain texts, images, videos, and pdf files to create an interactive learning experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lectureLoading && <p className="text-sm text-muted-foreground">Loading lecture...</p>}
            <div>
              <Label htmlFor="title" className="mb-2 text-lg font-bold text-foreground">Title:<span className="text-red-500">*</span> </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="bg-background/60 rounded-lg! border-border shadow text-xl!"
                placeholder="Enter lecture title"
              />
            </div>
            <div>
              <Label htmlFor="topic" className="mb-2 text-lg font-bold text-foreground">Topic:<span className="text-red-500">*</span></Label>
              <Combobox>
                <ComboboxInput placeholder="Select topics..." className="w-full bg-background/60 rounded-lg border border-border shadow" />
                <ComboboxContent>
                  <ComboboxList>
                    {topicsLoading && <ComboboxLabel>Loading topics...</ComboboxLabel>}
                    {!topicsLoading && courseTopics.map((courseGroup) => (
                      <ComboboxGroup key={courseGroup.course}>
                        <ComboboxLabel>{courseGroup.course}</ComboboxLabel>
                        {courseGroup.topics.map((topic) => (
                          <ComboboxItem
                            key={topic.id}
                            value={topic.title}
                            onClick={() => setSelectedTopicId(topic.id)}
                            className="flex flex-col items-start gap-1"
                          >
                            <Item size="xs" className="p-0">
                              <ItemContent>
                                <ItemTitle className="whitespace-nowrap">{topic.title}</ItemTitle>
                                <ItemDescription>{topic.description}</ItemDescription>
                              </ItemContent>
                            </Item>
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedTopic && (
                <p className="mt-2 text-xs text-foreground">
                  Selected topic: <span className="font-semibold">{selectedTopic.title}</span>
                </p>
              )}
            </div>
            <div>
              <Label className="mb-2 text-lg font-bold text-foreground">Content:</Label>
              <SimpleEditor value={content} onChange={setContent} placeholder="Write lecture content..." />
            </div>
            <div className="bg-background backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5 space-y-3">
              <div className="md:flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    Attachments <span className="text-muted-foreground/60 text-sm">(Optional)</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    Add PDFs, PowerPoint files, or external links.
                  </p>
                </div>
                <AddAttachmentModal onSave={setAttachments} />
              </div>
              {(attachments.file || attachments.video) && (
                <div className="space-y-2 rounded-xl border border-border bg-muted p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current attachments</p>
                  {attachments.file && (
                    <div className="text-sm text-blue-700 dark:text-blue-300 border rounded-sm px-2 border-blue-400 flex gap-2 items-center ">
                      <span className="font-semibold"><FileText/></span>{" "}
                      {attachments.file.type === "file" ? attachments.file.name : attachments.file.value}
                    </div>
                  )}
                  {attachments.video && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 border rounded-sm px-2 border-blue-400 flex gap-2 items-center ">
                      <span className="font-semibold"><Film/></span> {attachments.video}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="self-end gap-2">
            <Button variant="primaryOutline" onClick={() => setShowPreviewDialog(true)}>Preview</Button>
            <Button variant="primary" onClick={() => handleSaveLecture(false)} disabled={saving}>
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button variant="primary" onClick={() => handleSaveLecture(true)} disabled={saving}>Publish</Button>
          </CardFooter>
        </Card>

        <Dialog open={showSubmittedDialog} onOpenChange={setShowSubmittedDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Lesson saved</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-foreground">
              {lecture.isPublished ? "Your lesson is published and available to students when its topic is open." : "Your draft is saved and hidden from students."}
            </p>
            <DialogFooter>
              <Button variant="primary" onClick={() => setShowSubmittedDialog(false)}>
                Okay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lecture Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-w-2xl w-full mx-auto py-2">
              <h1 className="text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4">
                {title || "Untitled Lecture"}
              </h1>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Preview mode</span>
              </div>

              {attachments.video && (
                <div className="w-full aspect-video border-2 p-2 border-border rounded-2xl shadow bg-card">
                  <iframe className="w-full h-full rounded-2xl" src={attachments.video} title={title || "Lecture preview"} frameBorder="0" allowFullScreen />
                </div>
              )}

              {content && (
                <div className="rounded-2xl p-8 bg-card shadow my-2 border border-border">
                  <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}

              {previewFileUrl && (
                <details className="rounded-2xl bg-card shadow border border-border">
                  <summary className="cursor-pointer font-semibold px-4 py-3">View Attached File</summary>
                  <div className="mt-2 w-full aspect-4/3 rounded-2xl shadow">
                    <iframe src={previewFileUrl} className="w-full h-full rounded-2xl" frameBorder="0" />
                  </div>
                </details>
              )}
            </div>
            <DialogFooter>
              <Button variant="primary" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default LecturePage;