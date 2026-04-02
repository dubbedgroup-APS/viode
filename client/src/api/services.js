import { apiClient } from "./client";

export const login = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

export const register = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const loginWithGoogle = async (credential) => {
  const { data } = await apiClient.post("/auth/google", { credential });
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await apiClient.get("/users/me");
  return data;
};

export const fetchVideos = async () => {
  const { data } = await apiClient.get("/videos");
  return data;
};

export const fetchMyVideos = async () => {
  const { data } = await apiClient.get("/videos/mine");
  return data;
};

export const fetchVideo = async (id) => {
  const { data } = await apiClient.get(`/videos/${id}`);
  return data;
};

export const markVideoViewed = async (id) => {
  const { data } = await apiClient.post(`/videos/${id}/view`);
  return data;
};

export const saveWatchHistory = async (id) => {
  const { data } = await apiClient.post(`/videos/${id}/history`);
  return data;
};

export const uploadVideo = async (formData) => {
  const { data } = await apiClient.post("/videos/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const fetchPlaylists = async () => {
  const { data } = await apiClient.get("/playlists");
  return data;
};

export const createPlaylist = async (payload) => {
  const { data } = await apiClient.post("/playlists", payload);
  return data;
};

export const toggleVideoInPlaylist = async (playlistId, videoId) => {
  const { data } = await apiClient.patch(
    `/playlists/${playlistId}/videos/${videoId}`
  );
  return data;
};
