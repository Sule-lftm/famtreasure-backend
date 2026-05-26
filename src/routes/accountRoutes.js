import express from "express";

import {
  getUserAccounts,
  getAccountById,
  getAccountTransactions,
  createAccount
  
} from "../controllers/accountController.js";

import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:account_id", getAccountById);

// USER ACCOUNTS
router.get(
  "/user/:user_id",
  verifyAuth,
  getUserAccounts
);

router.get(
  "/transactions/:account_id", 
  getAccountTransactions
);

router.post("/", createAccount);

export default router;