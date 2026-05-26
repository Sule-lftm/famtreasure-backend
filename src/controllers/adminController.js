import { supabase } from "../config/supabase.js";

export const createManualTransaction = async (req, res) => {
  try {
    const {
      account_id,
      type,
      amount,
      description,
      counterparty_name,
      transaction_category,
      date, // 1. Destructure the custom date value arriving from your frontend input form
    } = req.body;

    // GET ACCOUNT
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    let updatedBalance = Number(account.balance);

    // CREDIT
    if (type === "credit") {
      updatedBalance += Number(amount);
    }

    // DEBIT
    if (type === "debit") {
      // CHECK BALANCE
      if (Number(account.balance) < Number(amount)) {
        return res.status(400).json({
          error: "Insufficient balance",
        });
      }

      updatedBalance -= Number(amount);
    }

    // UPDATE ACCOUNT
    const { error: updateError } = await supabase
      .from("accounts")
      .update({
        balance: updatedBalance,
        available_balance: updatedBalance,
      })
      .eq("id", account_id);

    if (updateError) {
      return res.status(400).json({
        error: updateError.message,
      });
    }

    // Determine target timestamp: Use custom input value if filled, otherwise fall back to system current time
    const transactionTimestamp = date ? new Date(date).toISOString() : new Date().toISOString();

    // CREATE TRANSACTION
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          account_id,
          type,
          amount,
          direction: type === "credit" ? "incoming" : "outgoing",
          description: description || "Manual admin transaction",
          counterparty_name: counterparty_name || "Bank Admin",
          transaction_category: transaction_category || "adjustment",
          status: "completed",
          // 2. Explicitly override the default database 'now()' column assignment with our validated timestamp
          created_at: transactionTimestamp, 
        },
      ]);

    if (transactionError) {
      return res.status(400).json({
        error: transactionError.message,
      });
    }

    return res.status(200).json({
      message: "Manual transaction created successfully",
      updated_balance: updatedBalance,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

  export const freezeUser = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_frozen: true,
      })
      .eq("id", user_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "User frozen successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const unfreezeUser = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_frozen: false,
      })
      .eq("id", user_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message:
        "User unfrozen successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getAllUsers = async (
  req,
  res
) => {
  try {
    const { data, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          is_frozen,
          created_at,
          accounts (
            id,
            account_number,
            balance,
            account_type,
            status,
            created_at
          )
        `);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    const formattedUsers = data.map(
      (user) => ({
        user_id: user.id,

        name: user.full_name,

        frozen: user.is_frozen,

        accounts:
          user.accounts?.map((account) => ({
            account_id: account.id,

            account_number:
              account.account_number,

            balance: account.balance,

            account_type:
              account.account_type,

            status: account.status,

            created_at:
              account.created_at,
          })) || [],

        user_created_at:
          user.created_at,
      })
    );

    return res.status(200).json(
      formattedUsers
    );
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const setAccountBalance = async (
  req,
  res
) => {
  try {
    const { account_id } = req.params;

    const { new_balance } = req.body;

    if (Number(new_balance) < 0) {
      return res.status(400).json({
        error:
          "Balance cannot be negative",
      });
    }

    const { error } = await supabase
      .from("accounts")
      .update({
        balance: new_balance,
        available_balance: new_balance,
      })
      .eq("id", account_id);

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message:
        "Account balance updated successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};