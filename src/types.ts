export type GithubPullRequest = {
  title: string;
  body: string;
  author: string;
  baseRefName: string;
  headRefName: string;
  headRefOid: string;
  additions: number;
  deletions: number;
  state: string;
}
