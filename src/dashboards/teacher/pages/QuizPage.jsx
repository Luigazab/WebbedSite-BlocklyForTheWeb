import { AppBreadcrumb } from "#components/common/breadcrumb";
import { Button } from "#components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#components/ui/card";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Textarea } from "#components/ui/textarea";
import { cn } from "#lib/utils";
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from "#components/ui/combobox";
import { Item, ItemContent, ItemDescription, ItemTitle } from "#components/ui/item";
import { Badge } from "#components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "#components/ui/dialog";
import { Check, GripVertical, Plus, Sun, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useQuizEditor } from "#hooks/useQuizEditor";
import BackButton from "#components/common/BackButton";

const QUESTION_MIN_OPTIONS = 2;
const QUESTION_DEFAULT_OPTIONS = 4;

const createOption = () => ({
  id: crypto.randomUUID(),
  text: "",
  isCorrect: false,
});

const createQuestion = () => ({
  id: crypto.randomUUID(),
  text: "",
  options: Array.from({ length: QUESTION_DEFAULT_OPTIONS }, createOption),
});

const normalizeOptions = (options = []) => {
  const mapped = options.map((option) => ({
    id: crypto.randomUUID(),
    text: option.text ?? "",
    isCorrect: Boolean(option.is_correct),
  }));
  if (mapped.length >= QUESTION_DEFAULT_OPTIONS) return mapped;
  return [...mapped, ...Array.from({ length: QUESTION_DEFAULT_OPTIONS - mapped.length }, createOption)];
};

const QuizPage = () => {
  const params = useParams();
  const location = useLocation();
  const editLessonId = location.state?.lessonId ?? params.id;

  const {
    isEditMode,
    topics: courseTopics,
    topicsLoading,
    quiz,
    quizLoading,
    saving,
    deleting,
    saveQuiz,
    removeQuiz,
  } = useQuizEditor(editLessonId);

  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [questions, setQuestions] = useState([createQuestion()]);
  const [draggingQuestionId, setDraggingQuestionId] = useState(null);
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const questionCount = questions.length;

  const selectedTopic = useMemo(
    () => courseTopics.flatMap((group) => group.topics).find((topic) => topic.id === selectedTopicId),
    [courseTopics, selectedTopicId]
  );

  const parsedPassingScore = Number(passingScore);
  const passingScoreError =
    passingScore !== "" && (!Number.isInteger(parsedPassingScore) || parsedPassingScore < 1 || parsedPassingScore > questionCount);
  
  useEffect(() => {
    setTitle(quiz.title);
    setSelectedTopicId(quiz.topicId);
    setTimeLimit(quiz.timeLimit);
    setPassingScore(quiz.passingScore);

    if (quiz.questions === null) return; // create-mode default, don't stomp on it
    const loaded = quiz.questions.map((q) => ({
      id: crypto.randomUUID(),
      text: q.text ?? "",
      options: normalizeOptions(q.options ?? []),
    }));
    setQuestions(loaded.length > 0 ? loaded : [createQuestion()]);
  }, [quiz]);

  const updateQuestion = (questionId, updater) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === questionId ? updater(question) : question))
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion()]);
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((question) => question.id !== questionId);
    });
  };

  const addOption = (questionId) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: [...question.options, createOption()],
    }));
  };

  const removeOption = (questionId, optionId) => {
    updateQuestion(questionId, (question) => {
      if (question.options.length <= QUESTION_MIN_OPTIONS) return question;
      return {
        ...question,
        options: question.options.filter((option) => option.id !== optionId),
      };
    });
  };

  const updateOptionText = (questionId, optionId, value) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: question.options.map((option) => (option.id === optionId ? { ...option, text: value } : option)),
    }));
  };

  const toggleOptionCorrect = (questionId, optionId) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, isCorrect: !option.isCorrect } : option
      ),
    }));
  };

  const reorderQuestions = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setQuestions((prev) => {
      const fromIndex = prev.findIndex((question) => question.id === fromId);
      const toIndex = prev.findIndex((question) => question.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handlePassingScoreChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      setPassingScore("");
      return;
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < 1) {
      setPassingScore("1");
      return;
    }

    setPassingScore(String(Math.min(numberValue, questionCount)));
  };

  const validateQuiz = () => {
    if (!title.trim()) return "Quiz title is required.";
    if (!selectedTopicId) return "Please select a topic.";
    if (questions.length === 0) return "Add at least one question.";
    if (passingScoreError) return "Passing score cannot be greater than question count.";
    for (const question of questions) {
      if (!question.text.trim()) return "Each question needs text.";
      if (question.options.length < QUESTION_MIN_OPTIONS) return "Each question needs at least 2 options.";
      if (question.options.some((option) => !option.text.trim())) return "All options must have text.";
      if (!question.options.some((option) => option.isCorrect)) return "Every question needs at least one correct option.";
    }
    return null;
  };

  const handleSaveQuiz = async () => {
    const lesson = await saveQuiz({
      title,
      topicId: selectedTopicId,
      timeLimit: timeLimit ? Number(timeLimit) : null,
      passingScore: passingScore ? Number(passingScore) : null,
      questions,
      validationError: validateQuiz(),
    });
    if (!lesson) return;

    setShowSubmittedDialog(true);
    if (!isEditMode) {
      setTitle("");
      setTimeLimit("");
      setPassingScore("");
      setQuestions([createQuestion()]);
      setSelectedTopicId("");
    }
  };
  const handleDeleteQuiz = async () => {
    const ok = await removeQuiz();
    if (ok) setShowDeleteDialog(false);
  };

  return (
    <div className="h-screen w-full bg-slate-50 relative overflow-hidden flex">
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

      <div className="z-10 h-full w-full overflow-y-auto relative">
        <div className="top-1 sticky shrink-0 flex items-center gap-3 px-4 py-2.5 ">
          <Link to="/"><img src="/icon.png" alt="icon image" className='w-8 h-8' /></Link>
          <BackButton />
          <span className="text-slate-500">/</span>
          <span className="font-bold text-slate-700 truncate max-w-xs">
            {title || 'New Quiz'}
          </span>
            
          <div className='ml-auto flex truncate gap-1.5'>
            <Button variant='ghost'>
              <Sun size={20}/>Light Mode
            </Button>
            <Button variant="primary" onClick={() => setShowPreviewDialog(true)}>Preview</Button>
            <Button variant="secondary" onClick={handleSaveQuiz} disabled={saving}>
              {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Quiz" : "Save Quiz")}
            </Button>
          </div>
        </div>

        <Card className="w-full max-w-5xl mx-auto mt-6 bg-white/60!">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">{isEditMode ? "Edit Quiz" : "Create New Quiz"}</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Build a quiz with flexible answer options and reorderable questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {quizLoading && <p className="text-sm text-muted-foreground">Loading quiz...</p>}
            <div>
              <Label htmlFor="quiz-title" className="mb-2 text-lg font-bold text-slate-800">
                Title:<span className="text-red-500">*</span>
              </Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="bg-background/60 rounded-lg! border-slate-300 shadow text-xl!"
                placeholder="Enter quiz title"
              />
            </div>

            <div className="space-y-3">
              <Label className="mb-2 text-lg font-bold text-slate-800">Topics:<span className="text-red-500">*</span></Label>
              <Combobox>
                <ComboboxInput placeholder="Select topics..."  className="w-full bg-background/60 rounded-lg border border-slate-300 shadow" />
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="time-limit" className="mb-2 text-lg font-bold text-slate-800">
                  Quiz time limit:<span className="text-muted-foreground/60 text-sm">(minutes)</span>
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(event) => setTimeLimit(event.target.value)}
                  className="bg-background/60 rounded-lg! border-slate-300 shadow"
                  placeholder="e.g. 30"
                />
              </div>

              <div>
                <Label htmlFor="passing-score" className="mb-2 text-lg font-bold text-slate-800">
                  Passing score:<span className="text-muted-foreground/60 text-sm"> out of {questionCount}</span>
                </Label>
                <Input
                  id="passing-score"
                  type="number"
                  min={1}
                  max={questionCount}
                  value={passingScore}
                  onChange={handlePassingScoreChange}
                  className={cn(
                    "bg-background/60 rounded-lg! border-slate-300 shadow",
                    passingScoreError && "border-red-500 focus-visible:border-red-500"
                  )}
                  placeholder="e.g. 8"
                />
                {passingScoreError && (
                  <p className="mt-1 text-xs text-red-500">Passing score cannot be higher than the number of questions.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-background p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Questions</h2>
                <Button type="button" onClick={addQuestion}>
                  <Plus />
                  Add Question
                </Button>
              </div>

              <p className="text-sm text-slate-500">Drag the handle on each question to reorder.</p>

              <div className="space-y-3">
                {questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={() => setDraggingQuestionId(question.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      reorderQuestions(draggingQuestionId, question.id);
                      setDraggingQuestionId(null);
                    }}
                    onDragEnd={() => setDraggingQuestionId(null)}
                    className={cn(
                      "rounded-2xl border border-slate-200 bg-white p-4 space-y-4",
                      draggingQuestionId === question.id && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button type="button" className="cursor-grab rounded-lg border bg-slate-50 p-2 text-slate-500 active:cursor-grabbing">
                          <GripVertical className="size-4" />
                        </button>
                        <p className="text-sm font-semibold text-slate-700">Question {questionIndex + 1}</p>
                      </div>
                      <Button
                        type="button"
                        variant="dangerOutline"
                        onClick={() => removeQuestion(question.id)}
                        disabled={questions.length === 1}
                      >
                        <Trash2 />
                        Remove
                      </Button>
                    </div>

                    <div>
                      <Label className="mb-2 text-sm font-semibold text-slate-700">Question text</Label>
                      <Textarea
                        value={question.text}
                        onChange={(event) =>
                          updateQuestion(question.id, (current) => ({ ...current, text: event.target.value }))
                        }
                        className="border border-slate-200 bg-slate-50"
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-slate-700">Options</Label>
                        <Button type="button" variant="secondaryOutline" onClick={() => addOption(question.id)}>
                          <Plus />
                          Add Option
                        </Button>
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <button
                            type="button"
                            onClick={() => toggleOptionCorrect(question.id, option.id)}
                            className={cn(
                              "size-8 shrink-0 rounded-lg border flex items-center justify-center transition-colors",
                              option.isCorrect ? "bg-green-500 border-green-600 text-white" : "bg-white border-slate-300 text-slate-400"
                            )}
                            aria-label={`Toggle correctness for option ${optionIndex + 1}`}
                          >
                            <Check className="size-4" />
                          </button>

                          <Input
                            value={option.text}
                            onChange={(event) => updateOptionText(question.id, option.id, event.target.value)}
                            className="border border-slate-200 bg-white"
                            placeholder={`Option ${optionIndex + 1}`}
                          />

                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeOption(question.id, option.id)}
                            disabled={question.options.length <= QUESTION_MIN_OPTIONS}
                            aria-label={`Remove option ${optionIndex + 1}`}
                          >
                            <X />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="self-end gap-2">
            {isEditMode && (
              <Button variant="dangerOutline" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 />
                Delete
              </Button>
            )}
            <Button variant="primary" onClick={() => setShowPreviewDialog(true)}>Preview</Button>
            <Button variant="secondary" onClick={handleSaveQuiz} disabled={saving}>
              {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Quiz" : "Save Quiz")}
            </Button>
          </CardFooter>
        </Card>
        <Dialog open={showSubmittedDialog} onOpenChange={setShowSubmittedDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Lesson submitted for approval</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Your quiz has been {isEditMode ? "updated" : "created"} and sent to an administrator for review. It will remain unpublished
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
              <DialogTitle>Quiz Preview</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-w-3xl w-full mx-auto py-2">
              <h1 className="text-center font-bold text-4xl font-sans! border-b border-slate-400 pb-4">
                {title || "Untitled Quiz"}
              </h1>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Questions: {questions.length}</Badge>
                {timeLimit && <Badge variant="outline">Time limit: {timeLimit} min</Badge>}
                {passingScore && <Badge variant="outline">Passing: {passingScore}/{questions.length}</Badge>}
              </div>

              <div className="space-y-4">
                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <p className="font-semibold text-slate-800">
                      {questionIndex + 1}. {question.text || "Untitled question"}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2">
                          <span className="text-sm font-semibold text-slate-500">{String.fromCharCode(65 + optionIndex)}.</span>
                          <p className="text-sm text-slate-700 flex-1">{option.text || "Empty option"}</p>
                          {option.isCorrect && <Badge variant="secondary">Correct</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete this quiz?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              This will permanently delete "{title || "Untitled Quiz"}" and all of its questions. This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="secondaryOutline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteQuiz} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Quiz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default QuizPage;