#!/usr/bin/env node
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { getInput, parseRepository } from "./utils";

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const githubToken = getInput("github_token", true);
    const commentIdStr = getInput("comment_id", true);
    const eventName = getInput("event_name", true);

    // Validate comment ID
    const commentId = Number.parseInt(commentIdStr, 10);
    if (Number.isNaN(commentId)) {
      throw new Error(`Invalid comment_id: ${commentIdStr}. Must be a number.`);
    }

    const { owner, repo } = parseRepository();

    // Create Octokit instance
    const octokit = new Octokit({ auth: githubToken });

    core.info(`🎯 Reacting to comment ${commentId} with :eyes:`);
    core.info(`📦 Repository: ${owner}/${repo}`);
    core.info(`📝 Event: ${eventName}`);

    // React based on event type
    if (eventName === "pull_request_review_comment") {
      await octokit.rest.reactions.createForPullRequestReviewComment({
        owner,
        repo,
        comment_id: commentId,
        content: "eyes",
      });
    } else if (eventName === "issue_comment") {
      await octokit.rest.reactions.createForIssueComment({
        owner,
        repo,
        comment_id: commentId,
        content: "eyes",
      });
    } else {
      throw new Error(`Unsupported event type: ${eventName}`);
    }

    core.info(`✅ Successfully added :eyes: reaction to comment ${commentId}`);
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
