import { supabase } from "../config/supabase.js";


const generateAccountNumber = () => {
  return Math.floor(
    1000000000 + Math.random() * 9000000000
  ).toString();
};


export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // SIGN UP USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    const user = data.user;

    if (!user) {
      return res.status(400).json({
        error: "User creation failed",
      });
    }

    // CREATE PROFILE
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          full_name,
          email,
          role: "user",
        },
      ]);

    if (profileError) {
      console.log(profileError);

      return res.status(400).json({
        error: profileError.message,
      });
    }

    // CREATE CHECKING ACCOUNT
    const { error: accountError } = await supabase
      .from("accounts")
      .insert([
        {
          user_id: user.id,
          account_type: "checking",
          nickname: "Everyday Checking",
          account_number: generateAccountNumber(),
          balance: 5000,
          available_balance: 5000,
        },
      ]);

    if (accountError) {
      console.log(accountError);

      return res.status(400).json({
        error: accountError.message,
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const login = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    /*
      FETCH PROFILE
    */

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
      return res.status(400).json({
        error:
          profileError.message,
      });
    }

    /*
      MERGE ROLE INTO USER
    */

    const userWithRole = {
      ...data.user,

      role: profile.role,

      full_name:
        profile.full_name,
    };

    return res.status(200).json({
      message:
        "Login successful",

      data: {
        session:
          data.session,

        user:
          userWithRole,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          "http://localhost:5173/reset-password",
      });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};