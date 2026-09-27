# Test strategy

## Required automated backend test

At minimum, test `GET /visits?executive=EX-01&date=2026-10-06` and assert that:

- the response is `200`;
- every returned record belongs to EX-01 on that date; and
- every returned phone contains only the final four source digits, never a leading source digit.

Use a temporary data file or dependency injection so tests never alter `visits.csv` or a developer's normal runtime data.

## Additional tests to add next

1. Reject each invalid outcome to prevent unusable sales records from entering the data.
2. Return `404` for an unknown visit so a stale/mobile client gets a recoverable answer rather than a server crash.
3. Reject missing, malformed, and impossible dates/executive IDs so list results cannot silently broaden.
4. Verify a successful update persists after service restart, which protects the core business action.
5. Check the 360px UI flow—including save feedback and keyboard behavior—because the primary user works on a phone.
