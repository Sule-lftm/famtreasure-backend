import { supabase } from "../config/supabase.js";

export const verifyAdmin = async (
  req,
  res,
  next
) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      data: profile,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error || !profile) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({
        error:
          "Access denied. Admin only.",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};