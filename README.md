# Homes for the Brave Vocational Services Academy

This folder contains the unified dark-theme Homes for the Brave Vocational Services Academy. The main landing page separates Course 001: Work–Life Balance from Course 002: Communication Skills while keeping both learning tracks accessible from one clearly identified navigation system.

## Where the files go in GitHub

Upload the **contents of this folder** to the root of your GitHub repository. Do not upload the ZIP file itself and do not place everything inside an extra folder.

```text
your-repository/
├── app/
│   ├── page.tsx             # Course wording, modules, questions, links, and interactions
│   ├── globals.css          # Dark theme and responsive/mobile layout
│   ├── layout.tsx           # Browser title and course description
│   └── chatgpt-auth.ts      # Hosting support; leave in place
├── public/
│   ├── hftb-logo.png        # Homes for the Brave logo used throughout the course
│   └── other image files
├── scripts/                 # Build and hosting support; leave intact
├── .openai/
│   └── hosting.json         # Current Sites hosting connection
├── package.json             # Project settings and commands
├── package-lock.json        # Exact software versions
├── tsconfig.json            # TypeScript settings
├── vite.config.ts           # Website build settings
└── README.md                # These instructions
```

## Uploading to a new GitHub repository

1. Download and unzip the source package.
2. Open the unzipped folder and select all of its contents.
3. In GitHub, open your repository and select **Add file → Upload files**.
4. Drag all selected folders and files into the upload area.
5. Confirm that `app`, `public`, `scripts`, `package.json`, and `README.md` appear at the top level.
6. Enter a short description such as `Add Communication Skills Academy`.
7. Select **Commit changes**.

## Connected learning tracks

The unified landing page links to the existing Work–Life Balance modules at:

`https://bellowsed-bit.github.io/hftb-vocational-academy/`

Communication Skills is built directly into this unified academy site:

`https://communication-skills-academy.edoz.chatgpt.site`

## Safe files to edit

- Edit `app/page.tsx` to change course wording, questions, modules, or links.
- Edit `app/globals.css` to change colors, spacing, or mobile presentation.
- Replace `public/hftb-logo.png` using the exact same filename to update the logo everywhere.
- Edit `app/layout.tsx` to change the browser-tab title or search description.

Do not delete `package.json`, `package-lock.json`, `vite.config.ts`, the `scripts` folder, or `.openai/hosting.json`. The site needs them to build and publish correctly.

## Mobile navigation

The module menu scrolls horizontally on phones and tablets. Swipe the menu from right to left to reveal later modules. Swipe it back to the right to return to earlier modules.

---

## Technical starter information

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout`

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout and then validates the Sites artifact. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Diagnostic Commands

- `npm run install:ci`: perform the one bounded lockfile install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build and validate the deployable Sites artifact
- `npm run start`: start the built Vinext application
- `npm test`: build, validate, and verify the rendered development-preview metadata
- `npm run validate:artifact`: recheck an existing artifact's manifest and ESM `default.fetch` export
- `npm run db:generate`: generate Drizzle migrations after schema changes

Use build and validation commands for targeted diagnosis after a remote failure, not as part of the normal checkpoint path.

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
