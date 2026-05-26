import { supabase } from "../config/supabase.js";

export const getNotifications =
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const { data, error } =
        await supabase
          .from("notifications")
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

export const markNotificationRead =
  async (req, res) => {
    try {
      const { notification_id } =
        req.params;

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", notification_id);

      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(200).json({
        message:
          "Notification marked as read",
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  };