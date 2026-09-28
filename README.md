# Factorial Excel Add-in

This Excel add-in uses Office.js, the shared runtime, TypeScript and a React task pane. It adds the custom function `TESTVELIXO.FACTORIALROW(N)`, which spills `0!, 1!, ..., N!` across N+1 cells.

## Features
- **Spill range.** The function returns a 2-D array, so Excel spills the values across cells instead of putting a list in one cell.
- **Row or column.** The task pane (React, with zustand for state) has radio buttons for Row and Column. The function is a streaming function subscribed to the setting, so existing formulas re-spill in the new direction without recalculating the workbook.
- **Saved setting.** The choice is stored with `Office.context.document.settings`, which lives inside the workbook. It survives a reload of Excel on the web.
- **Caching.** Each `k!` is computed once, as `(k-1)! * k`, and kept in a `BigInt` cache that lasts as long as the runtime.
- **Exact results up to N = 500.** Values up to `18!` come back as numbers. Larger values come back as exact decimal text, because a double loses precision above 2^53.
- **Web worker.** The calculation and its cache run in a dedicated web worker (`src/worker`).

Any N that is not an integer between 0 and 500 returns `#NUM!`.

## Run
```bash
npm install
npm start            # builds, starts the dev server, sideloads into Excel desktop
npm run start -- web --document "<Excel on the web workbook URL>"
npm stop
```
Other scripts: `npm run build`, `npm run validate`, `npm run typecheck`.

## Tests
```bash
npm test                # run all tests
npm run test:coverage   # tests + coverage report in coverage/ (open coverage/index.html)
```
- Jest with ts-jest. UI tests run in jsdom with Testing Library, other tests run in Node.
- `tests/` mirrors `src/`. `tests/fakes/` has in-memory Office.js, streaming invocation and store helpers.
- Coverage must stay at 100% (statements, branches, functions, lines), or `test:coverage` fails.
- `src/worker/spawn.ts` is excluded: it only holds the `new Worker(new URL(..., import.meta.url))` call that webpack needs and Jest cannot parse. Tests mock it.
- `tests/public-api.test.ts` pins what each folder's `index.ts` exports.

## Layout
Each folder exposes its public API through `index.ts`. Other files in the folder are internal.
- `src/core/`: pure logic. `factorial.ts` (cache), `cell.ts` (BigInt to cell value), `validation/` (rule list for N, first failing rule reported)
- `src/worker/`: `protocol.ts` (message types), `factorial.worker.ts` (the worker), `client.ts` (promise-based client)
- `src/state/`: `schema.ts` (setting definitions), `storage.ts` (workbook settings), `store.ts` (zustand store), `shared.ts` (one store shared by both bundles)
- `src/functions/`: `functions.ts` (the `FACTORIALROW` custom function), `errors.ts` (validation result to Excel error)
- `src/taskpane/`: React task pane. `main.tsx` (entry), `App.tsx` (layout), `features/` (one folder per pane feature), `components/` (generic UI), `hooks/` (`useSetting`)
- `manifest.xml`: shared runtime, namespace `TESTVELIXO`

## AI assistance disclosure
This add-in was built with AI assistance. I used **Claude Code** (Anthropic's coding agent, model Claude Opus 5.5) in the Claude desktop app. It wrote most of the code, the tests and this README.

### How I worked with the tool
- I gave it the task description, including the optional features, and it proposed a plan. I reviewed and approved the plan before any code was written.
- It scaffolded the project with the official Yeoman generator (`yo office`, Excel custom functions with a shared runtime, TypeScript), then wrote the source, ran builds, tests and manifest validation, and started the dev server.
- I tested every step in Excel on the web and reported what I saw.
- I reviewed the code after each step and asked for design changes. The agent usually proposed an approach first, and implemented it after I agreed.

### Deficiencies found and fixed
- **Orientation toggle did nothing.** The task pane and the functions are separate webpack bundles, so each had its own settings store. I reported it; it was fixed by keeping one store on `globalThis`, then keyed with `Symbol.for(...)`. A plain `Symbol(...)` would have brought the bug back.
- **Add-in would not load in Excel on the web.** Automatic sideloading did not apply for a "create new" document link. Fixed by uploading the manifest by hand and adding an `Access-Control-Allow-Private-Network` header to the dev server, so Chromium browsers let Excel on the web load the add-in from `localhost`.
- **Unverified assumption about types.** The function signature used `any[][]` on the assumption that custom function metadata rejects union types. When I asked why, the agent tested it and confirmed it (the build fails). It kept `any` only in the signature, typed everything inside as `Cell`, and added a comment explaining why. After the switch to streaming, `any[][]` moved to the `invocation` parameter (`StreamingInvocation<any[][]>`); the limit still applies there, and the comment moved with it.
- **Full workbook recalculation on every toggle.** `Excel.CalculationType.full` worked but recalculated the whole workbook. After I questioned it, the function became a streaming function that re-shapes only its own cells.
- **Smaller issues:**
  - scaffold warnings about type-only imports
  - a webpack dev server rebuild conflict on `functions.json`, which needed a server restart
  - unused template code (`src/commands/commands.ts`), which was deleted
  - a wrongly timed test, which was fixed with a controlled promise
- **Not a bug:** the repeated `1` (`0! = 1! = 1`) and `###` from a blocked spill (a hidden `#SPILL!`) are expected Excel behaviour. The agent explained both.

### Iterations that led to the final result
1. Base add-in: `FACTORIALROW` in the `TESTVELIXO` namespace, returning a 2-D array so it spills.
2. Optional features: React task pane with zustand, row/column toggle, setting saved in the workbook, `BigInt` cache, exact text beyond `18!` up to `N = 500`, web worker.
3. Getting it running in Excel on the web: manual sideload, the local-network header, the shared-store fix.
4. Refactoring on my requests:
   - a settings schema that scales to more settings
   - one job per file, with `index.ts` as each folder's public API
   - `legacyKeys` removed (nothing to migrate yet)
   - validation as a list of rules with their own messages
   - the task pane split into `features/`, `components/` and `hooks/`
5. Streaming custom function instead of recalculating the workbook.
6. Full test suite (Jest, Testing Library, jsdom) with a 100% coverage threshold and an HTML coverage report.

I reviewed every change and tested the add-in in Excel on the web. I take responsibility for the final code.
