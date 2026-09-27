# Part B and Part C submission answers

## Part B — your own work

Candidate-provided responses.

### 1. Last production problem fixed

One of our token-generation APIs had a privilege-escalation vulnerability that was discovered after deployment to production. The issue was that the API generated a new JWT using only the username supplied in the request, without sufficiently validating the user’s actual identity and authorization context.

Because of this, a malicious user could modify the username in the request to impersonate a higher-privileged user, such as an Admin, and potentially perform actions like approving or rejecting requests under that user’s identity.

I identified the root cause, updated the authentication flow so that token generation relied on validated user identity and authorization data rather than a client-supplied username, and deployed the fix within the expected timeline.

As a guardrail, I then re-tested the same privilege-escalation scenario using a production user and confirmed that the vulnerability could no longer be reproduced. I also treated this as an authorization-validation issue rather than just an input-validation bug, which helped strengthen the way similar token-generation flows were reviewed going forward.

### 2. Number moved at work

**Metric:** Average TechOps support resolution time  
**Prior value:** ~4 hours  
**Subsequent value:** ~2 hours 24 minutes  
**Improvement:** Up to 40% reduction  
**Measurement source:** Support/TechOps incident resolution timestamps and production support records  
**What I did:** Designed and deployed a RAG-based support solution using Azure Cognitive Search, LangChain, GPT-4o, FastAPI, and PostgreSQL; productionized the service on Docker and AKS; and implemented NL-to-SQL, intent detection, and dynamic prompting to accelerate issue investigation and information retrieval.  
**Attribution:** The reduction was observed after introducing the GenAI support workflow, although incident complexity and other operational factors may also have contributed.

### 3. Incorrect AI-tool output

During development of the TechOps GenAI solution, the LLM occasionally generated an incorrect SQL query or returned an answer that was not fully grounded in the retrieved support data. I detected these issues by comparing the generated SQL and final response against the underlying PostgreSQL records and source documents. In some cases, the model selected the wrong column, applied an incorrect filter, or inferred information that was not present in the retrieved context.

To reduce this risk, I added validation around generated SQL, intent-based prompt constraints, retrieval-grounding checks, and manual verification during testing. My current habit is to treat LLM output as a draft rather than a source of truth: I verify generated queries against the database schema and cross-check important answers against the retrieved source data before relying on them.

### 4. What you would build differently

In an Admin Portal I worked on, there was an EDC card-user onboarding module where the existing design generated a separate session token through a `createSession` API, even though users were already authenticated through the main portal login.

If I were designing it today, I would avoid introducing a second authentication token and instead reuse the portal’s existing JWT across the onboarding APIs, provided the token’s claims and authorization model supported the required access.

This would simplify the authentication flow, reduce the complexity of maintaining and validating two separate tokens on every API request, and make session handling more consistent across the application. It would also reduce the chances of token-expiry mismatches and make the overall system easier to maintain and debug.

### 5. Weakest stack layer and first 90 days

My weakest layer today is **database engineering**, specifically advanced PostgreSQL topics such as query planning, indexing strategy, transaction isolation, locking, and performance tuning at scale.

I am comfortable using PostgreSQL in backend applications, writing queries, designing schemas, and integrating it with APIs, but I want to become stronger at understanding why a query is slow, how the planner behaves, and how to make database decisions under real production load.

In my first 90 days, I would follow a measurable plan: spend the first 30 days strengthening SQL, indexing, `EXPLAIN/EXPLAIN ANALYZE`, transactions, and isolation levels; the next 30 days practicing query optimization, concurrency, partitioning, and connection-pool tuning on realistic datasets; and the final 30 days applying those concepts to a small production-style project and reviewing actual slow-query patterns.

By the end of 90 days, my goal would be to analyze and optimize at least **20–30 non-trivial queries**, build **2–3 database-heavy mini projects or case studies**, and be able to confidently diagnose common PostgreSQL performance and concurrency issues without relying solely on trial and error.

## Part C — reducing site-visit no-shows

### Approach

Start with a simple confirmation and recovery workflow integrated with the CRM. When a visit is booked, send a WhatsApp message with a one-tap Confirm, Reschedule, or Cannot attend choice, plus location and time. Record each response and delivery status against the CRM visit; send a second reminder close to the appointment. For bookings still unconfirmed, put a call task in the pre-sales queue, prioritized by visit value and time remaining. If a customer declines or fails to confirm by a defined cutoff, release the slot to a standby/waitlist process and alert the site executive. Build this as a small CRM workflow first; buy or use the existing WhatsApp provider rather than creating a messaging platform.

### Measure

Primary metric: completed site visits divided by confirmed bookings for the selected cohort, with the denominator and cohort frozen before comparison. The prompt says roughly half do not attend, so a starting estimate is 50% attendance / 50% no-show; validate this from CRM records in week one rather than treating it as fact. Target: reduce no-shows by 10 percentage points within eight weeks while monitoring reschedules and booking volume so the metric is not improved by discouraging bookings.

### First two weeks

Days 1–2: map the booking-to-visit process with pre-sales and site teams, inspect two months of CRM data, and agree on outcome definitions and baseline. Days 3–5: select the WhatsApp/CRM integration path, write consent and template requirements, and prototype the CRM fields and confirmation message. Days 6–8: pilot with one project, one reminder schedule, an owner for unconfirmed visits, and a manual fallback. Days 9–10: review delivery, response, confirmation, no-show, and staff-feedback data; repair the workflow before expanding.

### What could go wrong

Messages can fail, arrive late, or be sent without valid consent; store delivery status, keep approved templates, offer a call fallback, and audit opt-in. A customer may confirm but still not attend because travel, family decision-making, or financing changed; treat confirmation as a signal rather than a guarantee and test timing/content against a control group. Staff may ignore stale CRM tasks or mark outcomes inconsistently; keep the required fields minimal, make ownership explicit, audit a small sample weekly, and report data quality beside attendance.
