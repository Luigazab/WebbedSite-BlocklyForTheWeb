import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '@/supabaseClient';
import { teacherService } from '@/services/teacherService';
import Loader from '#components/layout/Loader';
import { Button } from '#components/ui/button';
import { ArrowRightCircleIcon } from 'lucide-react';

const LoadingSpinner = () => (
  <Loader/>
);

function TeacherHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgProgress: 0,
    totalPending: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) throw new Error('No user authenticated');

        const [
          classroomsData,
          announcementsData,
          totalStudents,
          avgProgress,
          totalPending
        ] = await Promise.all([
          teacherService.getTeacherClassrooms(user.id),
          teacherService.getTeacherAnnouncements(user.id),
          teacherService.getTotalStudents(user.id),
          teacherService.getAverageProgress(user.id),
          teacherService.getTotalPendingSubmissions(user.id),
        ]);

        let studentsData = [];
        if (classroomsData.length > 0) {
          studentsData = await teacherService.getClassroomStudents(classroomsData[0].id);
        }

        setClassrooms(classroomsData);
        setStudents(studentsData);
        setAnnouncements(announcementsData);
        setStats({
          totalStudents,
          avgProgress,
          totalPending,
        });

      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();

    // Optional: Set up real-time subscriptions
    const classroomsSubscription = supabase
      .channel('classrooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'classrooms' },
        () => fetchTeacherData()
      )
      .subscribe();

    return () => {
      classroomsSubscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalStudents = stats.totalStudents;
  const avgProgress = stats.avgProgress;
  const totalPending = stats.totalPending;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Home</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard overview of your class and activities.
        </p>
      </div>
      {/* Editorial hero band */}
      <section className="relative overflow-hidden rounded-3xl border border-border border-b-4 border-b-slate-400 shadow bg-[url('/teacher_banner.png')] bg-cover bg-center p-8 text-sky-800">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-glow/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-glow">
              Class Summary
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
              {totalPending} submissions waiting on you, {avgProgress}% avg class progress.
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm text-muted-foreground md:text-base">
              Pick a classroom to review progress or clone a fresh topic from the master library.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Classrooms" value={classrooms.length} />
            <MiniStat label="Students" value={totalStudents} />
            <MiniStat label="Pending" value={totalPending} accent />
          </div>
        </div>
      </section>

      {/* Classrooms grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">Active classrooms</h3>
          <Button variant='ghost' onClick={() => {navigate('')}}>Classrooms view <ArrowRightCircleIcon size={20}/></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.length > 0 ? (
            classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                to={`/teacher/classrooms/${classroom.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl shadow border-b-4 border-b-slate-400 border border-border bg-card p-6 transition-all! duration-300! hover:-translate-y-0.5 hover:border-primary/50"
              >
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-primary">
                      {classroom.code || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {classroom.section || 'No section'}
                    </span>
                  </div>
                  <h4 className="mt-5 font-display text-lg font-extrabold leading-tight text-balance">
                    {classroom.name || 'Unnamed Classroom'}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    From <span className="text-foreground">{classroom.courseTitle || 'No course'}</span>
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {classroom.studentCount || 0} students
                    </span>
                    <span className="font-mono text-primary">
                      {classroom.averageProgress || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-primary-glow"
                      style={{ width: `${classroom.averageProgress || 0}%` }}
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {students.slice(0, 4).map((student, i) => (
                        <div
                          key={student.id}
                          className="grid size-7 place-items-center rounded-full border-2 border-card bg-muted font-bold text-slate-500"
                          style={{ zIndex: 10 - i }}
                        >
                          {student.avatar_url ? <img src={student.avatar_url} className='rounded-full' /> : student.username?.[0]?.toUpperCase() || 'S'}
                        </div>
                      ))}
                      {classroom.studentCount && classroom.studentCount > 4 && (
                        <div className="grid size-7 place-items-center rounded-full border-2 border-card bg-primary/20 text-[10px] font-medium text-primary">
                          +{classroom.studentCount - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-warning">
                      {classroom.pendingSubmissions || 0} pending
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No active classrooms found
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      <section className="rounded-2xl shadow border border-border border-b-4 border-b-slate-400 bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-semibold">Latest announcements</h3>
          <Button variant='ghost' >
            Post new <ArrowRightCircleIcon size={20}/>
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <li key={announcement.id} className="flex items-start gap-4 px-6 py-4">
                <span
                  className={`mt-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-inset ${
                    announcement.tag === "urgent"
                      ? "bg-red/15 text-red ring-red/25"
                      : announcement.tag === "reminder"
                      ? "bg-amber/15 text-amber ring-amber/30"
                      : "bg-primary/15 text-primary ring-primary/25"
                  }`}
                >
                  {announcement.tag || 'info'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{announcement.body}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {announcement.postedBy || 'Unknown'} · {announcement.postedAt || 'Recently'}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-8 text-center text-muted-foreground">
              No announcements yet
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur shadow">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-semibold ${
          accent ? "text-primary-glow" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default TeacherHome;