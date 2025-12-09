# Augment Action

A GitHub Action that automatically reacts to comments with an emoji (👀 eyes) when triggered. Perfect for bot interactions and automated comment acknowledgments.

## Features

- 🎯 Reacts to issue comments and pull request review comments
- 👀 Adds an "eyes" emoji reaction to acknowledge the comment
- 🤖 Can be triggered by specific keywords (e.g., `@auggiebot`)
- ⚡ Fast and lightweight

## Usage

### Basic Setup

Create a workflow file in your repository at `.github/workflows/auggie-bot.yml`:

```yaml
name: Auggie Bot

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  react-to-comment:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, '@auggiebot')

    steps:
      - name: Checkout augment-action
        uses: actions/checkout@v4
        with:
          repository: augmentcode/augment-action
          path: augment-action

      - name: React with eyes emoji
        uses: ./augment-action
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          comment_id: ${{ github.event.comment.id }}
          event_name: ${{ github.event_name }}
```

### Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `github_token` | GitHub token for API access (use `${{ secrets.GITHUB_TOKEN }}`) | Yes |
| `comment_id` | The ID of the comment to react to (use `${{ github.event.comment.id }}`) | Yes |
| `event_name` | The GitHub event name: `issue_comment` or `pull_request_review_comment` (use `${{ github.event_name }}`) | Yes |

### Outputs

| Output | Description |
|--------|-------------|
| `success` | Whether the reaction was successfully added (`true` or `false`) |

### Customization

#### Trigger on Different Keywords

Change the `if` condition to trigger on different text:

```yaml
if: contains(github.event.comment.body, '@mybot')
```

#### Trigger on All Comments

Remove the `if` condition to react to all comments:

```yaml
jobs:
  react-to-comment:
    runs-on: ubuntu-latest
    # No if condition - reacts to all comments
    steps:
      # ...
```

#### Only Trigger on Issues or PRs

For issues only:
```yaml
on:
  issue_comment:
    types: [created]
```

For PR review comments only:
```yaml
on:
  pull_request_review_comment:
    types: [created]
```

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.2.15 or later

### Install Dependencies

```bash
bun install
```

### Run Tests

```bash
bun test
```

### Type Check

```bash
bun run typecheck
```

### Run Locally

```bash
bun run index.ts
```

## How It Works

1. The workflow is triggered when a comment is created on an issue or pull request
2. If the comment contains the specified keyword (e.g., `@auggiebot`), the action runs
3. The action uses the GitHub API to add a 👀 (eyes) reaction to the comment
4. The action reports success or failure

## Example

When you comment on an issue or PR with:

```
@auggiebot please review this
```

The action will automatically add a 👀 reaction to your comment, indicating that the bot has seen it.

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
