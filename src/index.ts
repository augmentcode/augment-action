#!/usr/bin/env node
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { runAuggie } from "./auggie";
import { getInput, parseRepository, reactToComment } from "./utils";

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const githubToken = getInput("github_token", true);
    const commentIdStr = getInput("comment_id", true);
    const eventName = getInput("event_name", true);
    const prompt = getInput("prompt", true);
    const augmentApiKey = getInput("augment_api_key");
    const augmentApiUrl = getInput("augment_api_url");
    const workspaceRoot = getInput("workspace_root");

    // Validate comment ID
    const commentId = Number.parseInt(commentIdStr, 10);
    if (Number.isNaN(commentId)) {
      throw new Error(`Invalid comment_id: ${commentIdStr}. Must be a number.`);
    }

    const { owner, repo } = parseRepository();

    // Create Octokit instance
    const octokit = new Octokit({ auth: githubToken });

    // React to the comment to acknowledge receipt
    await reactToComment({ octokit, owner, repo, commentId, eventName });

    // Log GITHUB_STEP_SUMMARY availability
    const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (stepSummaryPath) {
      core.info(`📊 GITHUB_STEP_SUMMARY available at: ${stepSummaryPath}`);
    } else {
      core.warning("⚠️ GITHUB_STEP_SUMMARY not available");
    }

    // Run Auggie agent with the prompt
    core.info("🚀 Running Auggie agent...");
    await runAuggie({
      userPrompt: prompt,
      apiKey: augmentApiKey,
      apiUrl: augmentApiUrl,
      workspaceRoot: workspaceRoot || undefined,
      githubToken,
    });

    core.info("✅ Auggie agent completed successfully");
    core.setOutput("success", "true");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
    core.setOutput("success", "false");
  }
}

// Run the action
main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  core.setFailed(`Unexpected error: ${errorMessage}`);
});
