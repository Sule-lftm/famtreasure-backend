import { supabase } from "../config/supabase.js";

export const getUserCards = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user_id);

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

export const lockCard = async (
  req,
  res
) => {
  try {
    const { card_id } = req.params;

    const { error } = await supabase
      .from("cards")
      .update({
        is_locked: true,
      })
      .eq("id", card_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Card locked",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const unlockCard = async (
  req,
  res
) => {
  try {
    const { card_id } = req.params;

    const { error } = await supabase
      .from("cards")
      .update({
        is_locked: false,
      })
      .eq("id", card_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Card unlocked",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const updateSpendLimit =
  async (req, res) => {
    try {
      const { card_id } = req.params;

      const { spend_limit } = req.body;

      const { error } = await supabase
        .from("cards")
        .update({
          spend_limit,
        })
        .eq("id", card_id);

      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(200).json({
        message:
          "Spend limit updated",
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  };