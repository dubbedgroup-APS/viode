import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchVideos } from "../api/services";
import EmptyState from "../components/EmptyState.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import UploadPanel from "../components/UploadPanel.jsx";
import VideoCard from "../components/VideoCard.jsx";
import useAuth from "../hooks/useAuth";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const items = await fetchVideos();
      setVideos(items);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load videos right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();

    if (!term) {
      return videos;
    }

    return videos.filter((video) => {
      const haystack = [video.title, video.description, video.category, video.owner?.name]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [deferredSearch, videos]);

  const featuredVideo = filteredVideos[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.45fr,0.95fr]">
        <div className="glass-panel overflow-hidden p-6 sm:p-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,234,212,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_35%)]" />
            <div className="relative space-y-5">
              <span className="pill">Video streaming platform</span>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                A YouTube-style stack with local uploads, fast playback, and a soft glass UI.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Viode gives you beginner-friendly code for uploads, authentication, playlists,
                and byte-range streaming so viewers can jump through videos without downloading
                everything up front.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Videos
                  </p>
                  <p className="mt-3 text-3xl font-bold text-white">{videos.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Storage
                  </p>
                  <p className="mt-3 text-3xl font-bold text-white">Local</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Streaming
                  </p>
                  <p className="mt-3 text-3xl font-bold text-white">Range</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={featuredVideo ? `/player/${featuredVideo._id}` : "/login"} className="glass-button">
                  {featuredVideo ? "Watch featured video" : "Get started"}
                </Link>
                {!isAuthenticated ? (
                  <Link to="/login" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Sign in to watch
                  </Link>
                ) : !user?.canUpload ? (
                  <Link to="/account" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    View your history
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <SectionTitle
            eyebrow="Browse"
            title="Find something quickly"
            description="Filter by title, description, category, or creator without adding a full search service."
          />

          <label className="field-shell mt-6">
            <span>Search videos</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search uploads, creators, or categories"
            />
          </label>

          <div className="mt-6 space-y-4">
            {featuredVideo ? (
              <>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Featured now
                </p>
                <VideoCard video={featuredVideo} compact />
              </>
            ) : (
              <p className="text-sm text-slate-300">
                Upload your first video to feature it here.
              </p>
            )}
          </div>
        </div>
      </section>

      {isAuthenticated && user?.canUpload ? <UploadPanel onUploaded={loadVideos} /> : null}
      {isAuthenticated && !user?.canUpload ? (
        <div className="glass-panel p-6 text-sm leading-7 text-slate-300">
          Only the owner account can upload videos. Your account can still watch,
          save playlists, and keep a personal history.
        </div>
      ) : null}

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Latest uploads"
          title="Fresh videos from your library"
          description="This grid pulls directly from local storage metadata and links each card to the streaming player page."
        />

        {loading ? <div className="glass-panel p-6 text-slate-300">Loading videos...</div> : null}
        {error ? <div className="glass-panel p-6 text-rose-300">{error}</div> : null}
        {!loading && !error && filteredVideos.length === 0 ? (
          <EmptyState
            title="No matching videos"
            description="Try a different search term or upload something new to populate the home feed."
          />
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
