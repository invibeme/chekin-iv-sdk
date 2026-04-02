# Repository Guidelines

## Project Structure & Module Organization
The package is a small TypeScript SDK for embedding the Chekin IV iframe. Source lives in `src/`, with the public entry point in `src/index.ts`. Core orchestration is in `src/ChekinIVSDK.ts`, iframe messaging is in `src/communication/`, and shared helpers live in `src/utils/`. Shared constants and types are defined in `src/constants.ts` and `src/types.ts`. Build configuration is kept at the repo root in `tsconfig.json` and `tsup.config.ts`. Generated output goes to `dist/` during builds and should not be edited manually.

## Build, Test, and Development Commands
Use Yarn 4 for local work.

- `yarn build` builds the package with `tsup`, producing ESM, CJS, sourcemaps, and `.d.ts` files.
- `yarn dev` runs `tsup --watch` for iterative SDK development.
- `yarn lint` runs ESLint 9 with the flat config against the TypeScript sources and build config.
- `yarn format:check` verifies formatting with Prettier, and `yarn format` rewrites files in place.
- `yarn typecheck` runs `tsc --noEmit` in strict mode.

There is no test runner configured yet. Until one is added, use `yarn typecheck` and a quick manual integration check against the iframe host app before opening a PR.

## Coding Style & Naming Conventions
Follow the existing TypeScript style: 2-space indentation, semicolons, single quotes, trailing commas where valid, and explicit `.js` import extensions for local ESM imports. Prettier is the formatting source of truth, and ESLint 9 enforces the baseline TypeScript rules. Use `PascalCase` for classes (`ChekinIVSDK`), `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` for exported constants. Keep modules focused; place browser or transport helpers under `src/utils/` or `src/communication/` rather than expanding `src/index.ts`.

## Testing Guidelines
When adding tests, place them near the code they cover or in a dedicated `test/` directory, and name them `*.test.ts`. Prioritize validation logic, URL formatting, and message-handling edge cases. If you introduce a test framework, add a `yarn test` script and document any browser or DOM setup in `README.md`.

## Commit & Pull Request Guidelines
This repository currently has no commit history, so there is no established convention to copy. Start with concise, imperative commit messages such as `feat: add route change event typing` or `fix: guard missing iframe window`. PRs should include a short description, linked issue if applicable, and notes on how the change was verified. Include screenshots only when API docs or demo UI behavior changes.

## Security & Configuration Tips
Do not commit real API keys or iframe environment secrets. Keep sample configuration values clearly fake in docs and examples. Validate any new postMessage inputs carefully; this SDK communicates across window boundaries and should treat external payloads as untrusted.

## Compatibility Notes
This SDK currently has no external consumers. Prefer keeping the host SDK aligned with `../chekin-guestapp/apps/iv-sdk` over preserving backward compatibility inside this package. If the iframe contract changes, update this SDK directly and document the new public config names in `README.md`.
