# Augment Action

A GitHub Action that runs the Auggie AI agent to respond to issue and PR comments.

## Usage

```yaml
name: Auggie Bot

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  auggie:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, '@auggie')
    steps:
      - uses: actions/checkout@v4

      - uses: augmentcode/augment-action@main
        with:
          prompt: ${{ github.event.comment.body }}
          augment_api_key: ${{ secrets.AUGMENT_API_KEY }}
```

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `prompt` | The prompt to send to the Auggie agent | Yes |
| `augment_api_key` | Augment API key for authentication | No |
| `augment_api_url` | Augment API URL (default: `https://api.augmentcode.com`) | No |
| `workspace_root` | Workspace root path for Auggie to index | No |

## What It Does

The Auggie agent will:
1. React to your comment with 👀 to acknowledge the request
2. Post a comment with its response
3. Update the comment in real-time as it works through the task

## Use Cases

### 1. Respond to Comments

Trigger Auggie when someone mentions `@auggie` in a comment:

```yaml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  auggie:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, '@auggie')
    steps:
      - uses: actions/checkout@v4
      - uses: augmentcode/augment-action@main
        with:
          prompt: ${{ github.event.comment.body }}
          augment_api_key: ${{ secrets.AUGMENT_API_KEY }}
```

### 2. Auto Code Review on PRs

Automatically review every new pull request:

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auggie:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: augmentcode/augment-action@main
        with:
          prompt: "Review this PR for bugs, security issues, and code quality"
          augment_api_key: ${{ secrets.AUGMENT_API_KEY }}
```

### 3. Triage New Issues

Automatically analyze and label new issues:

```yaml
on:
  issues:
    types: [opened]

jobs:
  auggie:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: augmentcode/augment-action@main
        with:
          prompt: "Analyze this issue, suggest relevant labels, and provide initial guidance"
          augment_api_key: ${{ secrets.AUGMENT_API_KEY }}
```
