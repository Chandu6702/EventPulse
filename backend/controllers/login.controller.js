import bcrypt from "bcryptjs";
import User from "../../models/User.schema.js";
import Session from "../../models/Session.schema.js";
import { signJWT, signJWTRefresh } from "../../utils/genarateToken.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await Session.findOneAndDelete({ user: user._id });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signJWT({ id: user._id, email: user.email });
    const refreshToken = signJWTRefresh({ id: user._id, email: user.email });

    await new Session({ user: user._id, refreshToken }).save();

    res.cookie("ACCESS_TOKEN", accessToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      expires: new Date(Date.now() + 86400 * 1000),
    });
    res.cookie("REFRESH_TOKEN", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      expires: new Date(Date.now() + 15 * 86400 * 1000),
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
