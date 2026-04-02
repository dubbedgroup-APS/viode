import fs from "fs";

import { publicFilePath, resolveStoredPath } from "../utils/storage.js";
import {
  addVideoToHistory,
  createVideo,
  getAllVideos,
  getRawVideoById,
  getVideoById as getStoredVideoById,
  getVideosByOwner,
  incrementVideoViews,
} from "../utils/dataStore.js";

const DEFAULT_STREAM_CHUNK_SIZE = 10 ** 6;

const formatTags = (tags = "") =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const getVideos = async (_request, response, next) => {
  try {
    const videos = await getAllVideos();

    response.json(videos);
  } catch (error) {
    next(error);
  }
};

export const getMyVideos = async (request, response, next) => {
  try {
    const videos = await getVideosByOwner(request.user._id);

    response.json(videos);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (request, response, next) => {
  try {
    const video = await getStoredVideoById(request.params.id);

    if (!video) {
      return response.status(404).json({
        message: "Video not found.",
      });
    }

    response.json(video);
  } catch (error) {
    next(error);
  }
};

export const uploadVideo = async (request, response, next) => {
  try {
    const { title, description = "", category = "General", tags = "" } =
      request.body;

    if (!title) {
      return response.status(400).json({
        message: "Video title is required.",
      });
    }

    const uploadedVideo = request.files?.video?.[0];

    if (!uploadedVideo) {
      return response.status(400).json({
        message: "Please choose a video file to upload.",
      });
    }

    const thumbnail = request.files?.thumbnail?.[0];

    const video = await createVideo({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || "General",
      tags: formatTags(tags),
      owner: request.user._id,
      videoPath: publicFilePath("videos", uploadedVideo.filename),
      thumbnailPath: thumbnail
        ? publicFilePath("thumbnails", thumbnail.filename)
        : "",
      mimeType: uploadedVideo.mimetype,
      size: uploadedVideo.size,
    });

    response.status(201).json({
      message: "Video uploaded successfully.",
      video,
    });
  } catch (error) {
    next(error);
  }
};

export const incrementViewCount = async (request, response, next) => {
  try {
    const video = await incrementVideoViews(request.params.id);

    if (!video) {
      return response.status(404).json({
        message: "Video not found.",
      });
    }

    response.json({
      views: video.views,
    });
  } catch (error) {
    next(error);
  }
};

export const saveWatchHistory = async (request, response, next) => {
  try {
    const history = await addVideoToHistory(request.user._id, request.params.id);

    if (!history) {
      return response.status(404).json({
        message: "Video not found.",
      });
    }

    response.json({
      message: "Watch history updated.",
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const streamVideo = async (request, response, next) => {
  try {
    const video = await getRawVideoById(request.params.id);

    if (!video) {
      return response.status(404).json({
        message: "Video not found.",
      });
    }

    const videoPath = resolveStoredPath(video.videoPath);

    if (!fs.existsSync(videoPath)) {
      return response.status(404).json({
        message: "Stored video file is missing.",
      });
    }

    const { size: fileSize } = fs.statSync(videoPath);
    const rangeHeader = request.headers.range;

    response.setHeader("Accept-Ranges", "bytes");
    response.setHeader("Cache-Control", "public, max-age=3600");
    response.setHeader("Content-Type", video.mimeType || "video/mp4");

    if (!rangeHeader) {
      response.setHeader("Content-Length", fileSize);
      fs.createReadStream(videoPath).pipe(response);
      return;
    }

    const [rangeStart, rangeEnd] = rangeHeader.replace("bytes=", "").split("-");
    const start = Number(rangeStart) || 0;
    const requestedEnd = rangeEnd ? Number(rangeEnd) : NaN;

    if (start >= fileSize) {
      response.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
      response.end();
      return;
    }

    const end = Number.isFinite(requestedEnd)
      ? Math.min(requestedEnd, fileSize - 1)
      : Math.min(start + DEFAULT_STREAM_CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    response.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Length": contentLength,
      "Content-Type": video.mimeType || "video/mp4",
    });

    fs.createReadStream(videoPath, { start, end }).pipe(response);
  } catch (error) {
    next(error);
  }
};
