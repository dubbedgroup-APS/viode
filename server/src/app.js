import cors from "cors";
import express from "express";
import morgan from "morgan";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import { thumbnailStorageDir } from "./utils/paths.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/thumbnails", express.static(thumbnailStorageDir));

app.get("/api/health", (_request, response) => {
  response.json({
    message: "Viode API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/playlists", playlistRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

