import { runScheduledDatabaseBackup } from "@/lib/backups/runner";
import { runDriveTrashRetention } from "@/lib/drive/retention";
import { runAccountRetention } from "@/lib/accounts/deletion";
import { runJmapChangeRetention } from "@/lib/jmap/changes";
import { sweepOrphanedRawMail } from "@/lib/email/raw-sweeper";

/**
 * Daily maintenance at 02:00 UTC, matching the daily cron trigger in wrangler.jsonc.
 * The per-minute reminders and cleanup jobs are intentionally not scheduled on
 * this installation.
 */
export function startScheduler(env: CloudflareEnv) {
	let lastRunDay = "";
	const timer = setInterval(() => {
		const now = new Date();
		const day = now.toISOString().slice(0, 10);
		if (now.getUTCHours() !== 2 || lastRunDay === day) return;
		lastRunDay = day;
		runScheduledDatabaseBackup(env, now).catch((error) => console.error("Scheduled backup failed", error));
		runDriveTrashRetention(env, now).catch((error) => console.error("Drive trash retention failed", error));
		runAccountRetention(env, now).catch((error) => console.error("Account retention failed", error));
		runJmapChangeRetention(env, now).catch((error) => console.error("JMAP change retention failed", error));
		sweepOrphanedRawMail(env, now).catch((error) => console.error("Raw mail sweep failed", error));
	}, 60_000);
	return () => clearInterval(timer);
}
