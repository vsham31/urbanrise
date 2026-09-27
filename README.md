# Urbanrise Site Visits

Mobile-first tool for a site sales executive to see one day's appointments and record the result of each meeting.

## Run

Requires Node.js 20 or later. From this folder, install dependencies and start the application with one shell command:

```bash
npm install && npm start
```

Open [http://localhost:3000](http://localhost:3000). The app starts with Meenakshi's visits for 6 October 2026; use the selectors to see the other supplied schedules.

Run the automated backend tests with:

```bash
npm test
```

## Scope

- List a selected executive's visits for a selected date.
- Mask every phone number returned to the browser, showing only its final four digits.
- Record one of four valid outcomes and a next action for a known visit.
- Keep the update after the service restarts.
- Work comfortably at phone width with an obvious, thumb-friendly save action.

The detailed requirements, endpoint contract, data rules, and implementation plan are in [`docs/`](docs/).

## Implementation notes

- The server seeds `data/visits.json` from `visits.csv` on first use and persists outcome updates there. Delete that local JSON file to reset the sample data.
- The API masks phones on the server, exposing only the final four digits.
- The optional visit brief is deterministic demo text derived from visit fields, not an external AI-model call. The UI labels it accordingly.
- `GET /visits?executive=EX-01&date=2026-10-06` lists a schedule; `PATCH /visits/:id/outcome` records `{ "outcome", "next_action" }`. Full request/response rules are in [`docs/api-contract.md`](docs/api-contract.md).

## Source material

- `visits.csv` is the supplied synthetic source data.
- `starter_api.txt` is intentionally incomplete starter code; it is reference material, not the implementation.

## Submission documents

- [`docs/part-b-and-c.md`](docs/part-b-and-c.md) — completed Part B and Part C submission responses.
- [`docs/ai-use-appendix.md`](docs/ai-use-appendix.md) — Codex-use record; add any other AI tools personally used before submission.
