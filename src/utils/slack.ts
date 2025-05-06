import type { Issue } from "../types";

const compact = (array: unknown[]) => array.filter((el) => el);

export const constructGhIssueSlackMessage = (
	issue: Issue,
	issue_string: string,
	prefix_text?: string,
) => {
	const issue_link = `<${issue.html_url}|${issue_string}>`;
	const user_link = `<${issue.user.html_url}|${issue.user.login}>`;
	const date = new Date(Date.parse(issue.created_at)).toLocaleDateString();

	const text_lines = [
		prefix_text,
		`*${issue.title} - ${issue_link}*`,
		issue.body,
		`*${issue.state}* - Created by ${user_link} on ${date}`,
	];

	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: compact(text_lines).join("\n"),
			},
			accessory: {
				type: "image",
				image_url: issue.user.avatar_url,
				alt_text: issue.user.login,
			},
		},
	];
};

export class SlackBot {
	constructor(private token: string) {}

	async sendMessage(channelId: string, message: string) {
		try {
			console.log("Sending message to Slack API...");
			console.log("Channel ID:", channelId);
			console.log(`Token starts with: ${this.token.substring(0, 10)}...`);

			const response = await fetch("https://slack.com/api/chat.postMessage", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.token}`,
				},
				body: JSON.stringify({
					channel: channelId,
					text: message,
				}),
			});

			const responseData = (await response.json()) as {
				ok: boolean;
				error?: string;
				message?: string;
			};
			console.log("Slack API Response:", JSON.stringify(responseData, null, 2));

			if (!response.ok) {
				throw new Error(
					`HTTP Error: ${response.status} ${response.statusText}`,
				);
			}

			if (!responseData.ok) {
				throw new Error(
					`Slack API Error: ${responseData.error || responseData.message || "Unknown error"}`,
				);
			}

			return responseData;
		} catch (error) {
			console.error("Error details in sendMessage:");
			if (error instanceof Error) {
				console.error("Error name:", error.name);
				console.error("Error message:", error.message);
				console.error("Error stack:", error.stack);
			} else {
				console.error("Unknown error:", error);
			}
			throw error;
		}
	}
}
