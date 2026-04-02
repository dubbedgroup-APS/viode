# Viode

Viode is a full-stack video streaming platform inspired by YouTube. It uses a React + Tailwind frontend, an Express backend, JWT authentication, local JSON data storage, local file storage for uploads, and byte-range streaming for smooth playback.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Multer, JWT
- Data store: local JSON file
- Storage: local filesystem in `server/storage`

## Pages

- Home
- Player
- Login
- Playlist
- Account

## Features

- Register and log in with JWT authentication
- Upload videos and optional thumbnails
- Store videos locally on disk
- Stream videos with HTTP range requests
- Create playlists and save or remove videos
- Browse the latest videos and view your uploads

## Project Structure

```text
client/   React frontend
server/   Express API, MongoDB models, upload + stream logic
```

## Environment Setup

Create these files before running the app:

### `server/.env`

```env
PORT=5000
JWT_SECRET=replace-this-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
OWNER_EMAIL=your-gmail@gmail.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### `client/.env`

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Install Dependencies

If PowerShell blocks `npm`, use `npm.cmd` instead.

```bash
npm.cmd install
npm.cmd --prefix server install
npm.cmd --prefix client install
```

You can also install from each folder directly:

```bash
cd server
npm.cmd install

cd ../client
npm.cmd install
```

## Run the App

```bash
npm.cmd --prefix server run dev
npm.cmd --prefix client run dev
```

The frontend runs on `http://localhost:5173`.

The API runs on `http://localhost:5000`.

## Google Login Setup

This project now includes Google Sign-In using Google Identity Services in the frontend and server-side ID token verification in the backend.

1. Create an OAuth 2.0 Web application client in Google Cloud.
2. Add your local frontend origins, such as:
   - `http://127.0.0.1:5173`
   - `http://localhost:5173`
3. Copy the Google client ID into:
   - `server/.env` as `GOOGLE_CLIENT_ID`
   - `client/.env` as `VITE_GOOGLE_CLIENT_ID`
4. Restart the server and client.

After that, the login page will show a Google button.

## Owner-Only Uploads

Set `OWNER_EMAIL` in `server/.env` to the Gmail address that should be allowed to upload videos.

- That one owner account can upload videos.
- Other signed-in users can only watch, save playlists, and keep their own watch history.

## Important API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### User

- `GET /api/users/me`

### Videos

- `GET /api/videos`
- `GET /api/videos/mine`
- `GET /api/videos/:id`
- `GET /api/videos/:id/stream`
- `POST /api/videos/upload`
- `POST /api/videos/:id/view`

### Playlists

- `GET /api/playlists`
- `POST /api/playlists`
- `GET /api/playlists/:id`
- `PATCH /api/playlists/:id/videos/:videoId`

## Streaming Notes

The player uses `GET /api/videos/:id/stream`, which supports byte-range requests. This improves playback because browsers can seek through large files without downloading the entire video first.

## Beginner-Friendly Notes

- Backend code is split into routes, controllers, middleware, and utilities.
- Frontend code keeps state close to the page that uses it.
- The auth flow is intentionally simple: store the JWT, attach it to requests, and refresh the profile when the app boots.
- Account data, playlists, and video metadata live in `server/storage/data.json`, so you do not need MongoDB.
