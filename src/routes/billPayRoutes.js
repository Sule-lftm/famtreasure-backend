import express from "express";

import {
  createBillPayment,
} from "../controllers/billPayController.js";

const router = express.Router();

router.post("/", createBillPayment);

export default router;