import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { storageRoot } from "./paths.js";

const dataFilePath = path.join(storageRoot, "data.json");

const defaultData = {
  users: [],
  videos: [],
  playlists: [],
};

const sortByNewest = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(right.updatedAt || right.createdAt).getTime() -
      new Date(left.updatedAt || left.createdAt).getTime()
  );

export const ensureDataFile = async () => {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2));
  }
};

const readData = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, "utf8");
  return raw ? JSON.parse(raw) : { ...defaultData };
};

const writeData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

const nowIso = () => new Date().toISOString();

const createBaseRecord = (payload) => ({
  _id: randomUUID(),
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...payload,
});

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const enrichVideo = (video, users) => ({
  ...video,
  owner: sanitizeUser(users.find((user) => user._id === video.owner)) || null,
});

const enrichPlaylist = (playlist, users, videos) => ({
  ...playlist,
  owner:
    sanitizeUser(users.find((user) => user._id === playlist.owner)) || null,
  videos: playlist.videos
    .map((videoId) => videos.find((video) => video._id === videoId))
    .filter(Boolean)
    .map((video) => enrichVideo(video, users)),
});

const normalizeHistoryEntries = (history = []) =>
  [...history]
    .filter((entry) => entry?.videoId)
    .sort(
      (left, right) =>
        new Date(right.watchedAt).getTime() - new Date(left.watchedAt).getTime()
    );

const enrichHistory = (history, users, videos) =>
  normalizeHistoryEntries(history)
    .map((entry) => {
      const video = videos.find((item) => item._id === entry.videoId);

      if (!video) {
        return null;
      }

      return {
        video: enrichVideo(video, users),
        watchedAt: entry.watchedAt,
      };
    })
    .filter(Boolean);

export const findUserByEmail = async (email) => {
  const data = await readData();
  return data.users.find((user) => user.email === email) || null;
};

export const findUserByGoogleId = async (googleId) => {
  const data = await readData();
  return data.users.find((user) => user.googleId === googleId) || null;
};

export const findUserById = async (userId) => {
  const data = await readData();
  return data.users.find((user) => user._id === userId) || null;
};

export const createUser = async ({
  name,
  email,
  password = "",
  authProvider = "local",
  googleId = "",
  avatar = "",
}) => {
  const data = await readData();
  const user = createBaseRecord({
    name,
    email,
    password,
    authProvider,
    googleId,
    avatar,
    history: [],
  });

  data.users.push(user);
  await writeData(data);
  return user;
};

export const updateUser = async (userId, updates) => {
  const data = await readData();
  const user = data.users.find((item) => item._id === userId);

  if (!user) {
    return null;
  }

  Object.assign(user, updates, {
    updatedAt: nowIso(),
  });

  await writeData(data);
  return user;
};

export const getUserWatchHistory = async (userId) => {
  const data = await readData();
  const user = data.users.find((item) => item._id === userId);

  if (!user) {
    return [];
  }

  return enrichHistory(user.history || [], data.users, data.videos);
};

export const addVideoToHistory = async (userId, videoId) => {
  const data = await readData();
  const user = data.users.find((item) => item._id === userId);
  const video = data.videos.find((item) => item._id === videoId);

  if (!user || !video) {
    return null;
  }

  const watchedAt = nowIso();
  const existingHistory = Array.isArray(user.history) ? user.history : [];

  user.history = [
    { videoId, watchedAt },
    ...existingHistory.filter((entry) => entry.videoId !== videoId),
  ].slice(0, 50);
  user.updatedAt = watchedAt;

  await writeData(data);

  return enrichHistory(user.history, data.users, data.videos);
};

export const getVideoCountByOwner = async (ownerId) => {
  const data = await readData();
  return data.videos.filter((video) => video.owner === ownerId).length;
};

export const getPlaylistCountByOwner = async (ownerId) => {
  const data = await readData();
  return data.playlists.filter((playlist) => playlist.owner === ownerId).length;
};

export const getAllVideos = async () => {
  const data = await readData();
  return sortByNewest(data.videos).map((video) => enrichVideo(video, data.users));
};

export const getVideosByOwner = async (ownerId) => {
  const data = await readData();
  return sortByNewest(
    data.videos.filter((video) => video.owner === ownerId)
  ).map((video) => enrichVideo(video, data.users));
};

export const getVideoById = async (videoId) => {
  const data = await readData();
  const video = data.videos.find((item) => item._id === videoId);
  return video ? enrichVideo(video, data.users) : null;
};

export const getRawVideoById = async (videoId) => {
  const data = await readData();
  return data.videos.find((item) => item._id === videoId) || null;
};

export const createVideo = async (payload) => {
  const data = await readData();
  const video = createBaseRecord({
    ...payload,
    views: 0,
  });

  data.videos.push(video);
  await writeData(data);

  return enrichVideo(video, data.users);
};

export const incrementVideoViews = async (videoId) => {
  const data = await readData();
  const video = data.videos.find((item) => item._id === videoId);

  if (!video) {
    return null;
  }

  video.views += 1;
  video.updatedAt = nowIso();
  await writeData(data);

  return video;
};

export const getPlaylistsByOwner = async (ownerId) => {
  const data = await readData();
  return sortByNewest(
    data.playlists.filter((playlist) => playlist.owner === ownerId)
  ).map((playlist) => enrichPlaylist(playlist, data.users, data.videos));
};

export const getPlaylistById = async (playlistId, ownerId) => {
  const data = await readData();
  const playlist = data.playlists.find(
    (item) => item._id === playlistId && item.owner === ownerId
  );

  return playlist ? enrichPlaylist(playlist, data.users, data.videos) : null;
};

export const createPlaylistRecord = async ({ name, description, owner }) => {
  const data = await readData();
  const playlist = createBaseRecord({
    name,
    description,
    owner,
    videos: [],
  });

  data.playlists.push(playlist);
  await writeData(data);
  return enrichPlaylist(playlist, data.users, data.videos);
};

export const togglePlaylistVideo = async ({ playlistId, ownerId, videoId }) => {
  const data = await readData();
  const playlist = data.playlists.find(
    (item) => item._id === playlistId && item.owner === ownerId
  );

  if (!playlist) {
    return { playlist: null, status: "playlist-not-found" };
  }

  const video = data.videos.find((item) => item._id === videoId);

  if (!video) {
    return { playlist: null, status: "video-not-found" };
  }

  const alreadySaved = playlist.videos.includes(videoId);

  if (alreadySaved) {
    playlist.videos = playlist.videos.filter((item) => item !== videoId);
  } else {
    playlist.videos.unshift(videoId);
  }

  playlist.updatedAt = nowIso();
  await writeData(data);

  return {
    playlist: enrichPlaylist(playlist, data.users, data.videos),
    status: alreadySaved ? "removed" : "added",
  };
};

export const sanitizeStoredUser = sanitizeUser;
