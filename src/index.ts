#!/usr/bin/env node
import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { runAuggie } from "./auggie";
import {
  getInput,
  parseRepository,
  postComment,
  reactToComment,
} from "./utils";

// Regex patterns for extracting issue/PR numbers from URLs
const ISSUE_URL_PATTERN = /\/issues\/(\d+)$/;
const PR_URL_PATTERN = /\/pulls\/(\d+)$/;

type GetIssueNumberParams = {
  octokit: Octokit;
  owner: string;
  repo: string;
  commentId: number;
  eventName: string;
};

/**
 * Get issue/PR number from the comment
 * For issue_comment events, we need to fetch the comment to get the issue number
 * For pull_request_review_comment events, we need to fetch the comment to get the PR number
 */
async function getIssueNumber({
  octokit,
  owner,
  repo,
  commentId,
  eventName,
}: GetIssueNumberParams): Promise<number> {
  if (eventName === "issue_comment") {
    // Fetch the comment to get the issue URL
    const { data: comment } = await octokit.rest.issues.getComment({
      owner,
      repo,
      comment_id: commentId,
    });

    // Extract issue number from the issue URL
    const issueUrlMatch = comment.issue_url.match(ISSUE_URL_PATTERN);
    if (!issueUrlMatch?.[1]) {
      throw new Error(
        `Could not extract issue number from URL: ${comment.issue_url}`
      );
    }

    return Number.parseInt(issueUrlMatch[1], 10);
  }

  if (eventName === "pull_request_review_comment") {
    // Fetch the review comment to get the PR URL
    const { data: comment } = await octokit.rest.pulls.getReviewComment({
      owner,
      repo,
      comment_id: commentId,
    });

    // Extract PR number from the pull request URL
    const prUrlMatch = comment.pull_request_url.match(PR_URL_PATTERN);
    if (!prUrlMatch?.[1]) {
      throw new Error(
        `Could not extract PR number from URL: ${comment.pull_request_url}`
      );
    }

    return Number.parseInt(prUrlMatch[1], 10);
  }

  throw new Error(`Unsupported event type: ${eventName}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const githubToken = getInput("github_token", true);
    const commentIdStr = getInput("comment_id", true);
    const eventName = getInput("event_name", true);
    const prompt = getInput("prompt", true);
    const augmentApiToken = getInput("augment_api_token");
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

    // Run Auggie agent with the prompt
    core.info("🚀 Running Auggie agent...");
    const response = await runAuggie({
      prompt,
      apiKey: augmentApiToken,
      apiUrl: augmentApiUrl,
      workspaceRoot: workspaceRoot || undefined,
    });

    // Get issue number for posting the response
    const issueNumber = await getIssueNumber({
      octokit,
      owner,
      repo,
      commentId,
      eventName,
    });

    // Post the response as a comment
    await postComment({
      octokit,
      owner,
      repo,
      issueNumber,
      body: response,
      eventName,
    });

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
