const EmptyState = ({ title, description, action }) => (
  <div className="glass-panel flex min-h-56 flex-col items-start justify-center gap-3 p-6">
    <span className="pill">Nothing here yet</span>
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="max-w-xl text-sm leading-6 text-slate-300">
      {description}
    </p>
    {action}
  </div>
);

export default EmptyState;

