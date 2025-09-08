import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true, 
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
