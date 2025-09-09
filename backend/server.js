import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.isDEV === "true"
        ? process.env.DEV_FRONTEND_ORIGIN
        : process.env.PROD_FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/auth", userRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
