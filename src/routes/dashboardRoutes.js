import express from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboardController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get(
  "/:user_id", verifyAuth, 
  getDashboardSummary
);

export default router;