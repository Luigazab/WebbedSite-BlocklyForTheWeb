import { useState } from 'react'
import { X, Loader2, GraduationCap, RefreshCw } from 'lucide-react'
import { Button } from '#components/ui/button'
import { formatDate } from '@/utils/dateFormat'
import { useCopyCode } from '@/utils/copyCode'
import CourseAssign from './CourseAssign'

export default function AssignCurriculumModal({
  classroom,
  courses,
  assignedCourses = [],
  onSubmit,
  onClose,
  loading,
  handleRegenerate,
}) {
  const [selectedCourses, setSelectedCourses] = useState(
    assignedCourses.map(course => course.id)
  )

  const [error, setError] = useState('')

  const { copied, copyCode } = useCopyCode()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedCourses.length === 0) {
      setError('Please assign at least one course.')
      return
    }

    setError('')

    await onSubmit({
      classroom_id: classroom.id,
      course_ids: selectedCourses,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-b-8 border-slate-400">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blockly-blue/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blockly-blue" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Assign Curriculum
              </h2>

              <p className="text-xs text-slate-400">
                Assign courses to this classroom
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors!"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Classroom information */}
        {classroom && (
          <div className="px-6 py-4 border-b border-slate-100 space-y-3">

            {/* Name */}
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Classroom name
              </p>

              <p className="text-sm font-semibold text-slate-700">
                {classroom.name}
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Description
              </p>

              <p className="text-sm text-slate-500">
                {classroom.description || 'No description'}
              </p>
            </div>

            {/* Code + Created */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Class code
                </p>

                <div className="flex items-center gap-1">
                  {copied ? (
                    <button
                      type="button"
                      onClick={() =>
                        copyCode(classroom.join_code || '')
                      }
                      className="rounded-md bg-green-500/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-green-500"
                    >
                      Code copied
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        copyCode(classroom.join_code || '')
                      }
                      className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-primary"
                    >
                      {classroom.join_code || 'N/A'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRegenerate}
                    title="Regenerate code"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blockly-blue hover:bg-blockly-blue/5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Created at
                </p>

                <p className="text-sm text-slate-400">
                  {formatDate(classroom.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Curriculum */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-5"
        >
          <CourseAssign
            courses={courses}
            selected={selectedCourses}
            onChange={setSelectedCourses}
            maxCourses={4}
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1"
              variant="default"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              variant="primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Assign Curriculum'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}