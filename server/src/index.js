import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { ensureDataFile } from "./utils/dataStore.js";
import { ensureStorageDirectories } from "./utils/storage.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
  ensureStorageDirectories();
  await ensureDataFile();

  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
