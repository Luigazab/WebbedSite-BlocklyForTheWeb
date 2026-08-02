import { toast } from "sonner";

export function validateClassroomData({ name }) {
  const trimmedName = (name ?? "").trim();

  if (!trimmedName){
    toast.error("Classroom name is required.");
    throw new Error("Classroom name is required.");
  }
  if (trimmedName.length < 3) {
    toast.error("Classroom name must be at least 3 characters long");
    throw new Error("Classroom name must be at least 3 characters long");
  }
  if (trimmedName.length > 60) {
    toast.error("Classroom name must be under 60 characters");
    throw new Error("Classroom name must be under 60 characters");
  }
}
