import { useState } from "react";

import { uploadVideo } from "../api/services";

const initialForm = {
  title: "",
  description: "",
  category: "General",
  tags: "",
  video: null,
  thumbnail: null,
};

const UploadPanel = ({ onUploaded }) => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.video) {
      setStatus({
        loading: false,
        error: "Choose a video file before uploading.",
        success: "",
      });
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("tags", form.tags);
    payload.append("video", form.video);

    if (form.thumbnail) {
      payload.append("thumbnail", form.thumbnail);
    }

    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const result = await uploadVideo(payload);

      setStatus({
        loading: false,
        error: "",
        success: "Upload complete. Your video is ready to stream.",
      });
      setForm(initialForm);
      onUploaded?.(result.video);
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error.response?.data?.message || "Upload failed. Please try again.",
        success: "",
      });
    }
  };

  return (
    <form className="glass-panel grid gap-4 p-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Upload a new video</h3>
          <p className="mt-1 text-sm text-slate-300">
            Videos are stored locally and streamed with range requests.
          </p>
        </div>
        <span className="pill">Creator tools</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-shell md:col-span-2">
          <span>Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Build a cinematic travel vlog"
            required
          />
        </label>

        <label className="field-shell md:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Tell viewers what this video is about."
          />
        </label>

        <label className="field-shell">
          <span>Category</span>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Education"
          />
        </label>

        <label className="field-shell">
          <span>Tags</span>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="react, tutorial, streaming"
          />
        </label>

        <label className="field-shell">
          <span>Video file</span>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleChange}
            required
          />
        </label>

        <label className="field-shell">
          <span>Thumbnail</span>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      </div>

      {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
      {status.success ? (
        <p className="text-sm text-emerald-300">{status.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={status.loading}
        className="glass-button justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.loading ? "Uploading..." : "Publish video"}
      </button>
    </form>
  );
};

export default UploadPanel;

