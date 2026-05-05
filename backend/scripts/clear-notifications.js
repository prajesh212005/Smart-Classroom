import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

dotenv.config({ quiet: true });

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Add it to backend/.env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Database connected');

  const result = await Notification.deleteMany({});
  console.log(`Cleared notifications. deletedCount=${result.deletedCount ?? 0}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Clear notifications failed:', err?.message || err);
  process.exit(1);
});
