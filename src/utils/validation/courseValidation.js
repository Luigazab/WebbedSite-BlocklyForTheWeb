import { toast } from "sonner";

export function validateCourseData({ title, description, color }) {
  if (!title || title.trim().length < 3) {
    toast.error("Title must be at least 3 characters long");
    throw new Error("Title must be at least 3 characters long");
  }
  if (!description || description.trim().length < 10) {
    toast.error("Description must be at least 10 characters long");
    throw new Error("Description must be at least 10 characters long");
  }
  if (!color) {
    toast.error("Color is required");
    throw new Error("Color is required");
  }
}
