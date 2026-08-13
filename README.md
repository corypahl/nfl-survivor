# Survivor Board

A private, season-long NFL survivor pool planner built with React and Vite. The board maps every 2026 regular-season matchup into a power-ranked grid and adds a transparent, rank-based win estimate for each team and week.

The two survivor entries are tracked independently. Selecting a matchup saves that team as the entry's pick for the week. A team already used in an entry is disabled for every other week in that entry.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Without AWS configuration, the complete board remains available but pick saving is disabled.

## One-time AWS setup

The static GitHub Pages app never receives AWS credentials. It signs the owner into a private Amazon Cognito user pool, sends the resulting token to an API Gateway HTTP API, and lets a narrowly scoped Lambda function read and write the DynamoDB table.

Prerequisites:

- AWS CLI authenticated to the target account
- GitHub CLI authenticated to `corypahl/nfl-survivor`

Deploy the included CloudFormation stack, invite the private user, and populate the repository variables in one command:

```powershell
.\scripts\deploy-backend.ps1 -Email you@example.com
```

The script creates:

- an on-demand, encrypted DynamoDB table with point-in-time recovery;
- an admin-created-users-only Cognito user pool;
- a JWT-protected API Gateway HTTP API;
- a Lambda function with access only to the pick table;
- the four public GitHub repository variables needed by the frontend build.

After setup, rerun the GitHub Pages workflow or push a commit. Cognito emails a temporary password; the app prompts for a permanent password on first sign-in.

For manual setup, deploy [infra/cloudformation.yml](infra/cloudformation.yml) and copy its outputs into the variables shown in [.env.example](.env.example).

## Production build

```bash
npm run build
```

The static build is written to `dist/`. The included GitHub Actions workflow deploys that folder to GitHub Pages whenever `main` is pushed.

## Data sources

- Schedule: [NFL.com 2026 team schedules](https://www.nfl.com/schedules/2026/by-team), bundled from the public nflverse schedule dataset
- Rankings: [NFL.com post-2026-draft power rankings](https://www.nfl.com/news/nfl-power-rankings-post-2026-nfl-draft)

The displayed win percentages are planning estimates derived from power-rank difference plus a modest home-field adjustment. They are not sportsbook odds or betting advice.
