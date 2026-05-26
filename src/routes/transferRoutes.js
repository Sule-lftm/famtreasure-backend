import express from "express";

import {
  internalTransfer,
  externalTransfer,
} from "../controllers/transferController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/internal", verifyAuth,  internalTransfer);

router.post("/external", verifyAuth, externalTransfer);

export default router;