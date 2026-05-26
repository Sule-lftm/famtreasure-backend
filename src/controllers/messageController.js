import { supabase } from "../config/supabase.js";

export const sendMessage = async (
  req,
  res
) => {
  try {
    const {
      user_id,
      subject,
      message,
    } = req.body;

    const { error } = await supabase
      .from("secure_messages")
      .insert([
        {
          user_id,
          subject,
          message,
        },
      ]);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(201).json({
      message: "Message sent",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getMessages = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    const { data, error } =
      await supabase
        .from("secure_messages")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};