import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import gameRoutes from "./routes/game.routes.js";
import { initSocketServer } from "./socket/socket.server.js";

const app = express();
const PORT = process.env.PORT!;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/games", gameRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

initSocketServer(
  app.listen(PORT, () => {
    console.log(`Chess backend running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
  })
)
