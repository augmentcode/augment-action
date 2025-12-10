import * as core from "@actions/core";
import { readFileSync } from "node:fs";
import type { Octokit } from "@octokit/rest";

/**
 * Get input from environment variables (GitHub Actions pattern)
 */
export function getInput(name: string, required: true): string;
export function getInput(name: string, required?: false): string | undefined;
export function getInput(name: string, required = false): string | undefined {
  const envName = `INPUT_${name.toUpperCase().replace(/ /g, "_")}`;
  const value = process.env[envName];

  if (required && !value) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  return value?.trim() || undefined;
}

/**
 * Read and parse GitHub event payload
 * Returns undefined if the event payload cannot be read
 */
function getEventPayload(): Record<string, unknown> | undefined {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    core.warning("GITHUB_EVENT_PATH not found");
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(eventPath, "utf8"));
  } catch (error) {
    core.warning(`Failed to read event payload: ${error}`);
    return undefined;
  }
}

/**
 * Extract comment ID from GitHub event payload
 * Returns undefined if the event doesn't have a comment
 */
export function getCommentIdFromEvent(): number | undefined {
  const eventData = getEventPayload();
  if (!eventData) {
    return undefined;
  }

  // Check if event has a comment object
  const comment = eventData.comment as { id?: number } | undefined;
  if (comment?.id) {
    return comment.id;
  }

  return undefined;
}

/**
 * Extract comment body from GitHub event payload
 * Returns undefined if the event doesn't have a comment
 */
export function getCommentBodyFromEvent(): string | undefined {
  const eventData = getEventPayload();
  if (!eventData) {
    return undefined;
  }

  // Check if event has a comment object with body
  const comment = eventData.comment as { body?: string } | undefined;
  if (comment?.body) {
    return comment.body;
  }

  return undefined;
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
  eventName: string;
};

/**
 * React to a comment with an emoji
 * Extracts comment ID from event payload and reacts if present
 */
export async function reactToComment({
  octokit,
  owner,
  repo,
  eventName,
}: ReactToCommentParams): Promise<void> {
  // Extract comment_id from GitHub event payload
  const commentId = getCommentIdFromEvent();

  // Only react if we have a comment ID
  if (!commentId) {
    core.info(
      `ℹ️ No comment found in event payload, skipping comment reaction (event: ${eventName})`,
    );
    return;
  }

  core.info("👀 Reacting to comment");

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

type AuggieParams = {
  githubToken: string;
  eventName: string;
  prompt: string;
  augmentApiKey: string;
  augmentApiUrl: string;
  workspaceRoot: string | undefined;
  commentBody: string | undefined;
};

export function getAuggieParams(): AuggieParams {
  const githubToken = getInput("github_token", true);
  const eventName = getInput("event_name", true);
  const prompt = getInput("prompt", true);
  const augmentApiKey = getInput("augment_api_key", true);
  const augmentApiUrl = getInput("augment_api_url", true);
  const workspaceRoot = getInput("workspace_root");
  const commentBody = getCommentBodyFromEvent();
  return {
    githubToken,
    eventName,
    prompt,
    augmentApiKey,
    augmentApiUrl,
    workspaceRoot,
    commentBody,
  }
}
