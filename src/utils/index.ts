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
