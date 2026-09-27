# Product requirements and acceptance criteria

## User and job

The user is a site sales executive. On a phone, they need today's (or a chosen day's) scheduled site visits, then must quickly record what happened and the next follow-up action after a meeting. This covers only the site-visit and post-visit steps of the sales flow.

## In scope

1. Fetch visits for exactly one executive and one calendar date.
2. Display the visit time, customer name, masked phone number, project, configuration, current outcome, and current next action.
3. Let the executive select an outcome and enter or edit a next action per visit.
4. Save the change and show the saved result without a page reload.
5. Persist changes to a local data store suitable for this assignment.
6. Return understandable client errors and appropriate HTTP status codes.

## Out of scope

- Authentication, role management, booking creation, notifications, CRM integration, payment flows, and real AI integration.
- Editing customer identity, visit date/time, project, configuration, or executive assignment.

## Functional acceptance criteria

| Area | Acceptance criterion |
| --- | --- |
| List | `GET /visits?executive=EX-01&date=2026-10-06` returns only EX-01's visits dated 2026-10-06. |
| Privacy | Responses never expose the full phone number; only the last four digits are visible (for example `******1703`). |
| Update | A valid update to a real visit persists and returns the updated safe visit representation. |
| Outcomes | Only `Interested`, `Needs time`, `Not interested`, and `No show` are accepted. |
| Validation | Missing or malformed query/body fields receive a clear `400` response; invalid outcome receives `422`. |
| Missing visit | Updating a non-existent visit returns `404` and does not modify data. |
| UI | On a 360px-wide viewport, a user can identify a visit, choose its outcome, enter a next action, and save with one hand. |
| Feedback | The UI visibly reports saving, success, and an actionable failure. |
| Proof | At least one backend automated test covers a required business rule. |

## Decisions requiring implementation consistency

- Executive query input is the identifier (`EX-01`), not a fuzzy display-name prefix.
- Date is an ISO calendar date: `YYYY-MM-DD`.
- `next_action` is required as a string field for an update but may be blank, because supplied data contains valid blank actions. Trim surrounding whitespace and cap it at 500 characters.
- A visit's `executive` source column contains an identifier plus display name; expose the ID and display name separately in the API where useful.
