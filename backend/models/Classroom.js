import mongoose from "mongoose";

const ClassroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    section: { type: String, trim: true, default: "A" },
    roomName: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Classroom = mongoose.model("Classroom", ClassroomSchema);

export default Classroom;
