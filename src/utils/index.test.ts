import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getInput, parseRepository } from "./index";

describe("getInput", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  test("should get input from environment variable", () => {
    process.env.INPUT_GITHUB_TOKEN = "test-token";
    expect(getInput("github_token")).toBe("test-token");
  });

  test("should convert input name to uppercase with underscores", () => {
    process.env.INPUT_COMMENT_ID = "123";
    expect(getInput("comment_id")).toBe("123");
  });

  test("should handle spaces in input name", () => {
    process.env.INPUT_MY_INPUT = "value";
    expect(getInput("my input")).toBe("value");
  });

  test("should trim whitespace from input value", () => {
    process.env.INPUT_TEST = "  value  ";
    expect(getInput("test")).toBe("value");
  });

  test("should return undefined for missing optional input", () => {
    expect(getInput("missing_input", false)).toBeUndefined();
  });

  test("should return undefined for missing input with no required parameter", () => {
    expect(getInput("missing_input")).toBeUndefined();
  });

  test("should throw error for missing required input", () => {
    expect(() => getInput("required_input", true)).toThrow(
      "Input required and not supplied: required_input"
    );
  });

  test("should return undefined for empty string when not required", () => {
    process.env.INPUT_OPTIONAL = "";
    expect(getInput("optional", false)).toBeUndefined();
  });

  test("should throw error for empty string when required", () => {
    process.env.INPUT_REQUIRED = "";
    expect(() => getInput("required", true)).toThrow(
      "Input required and not supplied: required"
    );
  });
});

describe("parseRepository", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  test("should parse valid repository format", () => {
    process.env.GITHUB_REPOSITORY = "owner/repo";
    const result = parseRepository();
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  test("should parse repository with hyphens and underscores", () => {
    process.env.GITHUB_REPOSITORY = "my-org/my_repo-name";
    const result = parseRepository();
    expect(result).toEqual({ owner: "my-org", repo: "my_repo-name" });
  });

  test("should throw error for missing GITHUB_REPOSITORY", () => {
    process.env.GITHUB_REPOSITORY = undefined;
    expect(() => parseRepository()).toThrow(
      "Invalid GITHUB_REPOSITORY format: . Expected format: owner/repo"
    );
  });

  test("should throw error for empty GITHUB_REPOSITORY", () => {
    process.env.GITHUB_REPOSITORY = "";
    expect(() => parseRepository()).toThrow(
      "Invalid GITHUB_REPOSITORY format: . Expected format: owner/repo"
    );
  });

  test("should throw error for repository without slash", () => {
    process.env.GITHUB_REPOSITORY = "invalid-format";
    expect(() => parseRepository()).toThrow(
      "Invalid GITHUB_REPOSITORY format: invalid-format. Expected format: owner/repo"
    );
  });

  test("should throw error for repository with only owner", () => {
    process.env.GITHUB_REPOSITORY = "owner/";
    expect(() => parseRepository()).toThrow(
      "Invalid GITHUB_REPOSITORY format: owner/. Expected format: owner/repo"
    );
  });

  test("should throw error for repository with only repo", () => {
    process.env.GITHUB_REPOSITORY = "/repo";
    expect(() => parseRepository()).toThrow(
      "Invalid GITHUB_REPOSITORY format: /repo. Expected format: owner/repo"
    );
  });

  test("should handle repository with multiple slashes (takes first two parts)", () => {
    process.env.GITHUB_REPOSITORY = "owner/repo/extra";
    const result = parseRepository();
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });
});
