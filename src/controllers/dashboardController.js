import { supabase } from "../config/supabase.js";

export const getDashboardSummary = async (
  req,
  res
) => {
  try {
    const { user_id } = req.params;

    // GET PROFILE
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    // GET ACCOUNTS
    const {
      data: accounts,
      error: accountsError,
    } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user_id);

    if (accountsError) {
      return res.status(400).json({
        error: accountsError.message,
      });
    }

    // CALCULATE TOTAL BALANCE
    const totalBalance = accounts.reduce(
      (sum, account) =>
        sum + Number(account.balance),
      0
    );

    // GET RECENT TRANSACTIONS
    const accountIds = accounts.map(
      (acc) => acc.id
    );

    const {
      data: transactions,
      error: transactionsError,
    } = await supabase
      .from("transactions")
      .select("*")
      .in("account_id", accountIds)
      .order("created_at", {
        ascending: false,
      })
      .limit(7);

    if (transactionsError) {
      return res.status(400).json({
        error: transactionsError.message,
      });
    }

    return res.status(200).json({
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        is_frozen: profile.is_frozen,
      },

      summary: {
        total_balance: totalBalance,
        accounts_count: accounts.length,
        credit_score: 742,
      },

      accounts,

      recent_transactions: transactions,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};