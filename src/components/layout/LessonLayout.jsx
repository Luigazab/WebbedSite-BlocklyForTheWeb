import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';

export default function LessonLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <main className="min-h-dvh bg-slate-50"><Outlet /></main>;
}
