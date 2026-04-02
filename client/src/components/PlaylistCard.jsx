const PlaylistCard = ({ playlist, isActive, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(playlist)}
    className={`glass-panel flex w-full flex-col gap-3 p-5 text-left transition ${
      isActive ? "ring-2 ring-accent/60" : "hover:-translate-y-1"
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-white">{playlist.name}</h3>
      <span className="pill">{playlist.videos.length} videos</span>
    </div>
    <p className="text-sm text-slate-300">
      {playlist.description || "A custom playlist for your favorite uploads."}
    </p>
  </button>
);

export default PlaylistCard;

