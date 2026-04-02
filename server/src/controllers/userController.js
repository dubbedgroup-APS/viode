import {
  getUserWatchHistory,
  getPlaylistCountByOwner,
  getVideoCountByOwner,
} from "../utils/dataStore.js";

export const getCurrentUser = async (request, response, next) => {
  try {
    const [videoCount, playlistCount, history] = await Promise.all([
      getVideoCountByOwner(request.user._id),
      getPlaylistCountByOwner(request.user._id),
      getUserWatchHistory(request.user._id),
    ]);

    response.json({
      id: request.user._id,
      name: request.user.name,
      email: request.user.email,
      avatar: request.user.avatar || "",
      authProvider: request.user.authProvider || "local",
      canUpload: Boolean(request.user.canUpload),
      createdAt: request.user.createdAt,
      stats: {
        uploads: videoCount,
        playlists: playlistCount,
      },
      history,
    });
  } catch (error) {
    next(error);
  }
};
