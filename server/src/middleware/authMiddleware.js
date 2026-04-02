import jwt from "jsonwebtoken";

import { findUserById, sanitizeStoredUser } from "../utils/dataStore.js";
import { canUserUpload } from "../utils/permissions.js";

export const protect = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "local-dev-secret"
    );
    const user = await findUserById(payload.userId);

    if (!user) {
      return response.status(401).json({
        message: "User account no longer exists.",
      });
    }

    request.user = sanitizeStoredUser(user);
    request.user.canUpload = canUserUpload(request.user);
    next();
  } catch (_error) {
    response.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export const requireUploader = (request, response, next) => {
  if (request.user?.canUpload) {
    next();
    return;
  }

  response.status(403).json({
    message: "Only the owner account can upload videos.",
  });
};
