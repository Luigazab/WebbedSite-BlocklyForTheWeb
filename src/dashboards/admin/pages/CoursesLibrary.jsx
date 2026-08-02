/**
 * TODO: optimize pagination to show up cleanly
 * July 27, 2026
 */
import { Link, useMatches } from "react-router";
import { useState, useEffect } from "react";
import { AppBreadcrumb } from "#components/common/breadcrumb";
import { BookPlus, Check, LogIn, Pencil, Trash2 } from "lucide-react";
import { Button } from "#components/ui/button";
import { useCreateCourse, useDeleteCourse, useGetCourses, useUpdateCourse } from "#hooks/useCourse";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "#components/ui/pagination";
import DeleteModal from "#components/ui/DeleteModal";
import { format } from "date-fns";
import { formatDate } from "@/utils/dateFormat";

export default function CoursesLibrary() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const pageSize = 9;
  
  const { handleCreate } = useCreateCourse();
  const { handleUpdate } = useUpdateCourse();
  const { handleDelete } = useDeleteCourse();
  const { handleGet } = useGetCourses();

  const [ form, setForm ] = useState({
    title: "", 
    description: "", 
    color: "#000000", 
    image: null, 
    imagePreview: null
  });

  const fetchCourses = async (page) => {
    setLoading(true);
    try {
      const data = await handleGet(page, pageSize);
      setCourses(data);
      setTotalCourses(100);
    } catch (error) {
      toast.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  const resetForm = () => {
    setForm({ 
      title: "", 
      description: "", 
      color: "#000000", 
      image: null, 
      imagePreview: null 
    });
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description || "",
      color: course.color || "#000000",
      image: null,
      imagePreview: course.image_src ? 
        `https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/${course.image_src}` : 
        null
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const data = await handleCreate(form);
      if (data) {
        setCourses((prev) => [...prev, ...data]);
        closeModal();
        fetchCourses(currentPage);
      }
    } else if (modalMode === 'edit' && editingCourse) {
      const updates = {
        title: form.title,
        description: form.description,
        color: form.color,
        old_image_src: editingCourse.image_src
      };
      
      const data = await handleUpdate(editingCourse.id, updates, form.image);
      if (data) {
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? data[0] : c)));
        closeModal();
        fetchCourses(currentPage);
      }
    }
  }

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    try {
      await handleDelete(courseToDelete.id, courseToDelete.title);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses(currentPage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(totalCourses / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/admin/' },
          { label: 'Courses', href: '/admin/courses' },
        ]}
      />
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Course library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Template contents teachers can clone.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search courses…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-md rounded-lg border border-border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Button 
            onClick={openCreateModal}
            variant="formalPrimary"
          >
            <BookPlus size={15}/> New course
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {filteredCourses.map((c) => (
          <Link to={`/admin/courses/${c.id}`}
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all! duration-300! shadow hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            {/* Action buttons - positioned at top right */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity!">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(c);
                }}
                className="p-1.5 rounded-md bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors!"
                title="Edit course"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteClick(c);
                }}
                className="p-1.5 rounded-md bg-background hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors!"
                title="Delete course"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground font-extrabold text-lg">
                {c.order}
              </p>
              <img 
                src={c.image_src ? `https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/${c.image_src}` : '/icon.png'}  
                alt="course image" 
                className="size-10 self-end"
              />
            </div>
            <h3 className="mt-5 font-display text-xl font-black leading-tight text-balance group-hover:text-primary">
              {c.title}
            </h3>
            <p className="mt-2 text-muted-foreground line-clamp-2">{c.description}</p>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{c.topics_count}</span> topics
                </span>
                <span>
                  <span className="font-semibold text-foreground">{c.lessons_count}</span> lessons
                </span>
                <span>
                  created <span className="font-semibold text-foreground">{formatDate(c.created_at)}</span>
                </span>
              </div>
              <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                <LogIn/>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Unified Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl font-semibold mb-4">
              {modalMode === 'create' ? 'Create New Course' : 'Edit Course'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring/40"
                    placeholder="Enter course description"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="font-medium mb-1">Color</label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-14 h-14 p-1 rounded-lg border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-blue-500 transition-colors"
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">#</span>
                      <input
                        type="text"
                        value={form.color.replace('#', '')}
                        onChange={(e) => setForm({ 
                          ...form, 
                          color: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
                        })}
                        placeholder="000000"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="font-medium mb-1">Image</label>
                  <div className="relative p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setForm({ 
                            ...form, 
                            image: file,
                            imagePreview: previewUrl 
                          });
                        }
                      }}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {form.imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={form.imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            <Check size={14} className="inline mr-1"/> {form.image?.name || 'Current image'}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (form.imagePreview) {
                                URL.revokeObjectURL(form.imagePreview);
                              }
                              setForm({ ...form, image: null, imagePreview: null });
                            }}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Click to upload {modalMode === 'edit' ? 'new image' : 'or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="formalPlain" className="flex-1" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="formalPrimary" className="flex-1">
                    {modalMode === 'create' ? 'Create Course' : 'Update Course'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setCourseToDelete(null); }} onConfirm={handleDeleteConfirm} title="Delete Course" message={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`} confirmText="Delete" loading={deleteLoading}/>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search terms
            </p>
          )}
        </div>
      )}
    </div>
  );
}