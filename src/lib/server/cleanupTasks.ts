import { db } from "@/server/db";

/**
 * Deletes unverified user accounts that are older than the specified hours
 * @param olderThanHours Number of hours after which unverified accounts should be deleted
 * @returns Object containing success status and count of deleted accounts
 */
export async function cleanupUnverifiedUsers(olderThanHours = 24): Promise<{ success: boolean; count: number }> {
  try {
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);
    
    // Delete unverified users created before the cutoff date
    const { count } = await db.user.deleteMany({
      where: {
        isVerified: false,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`Cleaned up ${count} unverified user accounts older than ${olderThanHours} hours`);
    
    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Error cleaning up unverified users:", error);
    return {
      success: false,
      count: 0,
    };
  }
}
