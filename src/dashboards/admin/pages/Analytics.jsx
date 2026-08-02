import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient'; // Adjust path as needed
import AdminStat from '../components/AdminStat';
import { AppBreadcrumb } from '#components/common/breadcrumb';
import { Book, BookOpen, Database, FolderKanban, Users } from 'lucide-react';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    submissionsToday: 0,
    weeklyActive: 0,
    storageUsedGb: 0,
    weeklyData: [],
    topCourses: [],
    auditLog: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [
        usersCount,
        coursesData,
        lessonsCount,
        quizzesCount,
        weeklyActiveData,
        submissionsData,
        auditData
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select(`
          id,
          title,
          user_progress(count)
        `),
        
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        
        getWeeklyActiveUsers(),
        
        getTodaysSubmissions(),
        
        getAuditLog()
      ]);

      const coursesWithEnrollments = coursesData.data?.map(course => ({
        ...course,
        enrollments: course.user_progress?.length || 0
      })) || [];
      const topCourses = coursesWithEnrollments
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);

      const storageUsed = await getStorageUsed();

      setStats({
        totalUsers: usersCount.count || 0,
        totalCourses: coursesData.data?.length || 0,
        totalLessons: lessonsCount.count || 0,
        totalQuizzes: quizzesCount.count || 0,
        submissionsToday: submissionsData,
        weeklyActive: weeklyActiveData.currentActive,
        weeklyData: weeklyActiveData.weeklyData,
        storageUsedGb: storageUsed,
        topCourses: topCourses,
        auditLog: auditData
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyActiveUsers = async () => {
    const now = new Date();
    const weeklyData = [];
    let totalActive = 0;

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 7));
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', weekStart.toISOString())
        .lt('last_login', weekEnd.toISOString());

      const active = count || 0;
      weeklyData.push(active);
      if (i === 0) totalActive = active;
    }

    return {
      weeklyData,
      currentActive: totalActive
    };
  };

  // Helper function to get today's submissions (quiz attempts)
  const getTodaysSubmissions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', today.toISOString())
      .lt('started_at', tomorrow.toISOString());

    return count || 0;
  };

  const getStorageUsed = async () => {
    try {
      // You can implement this by checking your storage bucket
      // or by calculating from file sizes in your tables
      const { data, error } = await supabase
        .storage
        .listBuckets();

      if (error) throw error;

      // If you have a specific bucket for uploads
      let totalSize = 0;
      for (const bucket of data) {
        const { data: files } = await supabase
          .storage
          .from(bucket.name)
          .list();

        if (files) {
          // Calculate total size - you might need to get metadata
          // This is a simplified version
          totalSize += files.length * 0.001; // assuming average file size
        }
      }

      return Math.round(totalSize * 10) / 10; // Return in GB
    } catch (err) {
      console.error('Error getting storage usage:', err);
      return 0;
    }
  };

  const getAuditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          id,
          user_id,
          action,
          target,
          created_at,
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        who: log.profiles?.username || 'Unknown',
        action: log.action,
        target: log.target,
        at: new Date(log.created_at).toLocaleString()
      })) || [];
    } catch (err) {
      console.warn('Audit log table not found:', err);
      return [];
    }
  };

  const weekly = stats.weeklyData.length > 0 
    ? stats.weeklyData 
    : [42, 58, 61, 79, 88, 74, 96, 82, 91, 105, 118, 124];
  const maxWeekly = Math.max(...weekly);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>Error loading analytics: {error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-2 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 ">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/admin/' },
          { label: 'Analytics', href: '/admin/analytics' },
        ]}
      />
      <div>
        <h2 className="font-display text-2xl font-semibold">Analytics & reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform health, learning velocity, and content usage.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <AdminStat icon={FolderKanban} label="Submissions today" value={stats.submissionsToday} sub="Quiz attempts today"/>
        <AdminStat icon={Users} label="Weekly active users" value={stats.weeklyActive.toLocaleString()} sub={`${Math.round((stats.weeklyActive / (stats.totalUsers || 1)) * 100)}% of user base`}/>
        <AdminStat icon={BookOpen} label="Total lessons" value={stats.totalLessons.toLocaleString()} sub={`${stats.totalCourses} courses available` }/>
        <AdminStat icon={Database} label="Storage used" value={`${stats.storageUsedGb} GB`} sub="Total storage used" accent/>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Weekly active learners</h3>
              <p className="text-xs text-muted-foreground">Last 12 weeks · trailing</p>
            </div>
            <span className="rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success ring-1 ring-inset ring-success/25">
              +{stats.weeklyActive > 0 ? Math.round((stats.weeklyActive / (weekly[weekly.length - 2] || 1) - 1) * 100) : 0}% vs prior period
            </span>
          </div>
          <div className="mt-8 flex h-56 items-end gap-3">
            {weekly.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary-glow/80 transition-all"
                  style={{ height: `${Math.max(5, (v / maxWeekly) * 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow">
          <h3 className="font-display text-lg font-semibold">Top courses</h3>
          {stats.topCourses.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {stats.topCourses.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{c.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">{c.enrollments}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (c.enrollments / (stats.topCourses[0]?.enrollments || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No course data available</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-semibold">Admin audit log</h3>
          <button 
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              // Export CSV functionality
              const headers = ['User', 'Action', 'Target', 'Time'];
              const rows = stats.auditLog.map(log => [
                log.who,
                log.action,
                log.target,
                log.at
              ]);
              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'audit-log.csv';
              a.click();
            }}
          >
            Export CSV
          </button>
        </div>
        <ul className="divide-y divide-border">
          {stats.auditLog.length > 0 ? (
            stats.auditLog.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-6 py-4 text-sm">
                <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                <p className="min-w-0 flex-1">
                  <span className="font-medium">{e.who}</span>{" "}
                  <span className="text-muted-foreground">{e.action}</span>{" "}
                  <span className="font-medium">{e.target}</span>
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{e.at}</span>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-sm text-muted-foreground">
              No audit log entries available
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default Analytics;