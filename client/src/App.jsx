import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./layouts/AppShell.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PlayerPage from "./pages/PlayerPage.jsx";
import PlaylistPage from "./pages/PlaylistPage.jsx";

const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player/:id" element={<PlayerPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/playlists" element={<PlaylistPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppShell>
);

export default App;
