import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ClassroomCurriculum from '../../../components/classroom/ClassroomCurriculum'
import { getClassroomCourses, getClassroomTopics } from '../../../services/curriculumService'
import { getClassroomTopicFlow } from '../../../services/classroomFlowService'

export default function StudentClassroomActivities({ classroomId }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const [courses, topics, flow] = await Promise.all([
          getClassroomCourses(classroomId), getClassroomTopics(classroomId), getClassroomTopicFlow(classroomId),
        ])
        if (active) { setData({ classroomId, courses, topics, flow }); setError('') }
      } catch (cause) { if (active) setError(cause.message || 'Could not load classroom activities.') }
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh) }
  }, [classroomId])
  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
  if (data?.classroomId !== classroomId) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" aria-label="Loading classroom activities" /></div>
  return <section className="space-y-4"><h2 className="text-xl font-semibold">Curriculum</h2><ClassroomCurriculum classroomId={classroomId} {...data} /></section>
}
