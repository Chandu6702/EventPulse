import jwt from "jsonwebtoken";

export const signJWT = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

export const signJWTRefresh = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
