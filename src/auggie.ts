import * as core from "@actions/core";
import { Auggie } from "@augmentcode/auggie-sdk";

/**
 * Options for running Auggie agent
 */
export type RunAuggieOptions = {
  prompt: string;
  apiKey?: string;
  apiUrl?: string;
  workspaceRoot?: string;
  githubToken?: string;
};

/**
 * Run Auggie agent with the given prompt and return the response
 */
export async function runAuggie(options: RunAuggieOptions): Promise<string> {
  const { prompt, apiKey, apiUrl, workspaceRoot, githubToken } = options;

  const workspace = workspaceRoot || process.cwd();

  core.info("🤖 Initializing Auggie agent...");
  core.info(`📁 Workspace root: ${workspace}`);

  let client: Auggie | null = null;

  try {
    // Set GITHUB_API_TOKEN environment variable if provided
    if (githubToken) {
      process.env.GITHUB_API_TOKEN = githubToken;
      core.info("✅ GITHUB_API_TOKEN environment variable set");
    }

    // Create Auggie client
    client = await Auggie.create({
      model: "sonnet4.5",
      apiKey,
      apiUrl,
      workspaceRoot: workspace,
      allowIndexing: true,
    });

    core.info("📝 Sending prompt to Auggie...");

    // Send prompt and get response
    const response = await client.prompt(prompt, { isAnswerOnly: true });

    core.info("✅ Auggie agent completed successfully");

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Failed to run Auggie agent: ${errorMessage}`);
    throw error;
  } finally {
    // Always close the client
    if (client) {
      await client.close();
    }
  }
}
