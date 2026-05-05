import express from "express";
import dotenv from "dotenv";
import dbConnect from "./utils/dbConnect.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { coursesRouter, } from "./routes/coursesRoute.js";
import { facultyRouter, } from "./routes/facultyRoute.js";
import { roomsRouter, } from "./routes/roomsRoute.js";
import { timetablesRouter, } from "./routes/timetableRoute.js";
import { aiRouter, } from "./routes/aiRoute.js";
import { notificationsRouter, } from "./routes/notificationsRoute.js";
import { authRouter } from "./routes/authRoute.js";
import { classroomsRouter } from "./routes/classroomsRoute.js";

dotenv.config({ quiet: true });

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());

dbConnect();

app.use("/api/courses", coursesRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/timetables", timetablesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/classrooms", classroomsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
