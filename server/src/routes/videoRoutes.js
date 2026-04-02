import { Router } from "express";

import {
  getMyVideos,
  getVideoById,
  getVideos,
  incrementViewCount,
  saveWatchHistory,
  streamVideo,
  uploadVideo,
} from "../controllers/videoController.js";
import { protect, requireUploader } from "../middleware/authMiddleware.js";
import { uploadVideoAssets } from "../utils/upload.js";

const router = Router();

router.get("/", getVideos);
router.get("/mine", protect, getMyVideos);
router.post("/upload", protect, requireUploader, uploadVideoAssets, uploadVideo);
router.get("/:id", getVideoById);
router.get("/:id/stream", streamVideo);
router.post("/:id/view", incrementViewCount);
router.post("/:id/history", protect, saveWatchHistory);

export default router;
