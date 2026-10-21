<div align="center">
  <img src="https://github.com/itu-campuscup/.github/blob/50aaa28abe375ead7588372c5afa0daae36014cf/campus.png?raw=true" alt="CampusCup Logo" width="200"/>
</div>

<h1 align="center">⚓ Judge IT</h1>

<p align="center">
  <img alt="All Contributors" src="https://img.shields.io/github/all-contributors/itu-campuscup/judge-it" />
  <img alt="License" src="https://img.shields.io/github/license/itu-campuscup/judge-it" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" />
  <img alt="Convex" src="https://img.shields.io/badge/Convex-FF5733?logo=convex&logoColor=white" />
  <img alt="Material-UI" src="https://img.shields.io/badge/Material--UI-0081CB?logo=material-ui&logoColor=white" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white" />
  <a href="https://github.com/lucasfth/fafnir"><img alt="Fafnir: secrets" src="./docs/assets/fafnir-badge.svg" /></a>
</p>
<p align="center">
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/itu-campuscup/judge-it" />
  <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/itu-campuscup/judge-it" />
  <img alt="Commit activity" src="https://img.shields.io/github/commit-activity/m/itu-campuscup/judge-it?style" />
</p>

<p align="center">
  <a href="./CONTRIBUTING.md">Get Started</a> -
  <a href="./CONTRIBUTING.md#suggesting-enhancements">Suggest an enhancement</a> -
  <a href="./CONTRIBUTING.md#reporting-bugs">Report a bug</a> -
  <a href="./SECURITY.md">Report a vulnerability</a>
</p>
<br />

Welcome to **Judge IT**!
This project was created and initiated by [the treasurer](https://links.lucashanson.dk/gh) of the [CampusCup 2024-2025 board](a "Chair: Andreas Guldborg, Vice: Lisa Hauge, Treasurer: Lucas Hanson, Sponsor: Carmen Nielsen, PR: Natalie Petersen") for the **2025** CampusCup event at the IT University of Copenhagen.
The board will be responsible for the project, while the volunteers are welcome to contribute.

## ⚓ Why create Judge IT?

The judges had highlighted the issues of identifying the winners when a race was very close.
Thus, the idea of creating a web application was discussed to help the judges focus on a single team at a time.

But while creating a whole new web application, why not make the CampusCup event even more fun for the crowd?
The idea was to create a web app that could be used by the judges but also display fun statistics for the crowd to follow along with.

Following statistics are included:

- The best beer chug times
- The best spinning times
- The best sailing times
- A players general stats ([Radar chart](https://recharts.org/en-US/api/RadarChart))
- A teams general stats ([Radar chart](https://recharts.org/en-US/api/RadarChart))
- Current heat progression and who is currently competing

This is not a static list of statistics, but rather a list of ideas that was discussed.
The project is open to suggestions for other statistics that could be included in the web application.

Maybe best overall times could be shown.

## Table of Contents

- [🪪 License](#-license)
- [➕ Contributing](#-contributing)
- [🏃‍➡️ Getting Started](#%EF%B8%8F-getting-started)
- [🧪 Testing](#-testing)
- [⚡ Database & Authentication](#-database--authentication)
- [🔺 Deploy on Vercel](#-deploy-on-vercel)
- [⭐ Contributors](#-contributors)

## 🪪 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## ➕ Contributing

To contribute to this project, please read the [CONTRIBUTING](./CONTRIBUTING.md) file.

## 🏃‍➡️ Getting Started

> **⚠️ Important:** This project **requires [Bun](https://bun.com)** as the package manager and runtime.
> It uses Bun-specific CLI and keychain APIs.

### Join the shared CampusCup setup

Install [Bun](https://bun.com) and [Fafnir](./docs/fafnir.md#new-laptop-the-short-path) once. Then:

```bash
git clone --recurse-submodules git@github.com:itu-campuscup/judge-it.git
cd judge-it
bun install
fafnir key create  # once per laptop; skip if you already have an identity
fafnir key public  # send this PUBLIC recipient to a maintainer
```

Once the maintainer grants your recipient, pull the updated policy and encrypted configuration:

```bash
git pull --rebase
fafnir trust       # review and approve the recipients
bun run fafnir:check
```

No manual environment-variable entry, personal Convex project or auth initialization is needed for an already-configured shared deployment. App login and admin approval still apply. Never share private decryption keys.

**The shared configuration is production-only:** after receiving access, use `bun run dev:prod` or `bun run build:prod` only when deliberately targeting production. `dev:prod` connects the local app to live data; `build:prod` embeds the production URL. Neither deploys by itself. Optional `dev:shared` requires a separately initialized `.env.local.fafnir`; no shared development deployment is currently configured. [Onboarding and maintainer setup](./docs/fafnir.md) covers grants, updates and recovery.

> The production policy and encrypted file are included; new contributors still need a recipient grant. Fafnir is experimental and not independently audited. CampusCup accepts this risk for production; keep independent recovery copies and restrict production recipients.

### Use your own Convex project instead

```bash
cp .env.example .env.local  # edit the public development URL
bun cli.ts init
bun auth:run
bun dev
```

Environment configuration takes precedence over the keychain fallback. Explicit `--prod` / `--stage` targets require `NEXT_PUBLIC_CONVEX_URL_PROD` / `_STAGE` or their matching keychain entries, never the unsuffixed development value. `NEXT_PUBLIC_*` values are public, and backend secrets remain on Convex. See [CONTRIBUTING.md](./CONTRIBUTING.md#getting-started) for the independent-project workflow.

## 🧪 Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

**Tests run automatically** on every PR via GitHub Actions.
See [tests/README.md](./tests/README.md) for detailed testing documentation and commands.

## ⚡ Database & Authentication

This project uses [Convex](https://convex.dev/) for:

- **Real-time database** with automatic subscriptions
- **Authentication** via Convex Auth (email/password)
- **Admin approval workflow** for user access control

### Setting up Convex

To set up Convex see [Getting Started in CONTRIBUTING.md](./CONTRIBUTING.md#getting-started) and [Admin Approval Guide](./ADMIN_APPROVAL_GUIDE.md) for detailed instructions on the authentication flow and admin approval process.

## 🔺 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ⭐ Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://links.lucashanson.dk"><img src="https://avatars.githubusercontent.com/u/94063597?v=4?s=100" width="100px;" alt="Lucas Hanson"/><br /><sub><b>Lucas Hanson</b></sub></a><br /><a href="#code-lucasfth" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anderswagner"><img src="https://avatars.githubusercontent.com/u/12821408?v=4?s=100" width="100px;" alt="Anders Wagner"/><br /><sub><b>Anders Wagner</b></sub></a><br /><a href="#code-anderswagner" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NatalieClaraPetersen"><img src="https://avatars.githubusercontent.com/u/133771163?v=4?s=100" width="100px;" alt="NatalieCP"/><br /><sub><b>NatalieCP</b></sub></a><br /><a href="#code-NatalieClaraPetersen" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NaddiNadja"><img src="https://avatars.githubusercontent.com/u/74055632?v=4?s=100" width="100px;" alt="NaddiNadja"/><br /><sub><b>NaddiNadja</b></sub></a><br /><a href="#code-NaddiNadja" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AllanPetersen1"><img src="https://avatars.githubusercontent.com/u/78585605?v=4?s=100" width="100px;" alt="AllanPetersen1"/><br /><sub><b>AllanPetersen1</b></sub></a><br /><a href="#code-AllanPetersen1" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
