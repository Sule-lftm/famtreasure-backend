import express from "express";

import {
  getUserCards,
  lockCard,
  unlockCard,
  updateSpendLimit,
} from "../controllers/cardController.js";

import { verifyAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/:user_id", verifyAuth, getUserCards);

router.patch("/lock/:card_id", verifyAuth,  lockCard);

router.patch("/unlock/:card_id", verifyAuth, unlockCard);

router.patch(
  "/limit/:card_id",
  updateSpendLimit
);

export default router;