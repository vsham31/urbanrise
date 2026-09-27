# Implementation plan

## Proposed stack

- Node.js 20+ with Express for the HTTP service.
- Native browser HTML, CSS, and JavaScript for a deliberately small single screen.
- `node:test` with `supertest` (or Express request injection) for backend tests.
- JSON file persistence initialized from the supplied CSV, keeping the dependency footprint small.

This choice prioritizes a working end-to-end submission over framework complexity. A frontend framework is unnecessary for one small interactive page.

## Build sequence

1. Create `package.json`, server entry point, static public folder, and an ignored runtime data path.
2. Implement robust CSV loading and one-time JSON seed creation.
3. Implement the safe visit mapper and exact list query validation.
4. Implement validated outcome update with atomic persistence.
5. Create the phone-width screen: executive/date selectors, visit cards, outcome selector, next-action field, and save feedback.
6. Add backend tests for phone masking and invalid/missing visit handling; test the successful update path if time permits.
7. Run the documented command from a clean checkout and manually check a 360px viewport.
8. Document the actual run/test commands and complete the submission documents.

## UI behavior

- Default to the earliest date in supplied data and an available executive; make both choices visible and editable.
- Sort visits chronologically.
- Each card shows time first, then customer/project/configuration, masked phone, and compact editable controls.
- Disable only the relevant card's Save button while its update is running.
- On success, update the card from the API response and announce a concise confirmation; preserve user input on failure.
- Use large controls (at least 44px touch targets), high-contrast text, and no hover-only interaction.

## Delivery definition

The app is ready when the acceptance criteria pass, `npm run start` serves the UI and API, the documented automated test command passes, and Part B/Part C/AI appendix are completed with truthful candidate-specific content.
