import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import billPayRoutes from "./routes/billPayRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://fam-treasure-hub-main.vercel.app",
      "https://fam-treasure-clean.vercel.app",
      "https://fam-treasure.cc"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/accounts", accountRoutes);
app.use("/transfers", transferRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/cards", cardRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/bill-pay", billPayRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Fam Treasure API running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
