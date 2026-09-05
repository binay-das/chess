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

const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter((url): url is string => Boolean(url));

app.use(cors({
  origin: env.NODE_ENV === "production" && env.CLIENT_URL ? env.CLIENT_URL : allowedOrigins,
  credentials: true,
}));
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
