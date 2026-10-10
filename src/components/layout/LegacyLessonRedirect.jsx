import { Navigate, useLocation, useParams } from 'react-router';
import { coursePreviewPath, legacyLessonDestination } from '../../utils/lessonRoutes';

export default function LegacyLessonRedirect({ preview = false }) {
  const { id, courseSlug, slug } = useParams();
  const { search } = useLocation();
  const destination = preview
    ? coursePreviewPath(id, courseSlug, slug)
    : legacyLessonDestination(courseSlug, slug, search);
  return <Navigate to={destination} replace />;
}
