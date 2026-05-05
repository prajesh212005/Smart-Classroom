import { Router } from "express";
import Classroom from "../models/Classroom.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Notification from "../models/Notification.js";
import { User } from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

export const classroomsRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 15 * 1024 * 1024,
  },
});

const maybeUploadFiles = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    return upload.array("files", 10)(req, res, next);
  }
  return next();
};

classroomsRouter.get("/", async (_req, res) => {
  try {
    const classrooms = await Classroom.find().sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({ error: "Failed to fetch classrooms" });
  }
});

// Pending tasks for a student: assignments with a due date that are not yet submitted by the student.
// Counts only assignments that are still open and whose dueDate is in the future.
// Query params:
// - studentId (optional but preferred)
// - studentName (optional fallback)
classroomsRouter.get("/pending-tasks", async (req, res) => {
  try {
    const studentId = (req.query?.studentId || "").toString().trim();
    const studentName = (req.query?.studentName || "").toString().trim();

    if (!studentId && !studentName) {
      return res.status(400).json({ error: "studentId or studentName is required" });
    }

    const now = new Date();
    const assignments = await Assignment.find({
      status: "open",
      dueDate: { $gte: now },
    }).select("_id");

    if (!assignments.length) return res.json({ pendingTasks: 0 });

    const assignmentIds = assignments.map((a) => a._id);
    const identityOr = [];
    if (studentId) identityOr.push({ studentId });
    if (studentName) identityOr.push({ studentName });

    const submitted = await Submission.find({
      assignmentId: { $in: assignmentIds },
      $or: identityOr,
    }).select("assignmentId");

    const submittedAssignmentIds = new Set(submitted.map((s) => String(s.assignmentId)));
    const pendingTasks = assignments.reduce((acc, a) => acc + (submittedAssignmentIds.has(String(a._id)) ? 0 : 1), 0);

    res.json({ pendingTasks });
  } catch (error) {
    console.error("Error computing pending tasks:", error);
    res.status(500).json({ error: "Failed to compute pending tasks" });
  }
});

classroomsRouter.get("/:id", async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });
    res.json(classroom);
  } catch (error) {
    console.error("Error fetching classroom:", error);
    res.status(500).json({ error: "Failed to fetch classroom" });
  }
});

classroomsRouter.post("/", async (req, res) => {
  try {
    const classroom = new Classroom(req.body);
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ error: "Failed to create classroom" });
  }
});

classroomsRouter.put("/:id", async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });
    res.json(classroom);
  } catch (error) {
    console.error("Error updating classroom:", error);
    res.status(500).json({ error: "Failed to update classroom" });
  }
});

classroomsRouter.delete("/:id", async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const assignments = await Assignment.find({ classroomId: req.params.id }).select("_id");
    const assignmentIds = assignments.map((a) => a._id);

    await Submission.deleteMany({ classroomId: req.params.id });
    if (assignmentIds.length) {
      await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });
    }
    await Assignment.deleteMany({ classroomId: req.params.id });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting classroom:", error);
    res.status(500).json({ error: "Failed to delete classroom" });
  }
});

classroomsRouter.get("/:id/assignments", async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const assignments = await Assignment.find({ classroomId: req.params.id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

classroomsRouter.post("/:id/assignments", async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const assignment = new Assignment({
      ...req.body,
      classroomId: req.params.id,
    });
    await assignment.save();

    // Notify all users (students) that a new assignment has been posted.
    const due = assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "—";
    const classroomLabel = classroom?.name ? String(classroom.name) : "a classroom";
    await Notification.create({
      title: `New assignment: ${assignment.title}`,
      message: `A new assignment was posted in ${classroomLabel}. Due: ${due}.`,
      type: "info",
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

classroomsRouter.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.assignmentId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

classroomsRouter.delete("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    await Submission.deleteMany({ assignmentId: req.params.assignmentId });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

classroomsRouter.get("/assignments/:assignmentId/submissions", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const submissions = await Submission.find({ assignmentId: req.params.assignmentId }).sort({ submittedAt: -1 });

    // Ensure faculty/students see only the latest submission per student for an assignment.
    // This prevents duplicate rows/files when a student resubmits.
    const seen = new Set();
    const latestOnly = [];
    for (const s of submissions) {
      const key = s.studentId ? `id:${s.studentId}` : `name:${s.studentName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      latestOnly.push(s);
    }

    res.json(latestOnly);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

classroomsRouter.post("/assignments/:assignmentId/submissions", maybeUploadFiles, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const attachments = (req.files || []).map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }));

    let studentName = (req.body?.studentName || "").toString().trim();
    const studentId = (req.body?.studentId || "").toString().trim();
    const workText = (req.body.workText || "").toString().trim();

    if (!studentName && studentId) {
      try {
        const user = await User.findById(studentId).select("name");
        if (user?.name) studentName = String(user.name).trim();
      } catch {
        // ignore lookup/cast errors
      }
    }

    if (!studentName) return res.status(400).json({ error: "studentName is required" });
    if (!workText && attachments.length === 0) {
      return res.status(400).json({ error: "Provide workText or attach at least one file" });
    }

    const assignmentId = req.params.assignmentId;
    const classroomId = assignment.classroomId;

    // Treat submission as unique per (assignmentId + studentId) when available, else fallback to name.
    const identityFilter = studentId
      ? { assignmentId, studentId }
      : { assignmentId, studentName };

    // If the student already submitted, overwrite the previous submission rather than creating duplicates.
    const existing = await Submission.findOne(identityFilter).sort({ submittedAt: -1 });
    if (existing) {
      // Best-effort cleanup of old uploaded files so they don't remain downloadable.
      for (const att of existing.attachments || []) {
        if (!att?.fileName) continue;
        const filePath = path.join(uploadsDir, att.fileName);
        fs.promises.unlink(filePath).catch(() => undefined);
      }

      existing.studentName = studentName;
      existing.studentId = studentId;
      existing.workText = workText;
      existing.attachments = attachments;
      existing.submittedAt = new Date();
      existing.status = "submitted";
      existing.marksObtained = null;
      existing.feedback = "";

      await existing.save();

      // Remove any older duplicates that might already exist.
      await Submission.deleteMany({ ...identityFilter, _id: { $ne: existing._id } });

      return res.status(200).json(existing);
    }

    const submission = new Submission({
      studentName,
      studentId,
      workText,
      attachments,
      assignmentId,
      classroomId,
      submittedAt: new Date(),
      status: "submitted",
    });

    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Failed to create submission" });
  }
});

// Unsubmit: delete a submission (and its uploaded files) so faculty can no longer see it.
classroomsRouter.delete("/submissions/:submissionId", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    for (const att of submission.attachments || []) {
      if (!att?.fileName) continue;
      const filePath = path.join(uploadsDir, att.fileName);
      fs.promises.unlink(filePath).catch(() => undefined);
    }

    await Submission.findByIdAndDelete(req.params.submissionId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

classroomsRouter.put("/submissions/:submissionId/grade", async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        marksObtained,
        feedback: feedback || "",
        status: "graded",
      },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json(submission);
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({ error: "Failed to grade submission" });
  }
});
