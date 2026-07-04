import React, { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '#components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#components/ui/tabs'
import { useNavigate } from 'react-router'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "#components/ui/accordion"
import { Badge } from "#components/ui/badge"
import { BookOpen, ClipboardCheck, EllipsisVertical, FlaskConical, GripVertical, MonitorPlay, Pencil, Plus, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card'
import { AppBreadcrumb } from '@/components/common/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { AddTopicModal } from '@/components/content/AddTopicModal'
import { useAuth } from '@/hooks/useAuth'
import { removeLessonById, fetchTeacherContentTree } from '@/services/contentCreationService'
import { useUIStore } from '@/store/uiStore'


const lessonIcons = {
  lecture: <BookOpen className="w-6 h-6" />,
  quiz: <ClipboardCheck className="w-6 h-6" />,
  tutorial: <MonitorPlay className="w-6 h-6" />,
  laboratory: <FlaskConical className="w-6 h-6" />,
}
const dropdownItems = [
  {title: 'Lecture',    icon:BookOpen,        to:'/teacher/lecture/create'   },
  {title: 'Quiz',       icon:ClipboardCheck,  to:'/teacher/quiz/create'      },
  {title: 'Tutorial',   icon:MonitorPlay,     to:'/teacher/tutorial/create'  },
  {title: 'Laboratory', icon:FlaskConical,    to:'/teacher/laboratory/create'},
]

const ContentManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addToast = useUIStore((state) => state.addToast);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultTab = useMemo(() => (courses[0] ? String(courses[0].id) : "none"), [courses]);

  const loadContentTree = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const tree = await fetchTeacherContentTree(user.id);
      setCourses(tree);
    } catch (error) {
      addToast(error.message || "Failed to load content.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContentTree();
  }, [user?.id]);

  const handleEditLesson = (lesson) => {
    if (lesson.type === "lecture") {
      navigate(`/teacher/lecture/edit/${lesson.id}`);
      return;
    }
    if (lesson.type === "quiz") {
      navigate(`/teacher/quiz/edit/${lesson.id}`);
      return;
    }
    if (lesson.type === "tutorial") {
      navigate(`/teacher/tutorial/edit/${lesson.id}`);
      return;
    }
    if (lesson.type === "laboratory") {
      navigate(`/teacher/laboratory/edit/${lesson.id}`);
      return;
    }
    addToast(`${lesson.type} edit route is not available yet.`, "info");
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await removeLessonById(lessonId);
      addToast("Lesson removed.", "success");
      await loadContentTree();
    } catch (error) {
      addToast(error.message || "Failed to remove lesson.", "error");
    }
  };

  return (
    <div className="p-8">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teacher/' },
          { label: 'Content Management', href: '/teacher/content' },
        ]}
      />
      <PageHeader
        title="Content & Lesson Management"
        description="Manage course and lesson content"
      />

      {loading && <p className="text-sm text-muted-foreground mt-4">Loading content...</p>}
      {!loading && courses.length === 0 && <p className="text-sm text-muted-foreground mt-4">No courses found.</p>}

      {!loading && courses.length > 0 && <Tabs defaultValue={defaultTab} className="gap-0">
        {/* COURSE TABS */}
        <TabsList className="min-h-fit border-b p-0" variant="line">
          {courses.map((course) => (
            <TabsTrigger
              key={course.id}
              value={String(course.id)}
              className="gap-2 min-w-30 after:bg-transparent"
            >
              <img src={course.image_src} alt={course.title} className="w-10 h-10"/>
              {course.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TAB CONTENT */}
        {courses.map((course) => (
          <TabsContent
            key={course.id}
            value={String(course.id)}
            className="space-y-4"
          >
            {/* COURSE HEADER */}
            <Card className="rounded-2xl rounded-tl-none">
              <CardHeader>
                <CardTitle className="font-bold">{course.title} Course</CardTitle>
                <CardDescription>{course.description}</CardDescription>
                <CardAction>
                  {/* Add Topic Button */}
                  <AddTopicModal course={course}/>
                  {/* Add Lesson Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Lesson
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto min-w-0">
                      {dropdownItems.map(({title, to, icon:Icon}) => (
                        <DropdownMenuItem key={title} className="gap-2 hover:cursor-pointer" onClick={() => navigate(to)}>
                          <Icon className="w-4 h-4" />
                          {title}
                        </DropdownMenuItem>  
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
              <CardContent>

                {/* TOPICS ACCORDION */}
                <Accordion type="multiple" className="space-y-4">
                  {course.topics.map((topic) => (
                    <AccordionItem
                      key={topic.id}
                      value={`topic-${topic.id}`}
                      className="border rounded-2xl"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div>
                            <h3 className="font-semibold">{topic.title}</h3>
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                          </div>
                          <Badge variant="secondary">{topic.lessons.length} lessons</Badge>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        {topic.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition"
                          >
                            {/* LEFT */}
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              {lessonIcons[lesson.type]}
                              <div>
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">by {lesson.author}</p>
                              </div>
                            </div>

                            {/* RIGHT */}
                            <div className='flex gap-3'>
                              <Badge variant="outline">{lesson.type}</Badge>
                              <Badge variant={lesson.is_published ? "default" : "secondary"}>
                                {lesson.is_published ? "Published" : "Unpublished"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <EllipsisVertical className='w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer'/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-auto min-w-0">
                                  <DropdownMenuItem className="hover:bg-blue-500/40!" onClick={() => handleEditLesson(lesson)}>
                                    <Pencil/>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-red-500/40!" onClick={() => handleDeleteLesson(lesson.id)}>
                                    <Trash2/>
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                        
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

          </TabsContent>
        ))}
      </Tabs>}
    </div>
  )
}

export default ContentManagement
