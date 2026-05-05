import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, trim: true },
    workText: { type: String, trim: true, default: "" },
    attachments: {
      type: [
        {
          originalName: { type: String, required: true },
          fileName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", SubmissionSchema);

export default Submission;
