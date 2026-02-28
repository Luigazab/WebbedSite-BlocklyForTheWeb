import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useAssignmentStore } from '../../../store/assignmentStore'
import { ChevronDown, FlaskConical, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_COLORS = {
  assigned: 'text-blue-600',
  missing: 'text-red-600',
  completed: 'text-green-600',
}

const CLASS_COLORS = [
  'border-l-orange-500',
  'border-l-blue-500',
  'border-l-green-500',
  'border-l-purple-500',
  'border-l-pink-500',
  'border-l-yellow-500',
]

export default function AssignmentsTab() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  const profile = useAuthStore((s) => s.profile)
  const { assignments, loading, fetchStudentAssignments } = useAssignmentStore()

  useEffect(() => {
    if (profile?.id) {
      fetchStudentAssignments(profile.id)
    }
  }, [profile?.id])

  // Group assignments by classroom
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const classroomId = assignment.classroom?.id
    if (!classroomId) return acc
    
    if (!acc[classroomId]) {
      acc[classroomId] = {
        classroom: assignment.classroom,
        assignments: [],
      }
    }
    acc[classroomId].assignments.push(assignment)
    return acc
  }, {})

  // Filter assignments
  const filteredGroups = Object.entries(groupedAssignments)
    .map(([classroomId, group]) => ({
      ...group,
      assignments: group.assignments.filter((assignment) => {
        if (statusFilter === 'All') return true
        if (assignment.type === 'lab') {
          const status = assignment.submission?.[0]?.status || 'assigned'
          return status.toLowerCase() === statusFilter.toLowerCase()
        }
        return true
      }),
    }))
    .filter((group) => group.assignments.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter dropdown */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="btn flex items-center gap-2 bg-white border-2 border-gray-900 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            {statusFilter}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
              {['All', 'Assigned', 'Missing', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setShowFilterMenu(false)
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                    ${statusFilter === status
                      ? 'bg-blockly-purple/10 text-blockly-purple font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignments grouped by classroom */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FileText className="w-12 h-12 text-gray-300" />
          <p className="text-sm text-gray-400">No assignments found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.classroom.id}>
              {/* Classroom header */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {group.classroom.name}
              </h2>

              {/* Assignments list */}
              <div className="flex flex-col gap-4">
                {group.assignments.map((assignment) => {
                  const submission = assignment.submission?.[0]
                  const status = submission?.status || 'assigned'
                  const progress = submission?.progress || 0
                  const colorClass = CLASS_COLORS[groupIndex % CLASS_COLORS.length]

                  return (
                    <div
                      key={assignment.id}
                      className={`bg-white rounded-2xl border-l-4 ${colorClass} shadow-sm overflow-hidden`}
                    >
                      <div className="p-6 flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0
                          ${assignment.type === 'lab' ? 'bg-orange-100' : 'bg-green-100'}`}
                        >
                          {assignment.type === 'lab' ? (
                            <FlaskConical className="w-6 h-6 text-orange-600" />
                          ) : (
                            <FileText className="w-6 h-6 text-green-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">{assignment.title}</h3>

                          {assignment.type === 'lab' ? (
                            <div className="flex items-center gap-3 text-sm">
                              <span className={`font-semibold capitalize ${STATUS_COLORS.assigned}`}>
                                Assigned
                              </span>
                              <span className="text-gray-400">·</span>
                              <span className={`font-semibold capitalize ${STATUS_COLORS.missing}`}>
                                Missing
                              </span>
                              <span className="text-gray-400">·</span>
                              <span className={`font-semibold capitalize ${STATUS_COLORS.completed}`}>
                                Completed
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 font-medium">Progress:</span>
                              <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{progress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Due date + Start button */}
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Due Date</p>
                            {assignment.due_date && (
                              <p className="text-sm font-semibold text-gray-700">
                                {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>

                          <button className="btn flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                            Start
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}