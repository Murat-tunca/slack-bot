import { Hono } from "hono";
import lookup from "./routes/lookup";
import webhook from "./routes/webhook";
import { SlackBot } from "./utils/slack";

interface Env {
	SLACK_BOT_TOKEN: string;
	SLACK_SIGNING_SECRET: string;
	SLACK_CHANNEL_ID: string;
}

const app = new Hono();

app.route("/lookup", lookup);
app.route("/webhook", webhook);

// Add scheduled message handler
export default {
	...app,
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log("Scheduled event triggered");
		console.log("Channel ID:", env.SLACK_CHANNEL_ID);

		if (!env.SLACK_BOT_TOKEN) {
			console.error("SLACK_BOT_TOKEN is not set!");
			return;
		}

		try {
			console.log("Creating SlackBot instance...");
			const slackBot = new SlackBot(env.SLACK_BOT_TOKEN);

			console.log("Preparing to send message...");
			const message =
				"https://docs.google.com/spreadsheets/d/1YHh3mc3oAxgmf34INPx1lRgJKTKy2N2o-33TIDMiufY/edit?gid=0#gid=0 DAILY LERI BURAYA YAZALIM";
			console.log("Message to send:", message);

			const result = await slackBot.sendMessage(env.SLACK_CHANNEL_ID, message);
			console.log("Message sent successfully!", result);
		} catch (error) {
			console.error("Failed to send scheduled message:", error);
			if (error instanceof Error) {
				console.error("Error name:", error.name);
				console.error("Error message:", error.message);
				console.error("Error stack:", error.stack);
			}
		}
	},
};
