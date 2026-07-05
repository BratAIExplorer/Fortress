/**
 * Cron Scheduler
 *
 * Integrates with your scheduler (node-cron, etc.)
 * Runs weekly TSYS validator every Sunday 2am UTC (10:30am IST)
 */

import { runWeeklyTSYSValidator } from "./weekly-tsys-validator";

interface CronJob {
  name: string;
  schedule: string;
  handler: () => Promise<{ success: boolean; [key: string]: any }>;
  description: string;
}

export const FORTRESS_CRON_JOBS: CronJob[] = [
  {
    name: "weekly-tsys-validator",
    schedule: "0 2 * * 0", // Sunday 2am UTC
    handler: runWeeklyTSYSValidator,
    description: "Weekly TSYS validation: Claude analyzes market signals, updates conviction",
  },
  // Add other cron jobs here (scanner, etc.)
];

/**
 * Initialize cron jobs (call from server startup)
 *
 * Usage in your main server file:
 * import { initializeCronJobs } from "@/lib/jobs/cron-scheduler";
 * initializeCronJobs();
 */
export async function initializeCronJobs() {
  console.log("[Cron Scheduler] Initializing Fortress cron jobs...");

  // Example using node-cron (install: npm install node-cron)
  try {
    const cron = require("node-cron");

    FORTRESS_CRON_JOBS.forEach((job) => {
      cron.schedule(job.schedule, async () => {
        console.log(`[Cron] Running: ${job.name}`);
        const result = await job.handler();
        console.log(`[Cron] ${job.name} completed:`, result);
      });

      console.log(`[Cron] Scheduled: ${job.name} (${job.schedule})`);
    });

    console.log("[Cron Scheduler] ✅ All jobs initialized");
  } catch (error) {
    console.error("[Cron Scheduler] Error initializing:", error);
  }
}

/**
 * Manual trigger (for testing)
 * Usage: POST /api/admin/run-cron?job=weekly-tsys-validator
 */
export async function triggerCronJob(jobName: string) {
  const job = FORTRESS_CRON_JOBS.find((j) => j.name === jobName);
  if (!job) throw new Error(`Cron job not found: ${jobName}`);

  console.log(`[Cron] Manually triggering: ${jobName}`);
  return job.handler();
}
