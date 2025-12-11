#!/usr/bin/env node
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { runAuggie } from "./auggie";
import {
	getAuggieParams,
	parseRepository,
	reactToComment,
} from "./utils";

/**
 * Main function
 */
async function main(): Promise<void> {
	const {
		eventName,
		prompt,
		augmentApiKey,
		augmentApiUrl,
		workspaceRoot,
		commentBody,
	} = getAuggieParams();
	const { owner, repo } = parseRepository();
	const githubToken = process.env.GITHUB_TOKEN;
	const octokit = new Octokit({ auth: githubToken });


	await reactToComment({ octokit, owner, repo, eventName });

	core.info("Running Auggie agent...");
	await runAuggie({
		userPrompt: prompt,
		apiKey: augmentApiKey,
		apiUrl: augmentApiUrl,
		workspaceRoot: workspaceRoot || undefined,
		commentBody,
	});

	core.info("✅ Auggie agent completed successfully");
	core.setOutput("success", "true");
}

// Run the action
main().catch((error) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	core.setFailed(`Unexpected error: ${errorMessage}`);
});
