import jwt from "jsonwebtoken";
import Session from "../schema/Session.schema.js";
import { signJWT } from "../utils/generateJWT.utils.js";

async function verifyJWT(req, res, next) {
  try {
    const ACCESS_TOKEN = req.cookies.ACCESS_TOKEN;
    const REFRESH_TOKEN = req.cookies.REFRESH_TOKEN;

    if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(
        ACCESS_TOKEN,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (err) {
      decodedAccessToken = null;
    }

    if (decodedAccessToken) {
      const session = await Session.findOne({
        user: decodedAccessToken.id,
        refreshToken: REFRESH_TOKEN,
      });
      if (!session) {
        return res.status(401).json({ message: "Session not found" });
      }
      req.user = decodedAccessToken; // { id, email }
      return next();
    }

    // Refresh token validation
    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(
        REFRESH_TOKEN,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const session = await Session.findOne({
      user: decodedRefreshToken.id,
      refreshToken: REFRESH_TOKEN,
    });

    if (!session) {
      res.clearCookie("ACCESS_TOKEN");
      res.clearCookie("REFRESH_TOKEN");
      return res.status(401).json({ message: "Session not found" });
    }

    const newAccessToken = signJWT({
      id: decodedRefreshToken.id,
      email: decodedRefreshToken.email,
    });
    res.cookie("ACCESS_TOKEN", newAccessToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      expires: new Date(Date.now() + 86400 * 1000),
    });

    req.user = decodedRefreshToken;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.clearCookie("ACCESS_TOKEN");
    res.clearCookie("REFRESH_TOKEN");
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export { verifyJWT };
