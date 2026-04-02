import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import SectionTitle from "../components/SectionTitle.jsx";
import useAuth from "../hooks/useAuth";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const { isAuthenticated, login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const googleButtonRef = useRef(null);

  const title =
    mode === "login"
      ? "Sign in and keep creating"
      : "Create a streaming-ready creator account";

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register(form);
      }

      setStatus({
        loading: false,
        error: "",
        success: mode === "login" ? "Signed in successfully." : "Account created.",
      });
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error.response?.data?.message || "Authentication failed. Please try again.",
        success: "",
      });
    }
  };

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setStatus({
            loading: true,
            error: "",
            success: "",
          });

          try {
            await loginWithGoogle(response.credential);
            setStatus({
              loading: false,
              error: "",
              success: "Signed in with Google successfully.",
            });
          } catch (error) {
            setStatus({
              loading: false,
              error:
                error.response?.data?.message ||
                "Google sign-in failed. Please try again.",
              success: "",
            });
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: mode === "login" ? "signin_with" : "signup_with",
        shape: "pill",
        width: 320,
      });

      return true;
    };

    if (renderGoogleButton()) {
      return;
    }

    const timer = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(timer);
      }
    }, 300);

    return () => {
      window.clearInterval(timer);
    };
  }, [loginWithGoogle, mode]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="glass-panel p-8">
        <SectionTitle
          eyebrow="Authentication"
          title={title}
          description="JWT-based auth keeps the implementation approachable: sign in, keep the token in local storage, and attach it to protected API requests."
        />

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Register
          </button>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="field-shell">
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ariana Creator"
                required
              />
            </label>
          ) : null}

          <label className="field-shell">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="creator@example.com"
              required
            />
          </label>

          <label className="field-shell">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
          {status.success ? (
            <p className="text-sm text-emerald-300">{status.success}</p>
          ) : null}

          <button
            type="submit"
            disabled={status.loading}
            className="glass-button justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {googleClientId ? (
            <div className="flex justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div ref={googleButtonRef} />
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              Add `VITE_GOOGLE_CLIENT_ID` in `client/.env` and `GOOGLE_CLIENT_ID` in
              `server/.env` to enable Google login.
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel flex flex-col justify-between gap-6 p-8">
        <div className="space-y-4">
          <span className="pill">What you get</span>
          <h3 className="text-3xl font-bold text-white">
            Everything you need for a beginner-friendly creator flow.
          </h3>
          <p className="text-sm leading-7 text-slate-300">
            Upload to local storage, stream through your Express API, organize playlists,
            and keep account state synced in a small React context.
          </p>
        </div>

        <div className="grid gap-3">
          {[
            "JWT token-based login and registration",
            "Protected upload, playlist, and account routes",
            "Simple React components instead of heavy abstractions",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
