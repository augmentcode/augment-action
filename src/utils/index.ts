import * as core from "@actions/core";
import type { Octokit } from "@octokit/rest";

/**
 * Get input from environment variables (GitHub Actions pattern)
 */
export function getInput(name: string, required = false): string {
  const envName = `INPUT_${name.toUpperCase().replace(/ /g, "_")}`;
  const value = process.env[envName] || "";

  if (required && !value) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  return value.trim();
}

/**
 * Parse repository owner and name from GITHUB_REPOSITORY
 */
export function parseRepository(): { owner: string; repo: string } {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const [owner, repo] = repository.split("/");

  if (!(owner && repo)) {
    throw new Error(
      `Invalid GITHUB_REPOSITORY format: ${repository}. Expected format: owner/repo`
    );
  }

  return { owner, repo };
}

type ReactToCommentParams = {
  octokit: Octokit;
  owner: string;
  repo: string;
  commentId: number;
  eventName: string;
};

/**
 * React to a comment with an emoji
 */
export async function reactToComment({
  octokit,
  owner,
  repo,
  commentId,
  eventName,
}: ReactToCommentParams): Promise<void> {
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
}

type PostCommentParams = {
  octokit: Octokit;
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
  eventName: string;
};

/**
 * Post a reply comment
 */
export async function postComment({
  octokit,
  owner,
  repo,
  issueNumber,
  body,
  eventName,
}: PostCommentParams): Promise<void> {
  core.info("💬 Posting comment reply...");

  // Post comment based on event type
  if (eventName === "pull_request_review_comment") {
    // For PR review comments, we need to post as a regular issue comment
    // since we can't reply directly to review comments via API
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  } else if (eventName === "issue_comment") {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  } else {
    throw new Error(`Unsupported event type: ${eventName}`);
  }

  core.info("✅ Successfully posted comment");
}
