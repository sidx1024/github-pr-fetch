# GitHub PR Fetch

This script fetches all pull requests from a specific GitHub repository made by a specific author within a given date range and creates a markdown document listing all the PR titles and their links, grouped by the month of creation.

## Sample output

### Jun 2023

1. [[XYZ-226] Create chat thread components](https://github.com/org/repo/pull/15111)
2. [[XYZ-238] Create sidebar step components](https://github.com/org/repo/pull/15112)

### May 2023

1. [Add stylelint config for CI and workflow checks](https://github.com/org/repo/pull/15113)
2. [Add stylelint rule to restrict global CSS at root level](https://github.com/org/repo/pull/15114)

## Usage

The script can be run with the following command:

```bash
npx github-pr-fetch \
   --author "john" \
   --token "ghp_..." \
   --repo "org/marketing" \
   --start "2022" \
   --end "2023-12-30" \
   --output "prs.md"
```

Here is what each argument means:

- `--author`: GitHub username of the author whose contributions you want to fetch.
- `--token`: Your GitHub personal access token.
- `--repo`: The GitHub repository from which to fetch contributions, in the format "owner/repo".
- `--start`: The start date for fetching contributions. This is optional. If not provided, contributions will be fetched from the beginning of GitHub's time (i.e., since 1970).
- `--end`: The end date for fetching contributions. This is optional. If not provided, contributions will be fetched up to the current date.
- `--output`: The output file where the markdown document will be written. This is optional. If not provided, the markdown will be printed to the console.

## Obtaining a GitHub Token

The script requires a GitHub personal access token to interact with the GitHub API. Follow steps mentioned [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).
