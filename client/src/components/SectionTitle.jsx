const SectionTitle = ({ eyebrow, title, description }) => (
  <div className="flex flex-col gap-3">
    <span className="pill">{eyebrow}</span>
    <div className="space-y-2">
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          {description}
        </p>
      ) : null}
    </div>
  </div>
);

export default SectionTitle;
