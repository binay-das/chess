import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT!;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Chess backend running on port ${PORT}`);
});
