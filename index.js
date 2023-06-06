#!/usr/bin/env node
const fetch = require('node-fetch');
const { format, parseISO, isWithinInterval } = require('date-fns');
const { program } = require('commander');
const fs = require('fs');

// Parse command-line arguments
program
  .option('-a, --author <author>', 'GitHub author')
  .option('-t, --token <token>', 'GitHub token')
  .option('-r, --repo <repo>', 'GitHub repository')
  .option('-s, --start <start>', 'Start date (optional)')
  .option('-e, --end <end>', 'End date (optional)')
  .option('-o, --output <output>', 'Output file (optional)')
  .parse(process.argv);

const options = program.opts();

// Prepare headers for the GitHub API request
const headers = {
  Authorization: `token ${options.token}`,
  Accept: 'application/vnd.github.v3+json',
};

async function fetchPRs(page = 1) {
  console.log(`Fetching page ${page}...`);

  const response = await fetch(
    `https://api.github.com/search/issues?q=repo:${options.repo}+type:pr+author:${options.author}&sort=created&direction=desc&per_page=100&page=${page}`,
    { headers }
  );

  const linkHeader = response.headers.get('Link');
  const nextLink =
    linkHeader &&
    linkHeader.split(', ').find((link) => link.endsWith('rel="next"'));

  const data = await response.json();
  const prs = data.items;

  let nextPagePRs = [];
  if (nextLink) {
    nextPagePRs = await fetchPRs(page + 1);
  }

  return [...prs, ...nextPagePRs];
}

fetchPRs()
  .then((prs) => {
    let start = parseISO('1970-01-01');
    let end = new Date();

    if (options.start) {
      start = parseISO(options.start);
    }
    if (options.end) {
      end = parseISO(options.end);
    }

    // Filter PRs based on date range
    const filteredPrs = prs.filter((pr) => {
      const created = parseISO(pr.created_at);
      return isWithinInterval(created, { start, end });
    });

    // Group PRs by month
    const prsByMonth = {};
    filteredPrs.forEach((pr) => {
      const monthKey = format(parseISO(pr.created_at), 'yyyy-MM');
      const monthDisplay = format(parseISO(pr.created_at), 'MMM yyyy');
      if (!prsByMonth[monthKey]) {
        prsByMonth[monthKey] = { month: monthDisplay, prs: [] };
      }
      prsByMonth[monthKey].prs.push(pr);
    });

    // Generate markdown
    let markdown = '## All PRs\n\n';

    // Sort keys (formatted as 'yyyy-MM') in descending order, then map back to 'MMM yyyy' and associated PRs
    const sortedKeys = Object.keys(prsByMonth).sort().reverse();
    for (const key of sortedKeys) {
      const { month, prs } = prsByMonth[key];
      markdown += `### ${month}\n\n`;
      prs.forEach((pr, index) => {
        markdown += `${index + 1}. [${pr.title}](${pr.html_url})\n`;
      });
      markdown += '\n';
    }

    // Output the markdown
    if (options.output) {
      fs.writeFile(options.output, markdown, function (err) {
        if (err) {
          return console.error(`Failed to write to file: ${err}`);
        }
        console.log(`Output written to ${options.output}`);
      });
    } else {
      console.log(markdown);
    }
  })
  .catch((error) => {
    console.error(`Failed to fetch PRs: ${error}`);
  });
