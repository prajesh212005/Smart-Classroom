import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ quiet: true });

const CONFIRM = (process.env.CONFIRM_RESET_DB || "").trim().toUpperCase();
const MODE = (process.env.RESET_DB_MODE || "drop").trim().toLowerCase();
const RESET_UPLOADS = (process.env.RESET_UPLOADS || "").trim().toUpperCase() === "YES";

if (CONFIRM !== "YES") {
  console.error(
    "Refusing to reset DB. Set CONFIRM_RESET_DB=YES to proceed.\n" +
      "Example (PowerShell):\n" +
      "$env:CONFIRM_RESET_DB='YES'; npm run reset-db"
  );
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not set. Add it to backend/.env");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  try {
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(uploadsDir, entry.name);
        await fs.rm(fullPath, { recursive: true, force: true });
      })
    );
    console.log(`Uploads cleared: ${uploadsDir}`);
  } catch (error) {
    // If folder doesn't exist or can't be read, don't fail the DB reset.
    console.warn("Uploads cleanup skipped:", error?.message || error);
  }
};

try {
  await mongoose.connect(mongoUri);
  const dbName = mongoose.connection.name;
  console.log(`Connected to MongoDB database: ${dbName}`);

  if (MODE === "drop") {
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped successfully.");
  } else if (MODE === "truncate") {
    const collections = await mongoose.connection.db.listCollections().toArray();
    await Promise.all(collections.map((c) => mongoose.connection.db.dropCollection(c.name)));
    console.log("All collections dropped successfully.");
  } else {
    console.error(`Unknown RESET_DB_MODE: ${MODE}. Use 'drop' or 'truncate'.`);
    process.exitCode = 1;
  }

  if (RESET_UPLOADS) {
    await resetUploadsDir();
  }
} catch (error) {
  console.error("DB reset failed:", error);
  process.exitCode = 1;
} finally {
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
}
