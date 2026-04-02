import { Link } from "react-router-dom";

import { resolveMediaUrl } from "../api/client";

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const VideoCard = ({ video, compact = false }) => (
  <Link
    to={`/player/${video._id}`}
    className={`glass-panel group flex overflow-hidden transition hover:-translate-y-1 ${
      compact ? "flex-row gap-4 p-3" : "flex-col"
    }`}
  >
    <div
      className={`relative overflow-hidden ${
        compact ? "h-28 w-40 rounded-2xl" : "aspect-video w-full"
      }`}
    >
      {video.thumbnailPath ? (
        <img
          src={resolveMediaUrl(video.thumbnailPath)}
          alt={video.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-cyan-400/30 via-slate-900 to-amber-300/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
    </div>

    <div className={`flex flex-1 flex-col gap-2 ${compact ? "py-1 pr-2" : "p-5"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="pill">{video.category}</span>
        <span className="text-xs text-slate-400">
          {formatNumber(video.views)} views
        </span>
      </div>
      <h3 className="line-clamp-2 text-lg font-bold text-white">
        {video.title}
      </h3>
      <p className="text-sm text-slate-300">{video.owner?.name || "Unknown creator"}</p>
      <p className="line-clamp-2 text-sm leading-6 text-slate-400">
        {video.description || "No description provided yet."}
      </p>
      <p className="mt-auto text-xs uppercase tracking-[0.25em] text-slate-500">
        Uploaded {formatDate(video.createdAt)}
      </p>
    </div>
  </Link>
);

export default VideoCard;

