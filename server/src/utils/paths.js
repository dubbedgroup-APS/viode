import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

export const serverRoot = path.resolve(currentDirectory, "..", "..");
export const storageRoot = path.join(serverRoot, "storage");
export const videoStorageDir = path.join(storageRoot, "videos");
export const thumbnailStorageDir = path.join(storageRoot, "thumbnails");

