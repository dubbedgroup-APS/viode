import {
  createPlaylistRecord,
  getPlaylistById as getStoredPlaylistById,
  getPlaylistsByOwner,
  togglePlaylistVideo,
} from "../utils/dataStore.js";

export const getPlaylists = async (request, response, next) => {
  try {
    const playlists = await getPlaylistsByOwner(request.user._id);

    response.json(playlists);
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (request, response, next) => {
  try {
    const playlist = await getStoredPlaylistById(
      request.params.id,
      request.user._id
    );

    if (!playlist) {
      return response.status(404).json({
        message: "Playlist not found.",
      });
    }

    response.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const createPlaylist = async (request, response, next) => {
  try {
    const { name, description = "" } = request.body;

    if (!name) {
      return response.status(400).json({
        message: "Playlist name is required.",
      });
    }

    const playlist = await createPlaylistRecord({
      name: name.trim(),
      description: description.trim(),
      owner: request.user._id,
    });

    response.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const toggleVideoInPlaylist = async (request, response, next) => {
  try {
    const result = await togglePlaylistVideo({
      playlistId: request.params.id,
      ownerId: request.user._id,
      videoId: request.params.videoId,
    });

    if (result.status === "playlist-not-found") {
      return response.status(404).json({
        message: "Playlist not found.",
      });
    }

    if (result.status === "video-not-found") {
      return response.status(404).json({
        message: "Video not found.",
      });
    }

    response.json({
      message: result.status === "removed"
        ? "Video removed from playlist."
        : "Video added to playlist.",
      playlist: result.playlist,
    });
  } catch (error) {
    next(error);
  }
};
