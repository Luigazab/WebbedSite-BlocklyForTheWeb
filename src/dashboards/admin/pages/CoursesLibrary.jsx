import { Link } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { AppBreadcrumb } from "#components/common/breadcrumb";
import { 
  BookPlus, 
  Check, 
  ArrowRight, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  FolderKanban, 
  Layers, 
  BookOpen,
  UploadCloud,
  Loader2
} from "lucide-react";
import { Button } from "#components/ui/button";
import { useCreateCourse, useDeleteCourse, useGetCourses, useUpdateCourse } from "#hooks/useCourse";
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "#components/ui/pagination";
import DeleteModal from "#components/ui/DeleteModal";
import { formatDate } from "@/utils/dateFormat";
import { supabase } from '@/supabaseClient';

const PRESET_COLORS = [
  "#2563EB", // Blue
  "#7C3AED", // Violet
  "#059669", // Emerald
  "#D97706", // Amber
  "#DC2626", // Red
  "#475569", // Slate
];

export default function CoursesLibrary({ readOnly = false }) {
  const basePath = readOnly ? "/teacher" : "/admin";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    color: "#2563EB",
    image: null,
    imagePreview: null,
  });

  const fetchCourses = async (page) => {
    setLoading(true);
    try {
      const [data, totals] = await Promise.all([
        handleGet(page, pageSize),
        supabase.from('courses').select('id', { count: 'exact', head: true })
      ]);
      if (totals.error) throw totals.error;
      setCourses(data || []);
      setTotalCourses(totals.count ?? 0);
    } catch (error) {
      toast.error("Failed to fetch courses: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      color: "#2563EB",
      image: null,
      imagePreview: null,
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
      color: course.color || "#2563EB",
      image: null,
      imagePreview: course.image_src
        ? `https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/${course.image_src}`
        : null,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    resetForm();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        const data = await handleCreate(form);
        if (data) {
          toast.success("Course template created successfully!");
          closeModal();
          fetchCourses(1);
          setCurrentPage(1);
        }
      } else if (modalMode === 'edit' && editingCourse) {
        const updates = {
          title: form.title,
          description: form.description,
          color: form.color,
          old_image_src: editingCourse.image_src,
        };

        const data = await handleUpdate(editingCourse.id, updates, form.image);
        if (data) {
          toast.success("Course updated successfully!");
          closeModal();
          fetchCourses(currentPage);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save course.");
    } finally {
      setIsSubmitting(false);
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
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      // If we deleted the only item on the page and it's not page 1, go back one page
      if (courses.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchCourses(currentPage);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  }, [courses, searchTerm]);

  // Clean Pagination Generator (e.g. [1, '...', 4, 5, 6, '...', 10])
  const totalPages = Math.ceil(totalCourses / pageSize);

  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="wide-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Course Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course templates that teachers can preview and clone into classrooms.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {!readOnly && (
            <Button onClick={openCreateModal} variant="formalPrimary" className="shrink-0 gap-1.5">
              <BookPlus size={16} /> New Course
            </Button>
          )}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="inner-container">

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-border bg-card/60 p-6 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-8 bg-muted rounded" />
                <div className="size-10 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded mb-1" />
              <div className="h-4 w-2/3 bg-muted rounded mb-8" />
              <div className="h-px bg-muted w-full mb-4" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground mb-3">
            <FolderKanban className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {searchTerm ? "No matching courses found" : "No courses available"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {searchTerm
              ? `We couldn't find anything matching "${searchTerm}". Try a different keyword.`
              : "Get started by creating your very first course template."}
          </p>
          {searchTerm ? (
            <Button variant="formalPlain" size="sm" onClick={() => setSearchTerm("")} className="mt-4">
              Clear Search
            </Button>
          ) : !readOnly ? (
            <Button variant="formalPrimary" size="sm" onClick={openCreateModal} className="mt-4 gap-1.5">
              <BookPlus size={15} /> Create Course
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c, idx) => {
            const courseColor = c.color || "#2563EB";
            const imageUrl = c.image_src
              ? `https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/${c.image_src}`
              : "/icon.png";

            return (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg overflow-hidden"
              >
                {/* Decorative Color Top Accent */}
                <div
                  className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                  style={{ backgroundColor: courseColor }}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Top Row: Index Badge & Image */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center justify-center font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                      #{c.order ?? idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Action buttons (Never overlaps icon) */}
                      {!readOnly && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-xs p-1 rounded-lg border border-border shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditModal(c);
                            }}
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Edit course"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(c);
                            }}
                            className="p-1 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      <img
                        src={imageUrl}
                        alt={c.title}
                        className="size-10 rounded-xl object-cover border border-border bg-background p-0.5 shadow-2xs"
                        onError={(e) => {
                          e.currentTarget.src = "/icon.png";
                        }}
                      />
                    </div>
                  </div>

                  {/* Course Details Link */}
                  <Link to={`${basePath}/courses/${c.id}`} className="mt-4 flex-1">
                    <h2 className="font-display text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {c.title}
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {c.description || "No description provided for this template."}
                    </p>
                  </Link>

                  {/* Card Footer: Metadata Badges */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Topics">
                        <Layers className="size-3.5 text-muted-foreground/70" />
                        <strong className="font-semibold text-foreground">{c.topics_count || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1" title="Lessons">
                        <BookOpen className="size-3.5 text-muted-foreground/70" />
                        <strong className="font-semibold text-foreground">{c.lessons_count || 0}</strong>
                      </span>
                    </div>

                    <Link
                      to={`${basePath}/courses/${c.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform"
                    >
                      View <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * pageSize, totalCourses)}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalCourses}</span> courses
          </p>

          <Pagination className="justify-center sm:justify-end mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((p) => p - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>

              {paginationRange.map((page, i) => {
                if (page === '...') {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {!readOnly && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
              <h2 className="font-display text-lg font-bold text-foreground">
                {modalMode === 'create' ? 'Create New Course' : 'Edit Course Details'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  placeholder="e.g. Introduction to Python Programming"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Summarize course goals and expectations..."
                  rows={3}
                  required
                />
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Brand Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm({ ...form, color: preset })}
                        className="size-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                        style={{
                          backgroundColor: preset,
                          borderColor: form.color.toLowerCase() === preset.toLowerCase() ? "var(--foreground)" : "transparent"
                        }}
                      >
                        {form.color.toLowerCase() === preset.toLowerCase() && (
                          <Check className="size-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="h-5 w-px bg-border mx-1" />

                  {/* Custom Hex Picker */}
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="size-8 p-0.5 rounded-lg border border-border cursor-pointer bg-background"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              {/* Course Thumbnail Upload */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5">
                  Course Thumbnail / Icon
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors p-4 text-center bg-muted/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setForm({
                          ...form,
                          image: file,
                          imagePreview: previewUrl,
                        });
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {form.imagePreview ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={form.imagePreview}
                          alt="Thumbnail preview"
                          className="size-14 rounded-lg object-cover border border-border bg-card"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                            {form.image?.name || "Current thumbnail"}
                          </p>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Check className="size-3" /> Ready
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (form.imagePreview && form.image) {
                            URL.revokeObjectURL(form.imagePreview);
                          }
                          setForm({ ...form, image: null, imagePreview: null });
                        }}
                        className="text-xs text-destructive hover:underline font-medium p-1 z-10"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center pointer-events-none">
                      <UploadCloud className="size-8 text-muted-foreground/60 mb-2" />
                      <p className="text-xs font-medium text-foreground">
                        Click or drag image to upload
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        PNG, JPG, SVG or WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="formalPlain" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="formalPrimary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Saving...
                    </>
                  ) : modalMode === 'create' ? (
                    'Create Course'
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {!readOnly && (
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setCourseToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Course Template"
          message={`Are you sure you want to delete "${courseToDelete?.title}"? This template will no longer be available for cloning.`}
          confirmText="Delete Course"
          loading={deleteLoading}
        />
      )}
    </div>
  );
}