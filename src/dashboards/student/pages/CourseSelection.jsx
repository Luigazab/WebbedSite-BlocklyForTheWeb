import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useCourses } from "../../../hooks/useCourse";
import { useLevels } from "../../../hooks/useLevel";

function CourseSelection() {
  const [selected, setSelected] = useState("");
  const [level, setLevel] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCourse, courses, fetchCourses } = useCourses(user?.id);
  const { levels, startingLevels, fetchLevels } = useLevels(user?.id);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selected || !level) return;

    const selectedLevel = startingLevels[level];

      if (!selectedLevel) {
        alert("Invalid level selection");
        return;
      }

    try {
      await startCourse(
        selected,
        selectedLevel.level,
        selectedLevel.xp_required
      );
      navigate("/student/learn", { replace: true });
    } catch (err) {
      alert("Something went wrong");
    }
  };
  
  useEffect(() => {
    fetchCourses();
    fetchLevels();
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-full overflow-y-auto p-8 space-y-2">
      <div className="space-y-4">
        <ChevronLeft
          onClick={() => navigate(-1)}
          className="w-8 h-8 shrink-0 cursor-pointer bg-slate-100 hover:bg-slate-200 rounded"
        />
        <hr className="border-slate-200" />
      </div>
      <div className="max-w-4xl mx-auto md:mt-24">
        <h1 className="font-bold text-3xl text-center">
          Choose the course you want to start with today
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-white/80 rounded-xl items-center space-y-6 p-6"
        >
          {/* Step 1: Radio with images */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {courses.map((course) => (
              <label
                key={course.id}
                className={`flex flex-col items-center space-y-2 cursor-pointer rounded-xl shadow p-6 w-44 border transition-all!
                  ${selected == course.id
                    ? 'scale-105'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:-translate-y-2'
                  }`}
                style={selected == course.id ? {
                  borderColor: course.color,
                  backgroundColor: `${course.color}40`,
                } : {}}
              >
                <input
                  type="radio"
                  name="skill"
                  value={course.id}
                  onChange={(e) => setSelected(e.target.value)}
                  className="hidden peer"
                />
                <img
                  src={course.image_src}
                  alt={course.title}
                  className="w-24 h-24 object-contain"
                />
                <span className="text-lg font-bold">{course.title}</span>
              </label>
            ))}
          </div>

          <p className="font-semibold text-slate-400">
            Choosing HTML is recommended if you are just starting with Web
            Languages
          </p>

          {/* Step 2: Show levels if selected */}
          {selected && (
            <div className="w-full space-y-6">
              <p className="text-xl font-semibold">Select your level:</p>
              <div className="flex space-x-6">
                {Object.entries(startingLevels).map(([key, lvlObj]) => (
                  <label
                    key={key}
                    className="flex-1 flex flex-col items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="level"
                      value={key}
                      checked={level === key}
                      onChange={(e) => setLevel(e.target.value)}
                      className="hidden peer"
                    />
                    <span className="capitalize px-4 py-3 font-bold text-center w-full rounded-lg border border-slate-200 bg-white shadow peer-checked:bg-blue-500 peer-checked:text-white">
                      {key}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Submit */}
          {selected && level && (
            <button
              type="submit"
              className="btn mt-6 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 self-end"
            >
              Confirm
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CourseSelection;
