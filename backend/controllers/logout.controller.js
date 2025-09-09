import Session from "../models/Session.schema.js";

export const logout = async (req, res) => {
  try {
    const user = req.user;

    await Session.deleteOne({ user: user.id });

    res.clearCookie("ACCESS_TOKEN", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    });
    res.clearCookie("REFRESH_TOKEN", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    });

    res.status(200).send({ status: true });
  } catch (error) {
    console.log("Logout error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
