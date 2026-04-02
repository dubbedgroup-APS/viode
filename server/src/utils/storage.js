import fs from "fs";
import path from "path";

import {
  storageRoot,
  thumbnailStorageDir,
  videoStorageDir,
} from "./paths.js";

export const ensureStorageDirectories = () => {
  [storageRoot, videoStorageDir, thumbnailStorageDir].forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });
};

export const publicFilePath = (folderName, fileName) => `/${folderName}/${fileName}`;

export const resolveStoredPath = (publicPath) => {
  const normalizedPath = publicPath.replace(/^\//, "");
  return path.join(storageRoot, normalizedPath);
};

