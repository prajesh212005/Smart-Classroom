import dotenv from 'dotenv';
import dbConnect from '../utils/dbConnect.js';
import { generateTimetableAlgorithmic } from '../utils/timetableGenerator.js';

dotenv.config({ quiet: true });

async function main() {
  await dbConnect();
  try {
    const req = { department: 'Computer Science', semester: 5, academicYear: '2025-26' };
    const result = await generateTimetableAlgorithmic(req);
    console.log('Created timetable:', result._id ? String(result._id) : result);
  } catch (e) {
    console.error('Error:', e.message || e);
  }
  process.exit(0);
}

main();
