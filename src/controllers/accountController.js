import { supabase } from "../config/supabase.js";

export const getUserAccounts = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getAccountById = async (
  req,
  res
) => {
  try {
    const { account_id } = req.params;

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getAccountTransactions =
  async (req, res) => {
    try {
      const { account_id } = req.params;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", account_id)
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
      console.log(err);

      return res.status(500).json({
        error: err.message,
      });
    }
  };

export const createAccount = async (
  req,
  res
) => {
  try {
    const {
      user_id,
      account_type,
      nickname,
      opening_deposit,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // GENERATE ACCOUNT NUMBER
    const account_number = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    const initialBalance =
      Number(opening_deposit || 0);

    const { data, error } =
      await supabase
        .from("accounts")
        .insert([
          {
            user_id,
            account_type,
            nickname,
            account_number,
            balance: initialBalance,
            available_balance:
              initialBalance,
            status: "active",
          },
        ])
        .select()
        .single();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(201).json({
      message:
        "Account created successfully",
      account: data,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};