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
import { Calendar, FileText, Film } from "lucide-react";
import { useLectureEditor } from "@/hooks/useLectureEditor";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router";

const LecturePage = () => {
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
  } = useLectureEditor(editLessonId);

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
    setSelectedTopicId(lecture.topicId);
    setContent(lecture.content);
    setAttachments(lecture.attachments);
  }, [lecture]);

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

  const handleSaveLecture = async () => {
    const lesson = await saveLecture({ title, topicId: selectedTopicId, content, attachments });
    if (!lesson) return;

    setShowSubmittedDialog(true);
    if (!isEditMode) {
      setTitle("");
      setContent("");
      setSelectedTopicId("");
      setAttachments({ file: null, video: null });
    }
  };

  const handleDeleteLecture = async () => {
    const ok = await removeLecture();
    if (ok) setShowDeleteDialog(false);
    // navigate away here if desired, e.g. navigate("/teacher/content")
  };

  return(
    <div className="h-[93vh] w-full bg-slate-50 relative overflow-hidden flex">
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

      <div className="z-10 p-8 h-full w-full overflow-y-auto">
        <AppBreadcrumb
          items={[
            { label: 'Home', href: '/teacher' },
            { label: 'Content Management', href: '/teacher/content' },
            { label: isEditMode ? 'Edit Lecture' : 'Create Lecture', href: '/teacher/lecture/create' },
          ]}
        />
        <Card className="w-full max-w-5xl mx-auto mt-6 bg-white/60!">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">{isEditMode ? "Edit Lecture" : "Create New Lecture"}</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Design engaging lectures for your students. Add multimedia content such as plain texts, images, videos, and pdf files to create an interactive learning experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lectureLoading && <p className="text-sm text-muted-foreground">Loading lecture...</p>}
            <div>
              <Label htmlFor="title" className="mb-2 text-lg font-bold text-slate-800">Title:<span className="text-red-500">*</span> </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="bg-background/60 rounded-lg! border-slate-300 shadow text-xl!"
                placeholder="Enter lecture title"
              />
            </div>
            <div>
              <Label htmlFor="topic" className="mb-2 text-lg font-bold text-slate-800">Topic:<span className="text-red-500">*</span></Label>
              <Combobox>
                <ComboboxInput placeholder="Select topics..." className="w-full bg-background/60 rounded-lg border border-slate-300 shadow" />
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
                <p className="mt-2 text-xs text-slate-600">
                  Selected topic: <span className="font-semibold">{selectedTopic.title}</span>
                </p>
              )}
            </div>
            <div>
              <Label className="mb-2 text-lg font-bold text-slate-800">Content:</Label>
              <SimpleEditor value={content} onChange={setContent} placeholder="Write lecture content..." />
            </div>
            <div className="bg-background backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5 space-y-3">
              <div className="md:flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Attachments <span className="text-muted-foreground/60 text-sm">(Optional)</span>
                  </h2>
                  <p className="text-sm text-slate-500 mb-4 font-medium">
                    Add PDFs, PowerPoint files, or external links.
                  </p>
                </div>
                <AddAttachmentModal onSave={setAttachments} />
              </div>
              {(attachments.file || attachments.video) && (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current attachments</p>
                  {attachments.file && (
                    <div className="text-sm text-blue-700 border rounded-sm px-2 border-blue-400 flex gap-2 items-center ">
                      <span className="font-semibold"><FileText/></span>{" "}
                      {attachments.file.type === "file" ? attachments.file.name : attachments.file.value}
                    </div>
                  )}
                  {attachments.video && (
                    <p className="text-sm text-blue-700 border rounded-sm px-2 border-blue-400 flex gap-2 items-center ">
                      <span className="font-semibold"><Film/></span> {attachments.video}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="self-end gap-2">
            <Button variant="primary" onClick={() => setShowPreviewDialog(true)}>Preview</Button>
            <Button variant="secondary" onClick={handleSaveLecture} disabled={saving}>
              {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Lecture" : "Save Lecture")}
            </Button>
          </CardFooter>
        </Card>

        <Dialog open={showSubmittedDialog} onOpenChange={setShowSubmittedDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Lesson submitted for approval</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Your lecture has been {isEditMode ? "updated" : "created"} and sent to an administrator for review. It will remain unpublished
              until it is approved.
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

              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Preview mode</span>
              </div>

              {attachments.video && (
                <div className="w-full aspect-video border-2 p-2 border-slate-200 rounded-2xl shadow bg-white">
                  <iframe className="w-full h-full rounded-2xl" src={attachments.video} title={title || "Lecture preview"} frameBorder="0" allowFullScreen />
                </div>
              )}

              {content && (
                <div className="rounded-2xl p-8 bg-white shadow my-2 border border-slate-200">
                  <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}

              {previewFileUrl && (
                <details className="rounded-2xl bg-white shadow border border-slate-200">
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