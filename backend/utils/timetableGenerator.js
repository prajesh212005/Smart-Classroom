import ortools from 'ts-ortools';
import Course from '../models/course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';
import Timetable from '../models/Timetable.js';
import Notification from '../models/Notification.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOT_TIMES = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
];

function normalizeDepartment(value) {
  return String(value || '').trim().toLowerCase();
}

function toPlainCourse(course) {
  return {
    _id: String(course._id),
    name: course.name,
    department: course.department,
    semester: Number(course.semester),
    hoursPerWeek: Number(course.hoursPerWeek) || 3,
    totalHours: course.totalHours == null ? null : Number(course.totalHours),
  };
}

function toPlainFaculty(faculty) {
  return {
    _id: String(faculty._id),
    name: faculty.name,
    department: faculty.department || '',
    specialization: Array.isArray(faculty.specialization) ? faculty.specialization : [],
  };
}

function toPlainRoom(room) {
  return {
    _id: String(room._id),
    name: room.name,
  };
}

function toPlainFacultyFallback() {
  return {
    _id: 'UNASSIGNED_FACULTY',
    name: 'Unassigned Faculty',
    department: 'General',
    specialization: [],
  };
}

function buildTimeSlots() {
  const slots = [];

  for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex += 1) {
    for (let periodIndex = 0; periodIndex < SLOT_TIMES.length; periodIndex += 1) {
      slots.push({
        index: slots.length,
        day: DAYS[dayIndex],
        dayIndex,
        periodIndex,
        ...SLOT_TIMES[periodIndex],
      });
    }
  }

  return slots;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCompact(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '');
}

function courseMatchesToken(course, token) {
  const compactToken = normalizeCompact(token);
  if (!compactToken) return false;

  const courseName = normalizeText(course.name);
  const courseCode = normalizeCompact(course.code);
  const nameCompact = normalizeCompact(course.name);
  const initials = courseName
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('');

  return (
    courseCode.includes(compactToken) ||
    nameCompact.includes(compactToken) ||
    initials === compactToken ||
    initials.includes(compactToken) ||
    courseName.includes(normalizeText(token))
  );
}

function parseConstraints(constraints, courses) {
  const rules = {
    coursePlacement: new Map(),
    avoidDays: new Set(),
  };

  const noteText = typeof constraints?.notes === 'string' ? constraints.notes : '';
  const lowerNotes = noteText.toLowerCase();

  if (constraints && typeof constraints === 'object') {
    if (Array.isArray(constraints.avoidDays)) {
      constraints.avoidDays.forEach((day) => rules.avoidDays.add(normalizeText(day)));
    }

    if (constraints.avoidFriday) {
      rules.avoidDays.add('friday');
    }
  }

  if (lowerNotes.includes('avoid friday') || lowerNotes.includes('no friday')) {
    rules.avoidDays.add('friday');
  }

  const placementPatterns = [
    { regex: /(.+?)\s+(?:should\s+be\s+)?(?:at\s+)?last/, placement: 'last' },
    { regex: /(.+?)\s+(?:should\s+be\s+)?(?:at\s+)?first/, placement: 'first' },
  ];

  placementPatterns.forEach(({ regex, placement }) => {
    const match = noteText.match(regex);
    if (!match || !match[1]) return;

    const token = match[1].trim();
    const matchedCourse = courses.find((course) => courseMatchesToken(course, token));
    if (matchedCourse) {
      rules.coursePlacement.set(String(matchedCourse._id), { placement });
    }
  });

  return rules;
}

function getAllowedFaculty(course, facultyList) {
  const courseDepartment = normalizeText(course.department);
  const courseName = normalizeText(course.name);

  const matches = facultyList.filter((faculty) => {
    const facultyDepartment = normalizeText(faculty.department);
    const specializations = Array.isArray(faculty.specialization) ? faculty.specialization : [];

    return (
      facultyDepartment === courseDepartment ||
      facultyDepartment.includes(courseDepartment) ||
      courseDepartment.includes(facultyDepartment) ||
      specializations.some((item) => {
        const normalizedSpecialization = normalizeText(item);
        return (
          normalizedSpecialization.includes(courseDepartment) ||
          courseDepartment.includes(normalizedSpecialization) ||
          normalizedSpecialization.includes(courseName) ||
          courseName.includes(normalizedSpecialization)
        );
      })
    );
  });

  return matches.length > 0 ? matches : facultyList;
}

function solveTimetableWithOrTools({ courses, faculty, rooms, constraints }) {
  const { operations_research } = ortools;
  const solver = operations_research.MPSolver.CreateSolver('CP_SAT');
  if (!solver) {
    throw new Error('Unable to create OR-Tools CP-SAT solver.');
  }

  const timeSlots = buildTimeSlots();
  const objective = solver.MutableObjective();
  objective.SetMinimization();
  const parsedConstraints = parseConstraints(constraints, courses);

  const assignmentVars = [];
  const missedSessionVars = [];
  const missedSessionPenalty = 10000;

  courses.forEach((course, courseIndex) => {
    const requiredSessions = Math.max(1, Number(course.hoursPerWeek) || Number(course.totalHours) || 3);
    const candidateFaculty = getAllowedFaculty(course, faculty);
    const missedSessions = solver.MakeIntVar(0, requiredSessions, `missed_sessions_${courseIndex}`);
    missedSessionVars.push({ courseIndex, missedSessions, requiredSessions });
    objective.SetCoefficient(missedSessions, missedSessionPenalty);

    timeSlots.forEach((slot) => {
      candidateFaculty.forEach((facultyMember) => {
        rooms.forEach((room) => {
          const variable = solver.MakeBoolVar(
            `course_${courseIndex}_slot_${slot.index}_faculty_${facultyMember._id}_room_${room._id}`,
          );

          assignmentVars.push({
            course,
            courseIndex,
            slot,
            facultyMember,
            room,
            variable,
          });

          const courseRule = parsedConstraints.coursePlacement.get(String(course._id)) || {};
          const isAvoidedDay = parsedConstraints.avoidDays.has(normalizeText(slot.day));

          let slotPenalty = slot.index + 1;
          if (courseRule.placement === 'last') {
            slotPenalty = timeSlots.length - slot.index;
          } else if (courseRule.placement === 'first') {
            slotPenalty = slot.index + 1;
          }

          if (isAvoidedDay) {
            slotPenalty += 1000;
          }

          objective.SetCoefficient(variable, slotPenalty);
        });
      });
    });

    const courseConstraint = solver.MakeRowConstraint(requiredSessions, requiredSessions, `course_sessions_${courseIndex}`);
    courseConstraint.SetCoefficient(missedSessions, 1);
    assignmentVars
      .filter((item) => item.courseIndex === courseIndex)
      .forEach((item) => {
        courseConstraint.SetCoefficient(item.variable, 1);
      });
  });

  timeSlots.forEach((slot) => {
    courses.forEach((course, courseIndex) => {
      const courseSlotConstraint = solver.MakeRowConstraint(0, 1, `course_slot_${courseIndex}_${slot.index}`);
      assignmentVars
        .filter((item) => item.courseIndex === courseIndex && item.slot.index === slot.index)
        .forEach((item) => {
          courseSlotConstraint.SetCoefficient(item.variable, 1);
        });
    });

    faculty.forEach((facultyMember) => {
      const facultySlotConstraint = solver.MakeRowConstraint(0, 1, `faculty_slot_${facultyMember._id}_${slot.index}`);
      assignmentVars
        .filter((item) => String(item.facultyMember._id) === String(facultyMember._id) && item.slot.index === slot.index)
        .forEach((item) => {
          facultySlotConstraint.SetCoefficient(item.variable, 1);
        });
    });

    rooms.forEach((room) => {
      const roomSlotConstraint = solver.MakeRowConstraint(0, 1, `room_slot_${room._id}_${slot.index}`);
      assignmentVars
        .filter((item) => String(item.room._id) === String(room._id) && item.slot.index === slot.index)
        .forEach((item) => {
          roomSlotConstraint.SetCoefficient(item.variable, 1);
        });
    });
  });

  const status = solver.Solve();
  const resultStatus = operations_research.MPSolver.ResultStatus;
  if (status !== resultStatus.OPTIMAL && status !== resultStatus.FEASIBLE) {
    throw new Error(`OR-Tools could not build a feasible timetable. Solver status: ${status}`);
  }

  const schedule = assignmentVars
    .filter((item) => item.variable.solution_value() > 0.5)
    .map((item) => ({
      courseId: String(item.course._id),
      facultyId: String(item.facultyMember._id),
      roomId: String(item.room._id),
      day: item.slot.day,
      startTime: item.slot.startTime,
      endTime: item.slot.endTime,
      slotIndex: item.slot.index,
    }))
    .sort((left, right) => left.slotIndex - right.slotIndex);

  return { schedule };
}

async function selectTargetCourses(requestDepartment, requestSemester, allCourses) {
  const semester = Number(requestSemester);
  return allCourses.filter(
    (course) =>
      normalizeDepartment(course.department) === normalizeDepartment(requestDepartment) && Number(course.semester) === semester,
  );
}

function enrichSchedule(schedule, courses, faculty, rooms) {
  return schedule.map((entry) => {
    const course = courses.find((item) => String(item._id) === String(entry.courseId));
    const facultyMember = faculty.find((item) => String(item._id) === String(entry.facultyId));
    const room = rooms.find((item) => String(item._id) === String(entry.roomId));

    return {
      ...entry,
      courseName: course ? course.name : 'Unknown',
      facultyName: facultyMember ? facultyMember.name : 'Unknown',
      roomName: room ? room.name : 'Unknown',
      timeSlot: `${entry.startTime}-${entry.endTime}`,
    };
  });
}

export async function generateTimetableAlgorithmic(request) {
  try {
    const { department, semester, academicYear } = request;
    if (!department || !semester || !academicYear) {
      throw new Error('Department, semester, and academic year are required.');
    }

    const allCourses = await Course.find({});
    const allFaculty = await Faculty.find({});
    const allRooms = await Room.find({});

    if (allCourses.length === 0) {
      throw new Error('No courses found in the database.');
    }

    const selectedCourses = await selectTargetCourses(department, semester, allCourses);
    if (!selectedCourses || selectedCourses.length === 0) {
      throw new Error(`No courses found for department "${department}" in semester ${semester}.`);
    }

    const selectedFaculty = allFaculty.filter(
      (faculty) => normalizeDepartment(faculty.department) === normalizeDepartment(department),
    );

    const facultyPool = (selectedFaculty.length > 0 ? selectedFaculty : (allFaculty.length > 0 ? allFaculty : [toPlainFacultyFallback()])).map(
      (item) => (item._id === 'UNASSIGNED_FACULTY' ? item : toPlainFaculty(item)),
    );
    const roomPool = (allRooms.length > 0 ? allRooms : [{ _id: 'UNASSIGNED_ROOM', name: 'Unassigned Room' }]).map(toPlainRoom);

    const solverResult = solveTimetableWithOrTools({
      courses: selectedCourses.map(toPlainCourse),
      faculty: facultyPool,
      rooms: roomPool,
      constraints: request.constraints,
    });

    const schedule = Array.isArray(solverResult.schedule) ? solverResult.schedule : [];
    if (schedule.length === 0) {
      throw new Error('OR-Tools returned an empty schedule.');
    }

    const enrichedSchedule = enrichSchedule(schedule, selectedCourses, facultyPool, roomPool);
    const totalHours = enrichedSchedule.length;
    const availableSlots = 5 * 6;
    const utilizationRate = Math.round((totalHours / availableSlots) * 100);

    const timetable = await new Timetable({
      name: `${department} - Semester ${semester} ${academicYear}`,
      department,
      semester: String(semester),
      year: Number.parseInt(academicYear, 10),
      schedule: enrichedSchedule,
      conflicts: [],
      status: 'draft',
      metadata: {
        totalHours,
        utilizationRate,
        conflictCount: 0,
      },
    }).save();

    await new Notification({
      title: 'OR-Tools Timetable Generated',
      message: `Generated timetable "${timetable.name}" with ${totalHours} entries using OR-Tools.`,
      type: 'success',
    }).save();

    return timetable;
  } catch (error) {
    console.error('Error in generateTimetableAlgorithmic:', error);

    await new Notification({
      title: 'Timetable Generation Failed',
      message: error.message || 'An unknown error occurred.',
      type: 'error',
    }).save();

    throw error;
  }
}