import { Hono } from "hono";
import { constructGhIssueSlackMessage } from "../utils/slack";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

app.post("/", async (c) => {
	const { action, issue, repository } = await c.req.json();
	const prefix_text = `An issue was ${action}:`;
	const issue_string = `${repository.owner.login}/${repository.name}#${issue.number}`;
	const blocks = constructGhIssueSlackMessage(issue, issue_string, prefix_text);

	const fetchResponse = await fetch(c.env.SLACK_WEBHOOK_URL, {
		body: JSON.stringify({ blocks }),
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	if (!fetchResponse.ok) throw new Error();

	return c.text("OK");
});

app.onError((_e, c) => {
	return c.json(
		{
			message: "Unable to handle webhook",
		},
		500,
	);
});

export default app;
