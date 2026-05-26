import express from "express";

import {
  createManualTransaction,
  freezeUser,
  unfreezeUser,
  setAccountBalance,
  getAllUsers,
} from "../controllers/adminController.js";



import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/transaction",
  verifyAdmin,
  createManualTransaction
);

router.patch(
  "/freeze-user/:user_id",
  verifyAdmin,
  freezeUser
);

router.patch(
  "/unfreeze-user/:user_id",
  verifyAdmin,
  unfreezeUser
);

router.patch(
  "/balance/:account_id",
  verifyAdmin,
  setAccountBalance
);

router.get("/users", getAllUsers);

export default router;