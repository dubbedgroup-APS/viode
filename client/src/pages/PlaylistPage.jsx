import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createPlaylist, fetchPlaylists } from "../api/services";
import EmptyState from "../components/EmptyState.jsx";
import PlaylistCard from "../components/PlaylistCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import VideoCard from "../components/VideoCard.jsx";
import useAuth from "../hooks/useAuth";

const PlaylistPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [status, setStatus] = useState({
    loading: true,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus({
        loading: false,
        error: "",
        success: "",
      });
      return;
    }

    const loadPlaylists = async () => {
      try {
        setStatus({
          loading: true,
          error: "",
          success: "",
        });
        const items = await fetchPlaylists();
        setPlaylists(items);
        setSelectedPlaylist(items[0] || null);
        setStatus({
          loading: false,
          error: "",
          success: "",
        });
      } catch (requestError) {
        setStatus({
          loading: false,
          error:
            requestError.response?.data?.message || "Could not load playlists.",
          success: "",
        });
      }
    };

    loadPlaylists();
  }, [isAuthenticated]);

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      const playlist = await createPlaylist(form);
      setPlaylists((current) => [playlist, ...current]);
      setSelectedPlaylist(playlist);
      setForm({
        name: "",
        description: "",
      });
      setStatus((current) => ({
        ...current,
        success: "Playlist created.",
        error: "",
      }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        error:
          error.response?.data?.message || "Could not create the playlist.",
        success: "",
      }));
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Playlists are part of your account"
        description="Sign in to create collections and save videos for later."
        action={
          <Link to="/login" className="glass-button">
            Go to login
          </Link>
        }
      />
    );
  }

  if (!user?.canUpload) {
    return (
      <EmptyState
        title="Only the owner can manage playlists"
        description="Viewer accounts can watch videos and keep personal history, but only the owner account can create or edit playlists."
        action={
          <Link to="/account" className="glass-button">
            Go to account
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Playlists"
        title="Organize videos into collections"
        description="Create simple, personal playlists and manage them from one page. Add or remove videos directly from the player page."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-5">
          <form className="glass-panel grid gap-4 p-6" onSubmit={handleCreate}>
            <h3 className="text-xl font-bold text-white">Create a playlist</h3>
            <label className="field-shell">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Weekend watchlist"
                required
              />
            </label>
            <label className="field-shell">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows="3"
                placeholder="A relaxed playlist for long-form videos"
              />
            </label>
            {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
            {status.success ? (
              <p className="text-sm text-emerald-300">{status.success}</p>
            ) : null}
            <button type="submit" className="glass-button justify-center">
              Save playlist
            </button>
          </form>

          {status.loading ? <div className="glass-panel p-6 text-slate-300">Loading playlists...</div> : null}

          <div className="grid gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                isActive={selectedPlaylist?._id === playlist._id}
                onSelect={setSelectedPlaylist}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Selected playlist</h3>
          {!selectedPlaylist ? (
            <EmptyState
              title="No playlist selected"
              description="Create one on the left, then add videos from the player page."
            />
          ) : (
            <>
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      {selectedPlaylist.name}
                    </h4>
                    <p className="mt-2 text-sm text-slate-300">
                      {selectedPlaylist.description || "No description for this playlist yet."}
                    </p>
                  </div>
                  <span className="pill">
                    {selectedPlaylist.videos.length} saved
                  </span>
                </div>
              </div>

              {selectedPlaylist.videos.length === 0 ? (
                <EmptyState
                  title="This playlist is empty"
                  description="Open any video and use the save-to-playlist controls to populate it."
                />
              ) : (
                <div className="grid gap-4">
                  {selectedPlaylist.videos.map((video) => (
                    <VideoCard key={video._id} video={video} compact />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PlaylistPage;
