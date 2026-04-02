import { Router } from "express";

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  toggleVideoInPlaylist,
} from "../controllers/playlistController.js";
import { protect, requireUploader } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.use(requireUploader);
router.get("/", getPlaylists);
router.post("/", createPlaylist);
router.get("/:id", getPlaylistById);
router.patch("/:id/videos/:videoId", toggleVideoInPlaylist);

export default router;
