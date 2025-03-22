import { db } from "../src/server/db";
import { cleanupUnverifiedUsers } from "../src/lib/server/cleanupTasks";

// Default to 24 hours if not specified
const olderThanHours = process.argv[2] ? parseInt(process.argv[2], 10) : 24;

async function main() {
  console.log(`Starting cleanup of unverified users older than ${olderThanHours} hours...`);
  
  try {
    const result = await cleanupUnverifiedUsers(olderThanHours);
    
    if (result.success) {
      console.log(`Successfully deleted ${result.count} unverified user accounts.`);
    } else {
      console.error("Failed to clean up unverified users.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
