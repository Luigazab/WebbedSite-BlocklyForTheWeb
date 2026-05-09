import { supabase } from "../supabaseClient";

export const levelService = {
  async getLevels() {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .order("level", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLevelByValue(level) {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .eq("level", level)
      .single();

    if (error) throw error;
    return data;
  }
};