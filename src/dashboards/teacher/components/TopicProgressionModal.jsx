import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import ClassroomTopicFlow from '../../../components/classroom/ClassroomTopicFlow'

export default function TopicProgressionModal({ classroomId, topic, topics, courses, onClose, onSaved }) {
  return <Dialog open onOpenChange={open => { if (!open) onClose() }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
      <DialogHeader><DialogTitle>Configure progression · {topic.title}</DialogTitle><DialogDescription>Set core requirements and optional practice tracks. Changes save immediately. Draft lessons count after publication.</DialogDescription></DialogHeader>
      <ClassroomTopicFlow classroomId={classroomId} teacher topicId={topic.id} curriculum={topics} courses={courses} onCurriculumChange={onSaved} />
    </DialogContent>
  </Dialog>
}
