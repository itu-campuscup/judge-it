# Fafnir setup and access

## New laptop: the short path

Install [Bun](https://bun.com), Git and [Go 1.27+](https://go.dev/doc/install). On macOS, install Apple Command Line Tools if missing (`xcode-select --install`); native keychain storage needs CGO and the Apple SDK. On Linux, use a running Secret Service or Fafnir’s documented protected key-file option.

Fafnir has no published binary releases yet. Clone and review its source, then install:

```sh
git clone https://github.com/lucasfth/fafnir.git
cd fafnir
(
  set -eu
  if [ "$(uname -s)" = Darwin ]; then
    if ! xcrun --find clang >/dev/null 2>&1 || ! xcrun --show-sdk-path >/dev/null 2>&1; then
      echo "Install Apple Command Line Tools with xcode-select --install, then retry." >&2
      exit 1
    fi
    CGO_ENABLED=1 SDKROOT="$(xcrun --show-sdk-path)" CC="$(xcrun --find clang)" go build -trimpath -o bin/fafnir ./cmd/fafnir
  else
    go build -trimpath -o bin/fafnir ./cmd/fafnir
  fi
  mkdir -p "$HOME/.local/bin"
  install -m 755 bin/fafnir "$HOME/.local/bin/fafnir"
) && export PATH="$HOME/.local/bin:$PATH" && fafnir help
```

Keep the `export PATH="$HOME/.local/bin:$PATH"` line in your shell startup file (`~/.zshrc` or `~/.bashrc`) if needed; the export above only affects the current terminal. The macOS command selects Apple’s compiler explicitly, including when a Nix compiler is on PATH.

Return to your CampusCup checkout (clone with submodules if necessary) and run `bun install`.

### Create your identity once

```sh
fafnir key create  # once per laptop, unless you already have an identity
fafnir key public  # send only this PUBLIC recipient to a maintainer
```

`key create` generates your private identity and stores it in the macOS Keychain or Linux Secret Service by default. Skip creation if one already exists. `key public` prints only the shareable `age1…` recipient. Keep a protected [recovery copy](https://github.com/lucasfth/fafnir#manual-backup-and-recovery), not a shared private key.

Back up your identity to your password manager before relying on shared configuration:

```sh
fafnir key export --output "$HOME/fafnir-recovery.key"
```

Save the exported file or its complete contents in your password manager, verify that entry, then delete the temporary file with `rm "$HOME/fafnir-recovery.key"`. Keep it outside every repository. Time Machine and other backups may capture it; deletion does not erase backup copies. Avoid terminal reveal because scrollback/recordings may retain the key. Fafnir does not clear clipboard history.

On a replacement laptop, use `fafnir key import` to paste the saved identity, then compare `fafnir key public` with your saved public recipient. After pulling previously sealed/published configuration and approving its policy with `fafnir trust`, that restored identity can decrypt files still encrypted to it.

Once a maintainer grants access and publishes the policy and ciphertext:

```sh
git pull --rebase
fafnir trust       # review and approve the recipients
bun run fafnir:check
```

No manual URL/key entry or backend initialization is needed for an already-configured shared deployment. Never send a private decryption key to a coworker. You can reuse your own Fafnir identity across these repos, but each repository/file needs its own grant.

**Current setup is production-only:** `.fafnir.json` and `.env.prod.fafnir` are included. New contributors need a grant before decryption. After verification, use the production commands below only when deliberately working with live data. The optional development examples require a separate deployment and `.env.local.fafnir`; `dev:shared` does not work until that scope is initialized.

## Production

CampusCup has chosen to use Fafnir for production configuration too. **Fafnir is experimental and not independently audited.** This is an accepted project risk, not a security certification. Keep an independent protected recovery copy, review recipient changes and restrict production access. Read [Fafnir’s security policy](https://github.com/lucasfth/fafnir/blob/main/SECURITY.md).

| Scope | Ignored plaintext | Committed ciphertext | Example |
| --- | --- | --- | --- |
| Development | `.env.local` | `.env.local.fafnir` | `.env.example` |
| Production | `.env.prod` | `.env.prod.fafnir` | `.env.prod.example` |

Only when deliberately targeting production, after a production grant, pull and approve the updated policy, then choose the required command. These are **not routine smoke tests**. Use `fafnir:check` to verify encryption without starting the app:

```sh
bun run dev:prod
bun run build:prod
```

These commands select the real production backend. `dev:prod` starts a local app whose actions can modify live data; `build:prod` embeds the production URL in the build. Neither command deploys or changes Convex authentication by itself. Production configuration uses `NEXT_PUBLIC_CONVEX_URL_PROD`; development uses `NEXT_PUBLIC_CONVEX_URL`. `--prod` / `--stage` never reuse an unsuffixed development URL.

`fafnir run` decrypts into the child environment, without restoring plaintext to disk. It is not a sandbox: the child and its dependencies can read every injected value. No private Fafnir identities should go to CI; existing GitHub Actions/Vercel/Convex secret stores remain unchanged.

## Maintainer: first setup

Create your identity once as above, then work from this repository. Copy the example, **edit the ignored plaintext file to replace every placeholder**, then initialize and seal. `vi` below can be replaced with your preferred editor. Use synthetic values to verify the workflow before sealing real configuration. Never print credentials to logs.

Order: **edit → init once per scope → seal → authenticate/check → review → publish**. Skip `init` for an already-configured scope; later changes use `seal --replace`. If there is no separate development deployment, configure only production rather than labeling production as development.

| File | Value to enter |
| --- | --- |
| `.env.local` | `NEXT_PUBLIC_CONVEX_URL` from the development deployment in the Convex dashboard |
| `.env.prod` | `NEXT_PUBLIC_CONVEX_URL_PROD` from the production deployment in the Convex dashboard |

These URLs are public configuration. Do not copy `JWT_PRIVATE_KEY` or backend secrets from Convex; those remain server-side. Fafnir does not fetch configuration or change the deployment.

```sh
# Development
test -e .env.local || cp .env.example .env.local
chmod 600 .env.local
vi .env.local  # enter actual development values; save and exit
bun run fafnir:init
bun run fafnir:seal
bun run fafnir:check

# Production — separate recipient scope; edit .env.prod before sealing
test -e .env.prod || cp .env.prod.example .env.prod
chmod 600 .env.prod
vi .env.prod  # enter actual production values; save and exit
fafnir init --file .env.prod
fafnir seal --file .env.prod
bun run fafnir:check
```

Initialization uses your cached public recipient unless you pass explicit `--recipient` options; it displays the recipients and asks you to confirm the scope in a terminal. Noninteractive initialization refuses approval unless explicitly authorized with `--yes`; do not bypass review in normal onboarding. Add only verified coworkers to the selected scope; a development grant must not imply production access. Review `.fafnir.json`, ciphertext and generated ignore changes, then publish them through the normal reviewed PR process. Do not include plaintext or private keys. No command above stages, commits, pushes or deploys anything.

### Publish the generated files yourself

After sealing, publication is an ordinary Git commit and push/PR. It is **not automatic**: Fafnir never stages, commits or pushes. Review before publishing:

```sh
git status --short
git diff -- .fafnir.json .gitignore
bun run fafnir:check
```

Include `.fafnir.json`, `.env.local.fafnir`, `.env.prod.fafnir` (only scopes you actually initialized), and the relevant ignore rules in your reviewed change. Include the integration scripts/docs/examples when first publishing this integration. Do not stage whole files with unrelated edits or dirty submodule changes. Never add `.env.local`, `.env.prod` or a private identity. Commit and push through the normal repository workflow; no extra Fafnir upload is needed. On later value changes, reseal before publishing. On recipient changes, publish both the updated policy and ciphertext.

`NEXT_PUBLIC_*` values are public browser configuration, not secrets. Do not put real secrets there. Keep `JWT_PRIVATE_KEY` and backend credentials on Convex. Existing keychain configuration remains a fallback when no matching environment value exists; `bun secrets:view` / `bun secrets:clear` manage only that fallback, not Fafnir.

## Maintainer: grant access

**Fafnir has no separate grant-admin role. Any existing recipient who can decrypt a file can add or remove recipients for that file or share its plaintext.** “Maintainer-only” production grants are a team convention controlled by repository permissions and PR review, not a restriction enforced by Fafnir. Review both policy and ciphertext changes. Development access does not unlock a separately encrypted production file.

Verify the owner and public recipient through a trusted channel. Grant exactly the requested scope:

```sh
fafnir grant --file .env.local --recipient age1VERIFIED_PUBLIC_RECIPIENT
# Only for authorized production maintainers:
fafnir grant --file .env.prod --recipient age1VERIFIED_PUBLIC_RECIPIENT
```

Review and publish **both** the changed policy and ciphertext. Changing policy alone is insufficient. The contributor pulls, reviews recipients and runs `fafnir trust` before launching.

## Change values, revoke access and recover

To edit, restore the selected file with `fafnir open --file .env.prod` if necessary (use `.env.local` for development), edit deliberately, then reseal:

```sh
fafnir seal --file .env.prod --replace
bun run fafnir:check
```

`--replace` explicitly authorizes replacing a differing encrypted destination. `bun run fafnir:check` authenticates every configured file and checks any local plaintext copies, so it requires access to every scope. Development-only contributors can use `bun run fafnir:check:structure` for structural/policy checks (not authentication); each shared run authenticates its selected ciphertext. Reconcile mismatches rather than bypassing them, and review the ciphertext diff before publication.

```sh
fafnir revoke --file .env.prod --recipient age1VERIFIED_PUBLIC_RECIPIENT
```

Revocation cannot revoke historical ciphertext or already-copied credentials. Rotate actual service credentials when withdrawing access or responding to compromise. Keep private identities in OS storage or a protected external key file, never in this checkout. Use Fafnir’s [backup and recovery procedure](https://github.com/lucasfth/fafnir#manual-backup-and-recovery) and retain an independent protected backup.

## Fafnir installation notes

See the copy-paste installation steps under [New laptop](#new-laptop-the-short-path), or the [upstream installation guide](https://github.com/lucasfth/fafnir#getting-started) for storage options and platform details.

Badge logo: © 2026 Lucas Frey Torres Hanson, [Apache-2.0](https://github.com/lucasfth/fafnir/blob/main/LICENSE), scaled unchanged from Fafnir’s Mocha SVG.
