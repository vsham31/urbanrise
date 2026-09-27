# API contract

Base URL during local development: `http://localhost:3000`.

All request and response bodies use JSON. Error bodies use a stable shape:

```json
{ "error": "Human-readable explanation" }
```

## List visits

`GET /visits?executive=EX-01&date=2026-10-06`

| Input | Required | Rules |
| --- | --- | --- |
| `executive` | yes | Exact ID matching `EX-` followed by two digits. |
| `date` | yes | Calendar date in `YYYY-MM-DD` format and a real date. |

Success: `200 OK`

```json
{
  "visits": [
    {
      "visit_id": "V-3006",
      "lead_id": "L-85453",
      "customer_name": "Suresh Reddy",
      "phone": "******1703",
      "project": "Skyline-Bengaluru",
      "config": "3BHK-Premium",
      "visit_at": "2026-10-06 11:00",
      "executive": { "id": "EX-01", "name": "Meenakshi" },
      "outcome": "No show",
      "next_action": "Send price sheet"
    }
  ]
}
```

- `400 Bad Request`: missing or invalid `executive`/`date`.
- An empty successful list is `200` with `"visits": []`; it is not an error.

## Record outcome

`PATCH /visits/:id/outcome`

Using `PATCH` expresses that only outcome-related fields change. If the implementation retains the starter's `POST` route, it must preserve the same validation and response semantics, and the README must name the final choice.

Request:

```json
{
  "outcome": "Interested",
  "next_action": "Call on Monday"
}
```

| Field | Rules |
| --- | --- |
| `outcome` | Required; exactly one of `Interested`, `Needs time`, `Not interested`, `No show`. |
| `next_action` | Required string; trim it; maximum 500 characters; blank permitted. |

Success: `200 OK`, returning `{ "visit": { ...safe visit... } }`. A safe visit is the same representation as a list item and never includes a full phone number.

- `400 Bad Request`: missing body, non-string `next_action`, or malformed request.
- `404 Not Found`: no visit matches `:id`.
- `422 Unprocessable Content`: unsupported outcome or next action exceeding the limit.
