import multer from "multer";
import path from "path";

import {
  thumbnailStorageDir,
  videoStorageDir,
} from "./paths.js";

const storage = multer.diskStorage({
  destination: (_request, file, callback) => {
    const targetDirectory =
      file.fieldname === "thumbnail" ? thumbnailStorageDir : videoStorageDir;

    callback(null, targetDirectory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    const sanitizedName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    callback(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizedName}${extension}`
    );
  },
});

const fileFilter = (_request, file, callback) => {
  if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
    callback(null, true);
    return;
  }

  if (file.fieldname === "thumbnail" && file.mimetype.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error(`Unsupported file type for ${file.fieldname}.`));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
  fileFilter,
});

export const uploadVideoAssets = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
