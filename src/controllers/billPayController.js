import { supabase } from "../config/supabase.js";

export const createBillPayment =
  async (req, res) => {
    try {
      const {
        account_id,
        payee_name,
        amount,
      } = req.body;

      // GET ACCOUNT
      const {
        data: account,
        error: accountError,
      } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", account_id)
        .single();

      if (accountError || !account) {
        return res.status(404).json({
          error: "Account not found",
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

      const updatedBalance =
        Number(account.balance) -
        Number(amount);

      // UPDATE ACCOUNT
      await supabase
        .from("accounts")
        .update({
          balance: updatedBalance,
          available_balance:
            updatedBalance,
        })
        .eq("id", account_id);

      // CREATE BILL PAYMENT
      await supabase
        .from("bill_payments")
        .insert([
          {
            account_id,
            payee_name,
            amount,
          },
        ]);

      // CREATE TRANSACTION
      await supabase
        .from("transactions")
        .insert([
          {
            account_id,
            type: "debit",
            amount,
            direction: "outgoing",
            description:
              "Bill payment",
            counterparty_name:
              payee_name,
            transaction_category:
              "bill_payment",
            status: "completed",
          },
        ]);

      return res.status(201).json({
        message:
          "Bill payment successful",
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  };