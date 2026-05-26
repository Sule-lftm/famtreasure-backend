import { supabase } from "../config/supabase.js";

export const internalTransfer = async (req, res) => {
  try {
    const {
      from_account_id,
      to_account_id,
      amount,
      description,
    } = req.body;

    // GET SOURCE ACCOUNT
    const {
      data: fromAccount,
      error: fromError,
    } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", from_account_id)
      .single();

    if (fromError || !fromAccount) {
      return res.status(404).json({
        error: "Source account not found",
      });
    }

    // GET DESTINATION ACCOUNT
    const {
      data: toAccount,
      error: toError,
    } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", to_account_id)
      .single();

    if (toError || !toAccount) {
      return res.status(404).json({
        error: "Destination account not found",
      });
    }

    // VERIFY SAME USER
    if (
      fromAccount.user_id !== toAccount.user_id
    ) {
      return res.status(400).json({
        error:
          "Accounts do not belong to same user",
      });
    }

    // GET PROFILE
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", fromAccount.user_id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    // CHECK PROFILE FREEZE
    if (profile.is_frozen) {
      return res.status(400).json({
        error:
          "Profile is frozen. Transfers disabled.",
      });
    }

    // CHECK BALANCE
    if (
      Number(fromAccount.balance) <
      Number(amount)
    ) {
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // CALCULATE BALANCES
    const updatedFromBalance =
      Number(fromAccount.balance) -
      Number(amount);

    const updatedToBalance =
      Number(toAccount.balance) +
      Number(amount);

    // UPDATE SOURCE ACCOUNT
    const { error: updateFromError } =
      await supabase
        .from("accounts")
        .update({
          balance: updatedFromBalance,
          available_balance:
            updatedFromBalance,
        })
        .eq("id", from_account_id);

    if (updateFromError) {
      return res.status(400).json({
        error: updateFromError.message,
      });
    }

    // UPDATE DESTINATION ACCOUNT
    const { error: updateToError } =
      await supabase
        .from("accounts")
        .update({
          balance: updatedToBalance,
          available_balance:
            updatedToBalance,
        })
        .eq("id", to_account_id);

    if (updateToError) {
      return res.status(400).json({
        error: updateToError.message,
      });
    }

    // CREATE DEBIT TRANSACTION
    await supabase
      .from("transactions")
      .insert([
        {
          account_id: from_account_id,
          type: "debit",
          direction: "outgoing",
          amount,
          description:
            description ||
            "Internal transfer",
          counterparty_name:
            toAccount.nickname,
          transaction_category:
            "internal_transfer",
          status: "completed",
        },
      ]);

    // CREATE CREDIT TRANSACTION
    await supabase
      .from("transactions")
      .insert([
        {
          account_id: to_account_id,
          type: "credit",
          direction: "incoming",
          amount,
          description:
            description ||
            "Internal transfer",
          counterparty_name:
            fromAccount.nickname,
          transaction_category:
            "internal_transfer",
          status: "completed",
        },
      ]);

    return res.status(200).json({
      message:
        "Internal transfer successful",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const externalTransfer = async (
  req,
  res
) => {
  try {
    console.log("Incoming Request Body:", req.body);
    const {
      from_account_id: account_id, // Map from_account_id to account_id
      amount,
      recipient_name: external_bank_name, // Map recipient_name to external_bank_name
      memo: description, // Map memo to description
    } = req.body;

    // GET ACCOUNT
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", account_id) // This will now receive the UUID perfectly!
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    // GET PROFILE
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", account.user_id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    // CHECK PROFILE FREEZE
    if (profile.is_frozen) {
      return res.status(400).json({
        error:
          "Profile is frozen. Transfers disabled.",
      });
    }

    // CHECK BALANCE
    if (
      Number(account.balance) <
      Number(amount)
    ) {
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // CALCULATE NEW BALANCE
    const updatedBalance =
      Number(account.balance) -
      Number(amount);

    // UPDATE ACCOUNT
    const { error: updateError } =
      await supabase
        .from("accounts")
        .update({
          balance: updatedBalance,
          available_balance:
            updatedBalance,
        })
        .eq("id", account_id);

    if (updateError) {
      return res.status(400).json({
        error: updateError.message,
      });
    }

    // CREATE TRANSACTION
    const { error: transactionError } =
      await supabase
        .from("transactions")
        .insert([
          {
            account_id,
            type: "debit",
            direction: "outgoing",
            amount,
            description:
              description ||
              "External transfer",
            counterparty_name:
              external_bank_name,
            transaction_category:
              "external_transfer",
            status: "completed",
          },
        ]);

    if (transactionError) {
      return res.status(400).json({
        error: transactionError.message,
      });
    }

    return res.status(200).json({
      message:
        "External transfer successful",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};