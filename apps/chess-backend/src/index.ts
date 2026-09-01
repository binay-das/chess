import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import gameRoutes from "./routes/game.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { initSocketServer } from "./socket/socket.server.js";

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

initSocketServer(
  app.listen(PORT, () => {
    console.log(`Chess backend running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
  })
)
