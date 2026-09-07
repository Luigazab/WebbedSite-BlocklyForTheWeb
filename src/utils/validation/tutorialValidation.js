import { toast } from "sonner";

export function tutorialValidation({title, topic, basexp, instruction}){
  if (!title.trim()) {
    toast.error("Tutorial title is required.");
    throw new Error("Tutorial title is required.");
  }
  if (title.trim().length < 3) {
    toast.error("Title must be at least 3 characters long");
    throw new Error("Title must be at least 3 characters long");
  }
  if (!topic) {
    toast.error("Please select a topic this tutorial belongs to.")
    throw new Error("Please select a topic this tutorial belongs to.")
  }
  if (!basexp) {
    toast.error("Base Xp can't be empty.");
    throw new Error("Base Xp can't be empty.");
  }
  if (!instruction){
    toast.error("Instruction is missing.");
    throw new Error("Instruction is missing.");
  }
}