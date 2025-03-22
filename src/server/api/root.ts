import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { register } from "./procedures/register";
import { login } from "./procedures/login";
import { verifyEmail } from "./procedures/verifyEmail";
import { getProjects } from "./procedures/getProjects";
import { createProject } from "./procedures/createProject";
import { getProjectDetails } from "./procedures/getProjectDetails";
import { generateProjectOptions } from "./procedures/generateProjectOptions";
import { generatePartyScore } from "./procedures/generatePartyScore";
import { generateEnhancementQuestion } from "./procedures/generateEnhancementQuestion";
import { enhanceInterestStatement } from "./procedures/enhanceInterestStatement";
import { generateResponseSuggestions } from "./procedures/generateResponseSuggestions";
import { getObjectiveCriteria } from "./procedures/getObjectiveCriteria";
import { deleteProject } from "./procedures/deleteProject";
import { upgradeUserTier } from "./procedures/upgradeUserTier";
import { cleanupUnverifiedUsers } from "./procedures/cleanupUnverifiedUsers";
import { adminLogin } from "./procedures/adminLogin";
import { getAllUsers } from "./procedures/getAllUsers";
import { updateUserTier } from "./procedures/updateUserTier";
import { deleteUser } from "./procedures/deleteUser";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  register,
  login,
  verifyEmail,
  getProjects,
  createProject,
  getProjectDetails,
  generateProjectOptions,
  generatePartyScore,
  generateEnhancementQuestion,
  enhanceInterestStatement,
  generateResponseSuggestions,
  getObjectiveCriteria,
  deleteProject,
  upgradeUserTier,
  cleanupUnverifiedUsers,
  adminLogin,
  getAllUsers,
  updateUserTier,
  deleteUser,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);