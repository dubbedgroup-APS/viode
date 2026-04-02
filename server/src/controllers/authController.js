import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { createToken } from "../utils/createToken.js";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  sanitizeStoredUser,
  updateUser,
} from "../utils/dataStore.js";
import { canUserUpload } from "../utils/permissions.js";

const googleClient = new OAuth2Client();

export const registerUser = async (request, response, next) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return response.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return response.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const safeUser = sanitizeStoredUser(user);

    response.status(201).json({
      message: "Account created successfully.",
      token: createToken(user._id),
      user: {
        id: safeUser._id,
        name: safeUser.name,
        email: safeUser.email,
        avatar: safeUser.avatar || "",
        authProvider: safeUser.authProvider || "local",
        canUpload: canUserUpload(safeUser),
        createdAt: safeUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.password) {
      return response.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    response.json({
      message: "Signed in successfully.",
      token: createToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        authProvider: user.authProvider || "local",
        canUpload: canUserUpload(user),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginWithGoogle = async (request, response, next) => {
  try {
    const { credential } = request.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return response.status(500).json({
        message: "GOOGLE_CLIENT_ID is missing on the server.",
      });
    }

    if (!credential) {
      return response.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      return response.status(400).json({
        message: "Google account details are incomplete.",
      });
    }

    if (!payload.email_verified) {
      return response.status(400).json({
        message: "Google email is not verified.",
      });
    }

    const normalizedEmail = payload.email.toLowerCase();
    let user = await findUserByGoogleId(payload.sub);

    if (!user) {
      user = await findUserByEmail(normalizedEmail);
    }

    if (user) {
      user = await updateUser(user._id, {
        googleId: payload.sub,
        authProvider: "google",
        avatar: payload.picture || user.avatar || "",
        name: user.name || payload.name || "Google User",
      });
    } else {
      user = await createUser({
        name: payload.name || "Google User",
        email: normalizedEmail,
        password: "",
        authProvider: "google",
        googleId: payload.sub,
        avatar: payload.picture || "",
      });
    }

    const safeUser = sanitizeStoredUser(user);

    response.json({
      message: "Signed in with Google successfully.",
      token: createToken(user._id),
      user: {
        id: safeUser._id,
        name: safeUser.name,
        email: safeUser.email,
        avatar: safeUser.avatar || "",
        authProvider: safeUser.authProvider || "google",
        canUpload: canUserUpload(safeUser),
        createdAt: safeUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
