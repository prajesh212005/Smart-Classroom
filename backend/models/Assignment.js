import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    type: {
      type: String,
      enum: ["task", "assignment", "quiz", "project"],
      default: "assignment",
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", AssignmentSchema);

export default Assignment;
