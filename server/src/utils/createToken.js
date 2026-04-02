import jwt from "jsonwebtoken";

export const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "local-dev-secret", {
    expiresIn: "7d",
  });
