import { useId, useState } from "react";
import { Link as LinkIcon, Paperclip, Plus, Upload, Video, X } from "lucide-react";

import { Button } from "#components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#components/ui/dialog";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#components/ui/tabs";

const AddAttachmentModal = ({ onSave }) => {
  const fileInputId = useId();
  const [open, setOpen] = useState(false);
  const [fileTabAttachment, setFileTabAttachment] = useState(null);
  const [fileLinkDraft, setFileLinkDraft] = useState("");
  const [videoAttachment, setVideoAttachment] = useState("");
  const [videoDraft, setVideoDraft] = useState("");

  const handleFileSelect = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFileTabAttachment({
      type: "file",
      name: selected.name,
      value: selected,
    });
    setFileLinkDraft("");
    event.target.value = "";
  };

  const handleAttachFileLink = () => {
    const trimmed = fileLinkDraft.trim();
    if (!trimmed) return;

    setFileTabAttachment({
      type: "link",
      name: trimmed,
      value: trimmed,
    });
    setFileLinkDraft("");
  };

  const handleAttachVideoLink = () => {
    const trimmed = videoDraft.trim();
    if (!trimmed) return;

    setVideoAttachment(trimmed);
    setVideoDraft("");
  };

  const handleSave = () => {
    onSave?.({
      file: fileTabAttachment,
      video: videoAttachment || null,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Attachment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Attachments</DialogTitle>
          <DialogDescription>
            Add up to one file attachment and one video link for this lecture.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="gap-4">
          <TabsList>
            <TabsTrigger value="file">
              <Paperclip />
              File
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm text-slate-600">
                Upload a file or attach one external file link. Only one item is allowed in this tab.
              </p>

              {fileTabAttachment ? (
                <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {fileTabAttachment.type === "file" ? "Uploaded file" : "File link"}
                    </p>
                    <p className="truncate text-sm font-medium">{fileTabAttachment.name}</p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setFileTabAttachment(null)}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={fileInputId}>Upload file</Label>
                    <Input id={fileInputId} type="file" onChange={handleFileSelect} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-link">Paste file link</Label>
                    <div className="flex gap-2">
                      <Input
                        id="file-link"
                        value={fileLinkDraft}
                        onChange={(e) => setFileLinkDraft(e.target.value)}
                        placeholder="https://example.com/file.pdf"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAttachFileLink}
                        disabled={!fileLinkDraft.trim()}
                      >
                        <LinkIcon />
                        Attach
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm text-slate-600">
                Paste one video URL for this lecture (YouTube, Vimeo, or external host).
              </p>

              {videoAttachment ? (
                <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
                  <p className="truncate text-sm font-medium">{videoAttachment}</p>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setVideoAttachment("")}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="video-link">Video link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="video-link"
                      value={videoDraft}
                      onChange={(e) => setVideoDraft(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAttachVideoLink}
                      disabled={!videoDraft.trim()}
                    >
                      <Upload />
                      Attach
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondaryOutline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave}>
            Save Attachments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttachmentModal;
