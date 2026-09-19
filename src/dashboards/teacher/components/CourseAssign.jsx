import { useMemo } from 'react'
import { toast } from 'sonner'

export default function CourseAssign({
  courses = [],
  selected = [],
  onChange,
  maxCourses = 4,
}) {
  const selectedCourses = useMemo(
    () =>
      selected
        .map((id) => courses.find((course) => course.id === id))
        .filter(Boolean),
    [selected, courses]
  )

  const toggleCourse = (id) => {
    onChange((prev) => {
      if (prev.includes(id)) {
        return prev.filter((courseId) => courseId !== id)
      }

      if (prev.length >= maxCourses) {
        toast.error(`A classroom can hold up to ${maxCourses} courses.`)
        return prev
      }
      return [...prev, id]
    })
  }

  const moveCourse = (index, direction) => {
    onChange((prev) => {
      const next = [...prev]
      const target = index + direction

      if (target < 0 || target >= next.length) {
        return prev
      }

      ;[next[index], next[target]] = [
        next[target],
        next[index],
      ]

      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700">
          Courses ({selected.length}/{maxCourses})
        </label>

        <span className="text-xs text-slate-400">
          Click to add · order = sequence
        </span>
      </div>

      {/* Course selection */}
      <div className="grid gap-2 sm:grid-cols-2">
        {courses.map((course) => {
          const index = selected.indexOf(course.id)
          const active = index !== -1

          return (
            <button
              key={course.id}
              type="button"
              onClick={() => toggleCourse(course.id)}
              className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                active
                  ? 'border-blockly-blue/60 bg-blockly-blue/10'
                  : 'border-slate-200 bg-white hover:border-blockly-blue/40'
              }`}
            >
              {/* Number */}
              <span
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md font-mono text-[11px] font-semibold ${
                  active
                    ? 'bg-blockly-blue text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {active ? index + 1 : '+'}
              </span>

              {/* Course info */}
              <span className="min-w-0 flex flex-col">
                <span className="truncate text-sm font-medium text-slate-700">
                  {course.title}
                </span>

                <span className="mt-0.5 font-mono text-[11px] text-slate-400">
                  {course.slug}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected / ordered courses */}
      {selectedCourses.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {selectedCourses.map((course, index) => (
            <li
              key={course.id}
              className="flex items-center gap-3 px-3 py-2"
            >
              <span className="rounded-md bg-blockly-blue/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blockly-blue">
                C{index + 1}
              </span>

              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                {course.title}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveCourse(index, -1)}
                  disabled={index === 0}
                  className="grid size-6 place-items-center rounded-md border border-slate-200 text-xs text-slate-600 disabled:opacity-30"
                  aria-label={`Move ${course.title} up`}
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moveCourse(index, 1)}
                  disabled={index === selectedCourses.length - 1}
                  className="grid size-6 place-items-center rounded-md border border-slate-200 text-xs text-slate-600 disabled:opacity-30"
                  aria-label={`Move ${course.title} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}