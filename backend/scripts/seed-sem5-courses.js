import dotenv from 'dotenv';
import dbConnect from '../utils/dbConnect.js';
import Course from '../models/course.js';

dotenv.config({ quiet: true });

function parseArgs() {
  const args = process.argv.slice(2);
  const department = (args[0] || 'IT').trim();
  const semester = Number(args[1] || 5);
  const year = Number(args[2] || new Date().getFullYear());

  if (!department) {
    throw new Error('Department argument is empty. Usage: node scripts/seed-sem5-courses.js <DEPT> [SEM=5] [YEAR=current]');
  }
  if (!Number.isFinite(semester) || semester <= 0) {
    throw new Error('Invalid semester. Usage: node scripts/seed-sem5-courses.js <DEPT> [SEM=5] [YEAR=current]');
  }
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    throw new Error('Invalid year. Usage: node scripts/seed-sem5-courses.js <DEPT> [SEM=5] [YEAR=current]');
  }

  return { department, semester, year };
}

function buildSeedCourses({ department, semester, year }) {
  const prefix = String(department).toUpperCase();

  return [
    {
      code: `${prefix}501`,
      name: 'Database Management Systems',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
    {
      code: `${prefix}502`,
      name: 'Computer Networks',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
    {
      code: `${prefix}503`,
      name: 'Software Engineering',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
    {
      code: `${prefix}504`,
      name: 'Theory of Computation',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
    {
      code: `${prefix}505`,
      name: 'Artificial Intelligence',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
    {
      code: `${prefix}506`,
      name: 'Web Technologies',
      credits: 3,
      type: 'lecture',
      hoursPerWeek: 3,
    },
  ].map((course) => ({
    ...course,
    department,
    semester,
    year,
    description: course.description || '',
    prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
  }));
}

async function main() {
  const { department, semester, year } = parseArgs();
  await dbConnect();

  const seedCourses = buildSeedCourses({ department, semester, year });

  let inserted = 0;
  let skipped = 0;

  for (const course of seedCourses) {
    const existing = await Course.findOne({ code: course.code });
    if (existing) {
      skipped += 1;
      continue;
    }

    await Course.create(course);
    inserted += 1;
  }

  const totalSemCourses = await Course.countDocuments({ department, semester });

  console.log(
    `Seed complete for dept="${department}", semester=${semester}, year=${year}. Inserted=${inserted}, skipped(existing)=${skipped}.`,
  );
  console.log(`Total courses now for dept="${department}", semester=${semester}: ${totalSemCourses}`);
}

main().catch((err) => {
  console.error('Seed failed:', err?.message || err);
  process.exit(1);
});
