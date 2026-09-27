# Data, persistence, and privacy notes

## Supplied data

`visits.csv` has 24 synthetic records across three executives and three dates. Its columns are:

| Column | Meaning | Editable |
| --- | --- | --- |
| `visit_id` | Unique visit key, such as `V-3000` | no |
| `lead_id` | CRM lead reference | no |
| `customer_name` | Customer display name | no |
| `phone` | Full synthetic phone number | no, never client-visible |
| `project` | Project name | no |
| `config` | Desired apartment configuration | no |
| `visit_at` | Local visit timestamp (`YYYY-MM-DD HH:mm`) | no |
| `executive` | Source value such as `EX-01 Meenakshi` | no |
| `outcome` | Visit result | yes |
| `next_action` | Follow-up instruction | yes |

## Persistence approach

For this assignment, use a small JSON file or SQLite database initialized from `visits.csv`, rather than writing CSV by joining with commas. The datastore should be created or seeded once and then retained across process restarts. CSV parsing and serialization must correctly handle commas, quotes, and line breaks if CSV remains the chosen store.

Before changing a record, find it by exact `visit_id`; validate all user-controlled fields first; write atomically where practical; then return the newly saved record.

## Phone masking rule

The server owns privacy filtering. Transform every successful API representation before JSON serialization:

```text
mask(phone) = "******" + final four digits
```

Do not send a full number and hide it only in the browser. Do not log request/response objects containing the raw source phone fields in production-like code.

## Starter API gaps to correct

- It accepts missing filters and performs a prefix match, which can return unintended people.
- It reveals the first four phone digits instead of only the last four.
- It dereferences an unknown visit and can crash instead of returning `404`.
- It accepts any outcome and malformed request body.
- It overwrites CSV with unsafe hand-built serialization and no error handling.
- It returns only `{ ok: true }`, preventing the UI from rendering the authoritative saved result.
