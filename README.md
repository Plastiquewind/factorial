# Factorial Excel Add-in (Velixo Test Task)

This project is my solution to the **Velixo test task**: an Excel add-in with the custom function `TESTVELIXO.FACTORIALROW`.

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
