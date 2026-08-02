import { useState, useEffect } from "react";
import { toast } from "sonner";
import { courseService } from "../services/courseService";
import { topicService } from "../services/topicService";
import { getLessonDetails } from "../services/lessonService";

export function useCourseDetail(courseId) {
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [lessonsCountByTopic, setLessonsCountByTopic] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    async function fetchDetail() {
      setLoading(true);
      toast.info("Loading course details...");

      try {
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);

        const topicsData = await topicService.getTopicsByCourse(courseId);
        setTopics(topicsData);

        const counts = {};
        for (const topic of topicsData) {
          const count = await getLessonDetails.countLessonsByTopic(topic.id);
          counts[topic.id] = count;
        }
        setLessonsCountByTopic(counts);

        toast.success("Course details loaded");
      } catch (err) {
        toast.error(`Failed to load course details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [courseId]);

  return { course, topics, lessonsCountByTopic, loading };
}
