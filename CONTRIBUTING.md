# Contributing to judge-it <!-- omit from toc -->

First off, thanks for taking the time to contribute! 💙

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions ⚓💙

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
>
> - Star the project
> - Post about it on social media
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents <!-- omit from toc -->

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
- [Commit Messages](#commit-messages)
- [Join The Project Team](#join-the-project-team)

## Code of Conduct

This project and everyone participating in it is governed by the [judge-it Code of Conduct](./CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior
to the [CampusCup email](mailto:contact@campuscup.dk) or contact the board directly.

## I Have a Question

<!-- > If you want to ask a question, we assume that you have read the available [Documentation](). -->

Before you ask a question, it is best to search for existing [Issues](https://github.com/itu-campuscup/judge-it/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/itu-campuscup/judge-it/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (bun, yarn, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice <!-- omit from toc -->
>
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project licence.

Also for the ones that are part of the organisation there is a [Kanban board](https://github.com/orgs/itu-campuscup/projects/1) you can use for finding work.

### Reporting Bugs

#### Before Submitting a Bug Report <!-- omit from toc -->

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (<!--Make sure that you have read the [documentation]()-->. If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/itu-campuscup/judge-it/issues?q=label%3Abug).
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
- Stack trace (Traceback)
- OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
- Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
- Possibly your input and the output
- Can you reliably reproduce the issue? And can you also reproduce it with older versions?

#### How Do I Submit a Good Bug Report? <!-- omit from toc -->

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to .
<!-- You may add a PGP key to allow the messages to be sent encrypted as well. -->

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/itu-campuscup/judge-it/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `question`. Bugs with the `question` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `bug`, as well as possibly other tags, and the issue will be left to be [implemented by someone](#your-first-code-contribution).

<!-- You might want to create an issue template for bugs and errors that can be used as a guide and that defines the structure of the information to be included. If you do so, reference it here in the description. -->

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for judge-it, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement <!-- omit from toc -->

- Make sure that you are using the latest version.
<!-- - Read the [documentation]() carefully and find out if the functionality is already covered, maybe by an individual configuration. -->
- Perform a [search](https://github.com/itu-campuscup/judge-it/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion? <!-- omit from toc -->

Enhancement suggestions are tracked as [GitHub issues](https://github.com/itu-campuscup/judge-it/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots or screen recordings** which help you demonstrate the steps or point out the part which the suggestion is related to. You can use [LICEcap](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and the built-in [screen recorder in GNOME](https://help.gnome.org/users/gnome-help/stable/screen-shot-record.html.en) or [SimpleScreenRecorder](https://github.com/MaartenBaert/ssr) on Linux. <!-- this should only be included if the project has a GUI -->
- **Explain why this enhancement would be useful** to most judge-it users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

<!-- You might want to create an issue template for enhancement suggestions that can be used as a guide and that defines the structure of the information to be included. If you do so, reference it here in the description. -->

### Your First Code Contribution

This code uses a Convex database, and thus defines the schema and API in the `convex/` directory.
You should thus be able to make contributions without access to the Convex CampusCup organization, as long as you have a Convex project set up locally.
Continue with [Getting Started](#getting-started) to set up your own Convex project and connect it to the application.

#### Getting Started

**Requirements:**

- [Bun](https://bun.sh/) 1.3 or higher (required due to secret management)
  Installation instructions can be found on [bun.com](https://bun.com/).
- Access to CampusCup Supabase organization

**Installation:**

1. Clone the repository
2. `cd` into the project directory
3. Install dependencies:

   ```bash
   bun install
   ```

#### Connecting to Convex

1. **Initialize Convex** in your local project:

   ```bash
   bunx convex dev
   ```

   This will:
   - Create a new Convex project (or connect to existing)
   - Generate the schema and API
   - Provide you with a deployment URL

2. **Start the development server:**

   ```bash
   bun dev
   ```

   On first run, you'll be prompted to enter:
   - `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL from step 1

   Your credentials are securely stored in your system keychain and will be automatically loaded on future runs.

   Important production note: the Convex deployment requires a server-side signing key named `JWT_PRIVATE_KEY` for Convex Auth to work.
   This is set automatically by running `bun auth:run --prod` (or `--stage`) — it is **not** stored locally. See the "JWT keys" section below for details.

3. **Import data** (if you have existing data to migrate):

   ```bash
   bun run scripts/importData.ts
   ```

**Managing credentials:**

```bash
bun secrets:view               # View dev credentials (masked)
bun secrets:view --prod         # View production credentials
bun secrets:view --stage        # View staging credentials
bun secrets:clear               # Clear dev credentials to reconfigure
bun secrets:clear --prod        # Clear production credentials
bun secrets:clear --stage       # Clear staging credentials
```

You now have access to the Convex database with real-time updates.

### Running the Convex Auth CLI (dev vs prod vs stage)

The project exposes a helper command `bun auth:run` which forwards to `bunx @convex-dev/auth`.
By default it targets the development deployment.

| Flag | Target | @convex-dev/auth mapping |
| ------ | -------- | ------------------------- |
| *(none)* | Local dev deployment | *(default)* |
| `--prod` | Production deployment | `--prod` |
| `--stage` | Staging deployment | `--deployment-name <id>` |

```bash
# Set up auth for dev (default)
bun auth:run

# Set up auth for production
bun auth:run --prod

# Set up auth for staging
bun auth:run --stage
```

You can also manage Convex environment variables directly:

```bash
# List env vars on production
bun env --prod list

# Set an env var on staging
bun env --stage set MY_VAR my_value
```

Notes & gotchas:

- Credentials for each environment are stored separately in the system keychain with suffixed keys (e.g. `NEXT_PUBLIC_CONVEX_URL_PROD`).
- The CLI auto-extracts `CONVEX_DEPLOYMENT` from your stored Convex URL — you usually don't need to set it manually.
- The Convex CLI warns when your git working directory is dirty. Commit or stash local changes before running admin commands.

#### Making Changes

> ℹ️ **Note:** The application uses Clerk for authentication. Sign in with Clerk when you start the app.

1. Create a new branch for your feature or bug fix
2. Start the development server using `bun dev`
    - This will start the server on [http://localhost:3000](http://localhost:3000)
3. Make your changes and test them in the development server
4. Ensure that all lint and tests pass before committing your changes

    ```bash
    bun run lint
    bun run test
    ```

5. Commit your changes with a clear and descriptive commit message
    - Use the [commit message styleguide](#commit-messages) to write your commit message
6. Push your changes
7. Create a pull request to the develop branch of the repository
    - Add a description of your changes and why they are needed
    - Ensure checks are passing (lint, tests, etc)
    - Check if test deployment looks correct
    - Get a review from GitHub Copilot if you have access first
    - Request a review from the CampusCup team
8. Wait for the CampusCup team to review your changes and merge them into the develop branch

> ℹ️ **Note:** This project uses [all-contributors](https://github.com/all-contributors/app) to keep track of all contributors.
> Please add yourself to the list by writing `@all-contributors please add @<username> for code` in a comment on your first pull request.
> This will add you to the list of contributors in the README file.

### Improving The Documentation

As of now there is only documentation in the code files themselves.
To change this please follow the steps described in [Your First Code Contribution](#your-first-code-contribution).

## Styleguides

### Branch Naming

When creating a new branch, please use the following naming convention:

```txt
<type>/<task id>-<description>
```

Type can be one of the following:

- `Feat` - for a new feature
- `Fix` - for a bug fix
- `Docs` - for documentation only changes
- `Style` - for changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `Refactor` - for a code change that neither fixes a bug nor adds a feature
- `Perf` - for a code change that improves performance
- `Test` - for adding missing tests or correcting existing tests

**Task id** is the id of the task/issue you are working on.
If not applicable, you can leave it out together with the suffixed dash (`-`).

**Description** should be a few words describing what is going to be changed on the branch.
Please use dashes (`-`) to separate words and keep it short.

### Commit Messages

When creating a commit, please use imperative to describe what the commit does.
Example:

```txt
Fix bug on the login page
```

Keep the commit message short and descriptive.
If the commit is large use new lines to separate the different parts of the commit message.

Example:

```txt
Fix bug on the login page

Fix redirect after login
Add a test for the bug
```

## Join The Project Team

If you want to join the CampusCup team, please contact us via [Email](mailto:contact@campuscup.dk).

## Attribution <!-- omit from toc -->

This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!
