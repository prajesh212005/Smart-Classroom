import dotenv from 'dotenv';
import dbConnect from '../utils/dbConnect.js';
import Course from '../models/course.js';

dotenv.config({ quiet: true });

async function main() {
  await dbConnect();

  const deptArg = process.argv[2];
  const semArg = process.argv[3];

  if (deptArg && semArg) {
    const dept = deptArg;
    const sem = Number(semArg);
    console.log(`Looking up courses for department="${dept}", semester=${sem}`);
    const courses = await Course.find({ department: { $regex: new RegExp(`^${dept}$`, 'i') }, semester: sem });
    if (!courses || courses.length === 0) {
      console.log('No matching courses found. Listing all distinct departments and a sample of courses to help debugging:\n');
    } else {
      console.log(`Found ${courses.length} course(s):`);
      courses.forEach(c => console.log(`- ${c.name} | code:${c.code} | dept:${c.department} | sem:${c.semester}`));
      process.exit(0);
    }
  }

  // Fallback: list distinct departments and the first 20 courses
  const distinct = await Course.distinct('department');
  console.log('Distinct departments in DB:');
  distinct.forEach(d => console.log(`- ${d}`));

  const sample = await Course.find().limit(20);
  console.log('\nSample courses:');
  sample.forEach(c => console.log(`- ${c.name} | code:${c.code} | dept:${c.department} | sem:${c.semester}`));

  process.exit(0);
}

main().catch(err => {
  console.error('Error listing courses:', err);
  process.exit(1);
});
