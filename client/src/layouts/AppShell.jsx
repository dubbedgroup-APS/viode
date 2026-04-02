import { NavLink } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const linkClassName = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

const AppShell = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-ink bg-hero-orbs text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(8,47,73,0.6),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-20 mb-8 flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <NavLink to="/" className="text-2xl font-extrabold tracking-tight text-white">
              Viode
            </NavLink>
            <p className="text-sm text-slate-300">
              Stream locally stored videos with a polished creator workflow.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" className={linkClassName}>
              Home
            </NavLink>
            <NavLink to="/playlists" className={linkClassName}>
              Playlist
            </NavLink>
            <NavLink to="/account" className={linkClassName}>
              Account
            </NavLink>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Sign out {user?.name ? `, ${user.name}` : ""}
              </button>
            ) : (
              <NavLink to="/login" className={linkClassName}>
                Login
              </NavLink>
            )}
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
