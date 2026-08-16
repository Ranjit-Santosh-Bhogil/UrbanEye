# CrowdSourced — Backend README

Last updated: 2026-06-17

This README complements `BACKEND_OVERVIEW.md` and contains deeper explanations you can use to understand the project and answer interview questions. It focuses on architecture decisions, implementation details, pitfalls, and concise sample answers you can rehearse.

Table of contents
- Authentication & Authorization (detailed)
- DTOs vs Entities
- Validation & Error Handling
- Transactions & Service Layer
- JPA/Hibernate: relationships & N+1
- Database migrations & production readiness
- Security considerations (practical)
- Cloudinary / file uploads
- Observability: logging, metrics, tracing
- Performance & scaling
- Quick sample answers (cheat-sheet)

---

Authentication & Authorization
- Concept: Authentication verifies identity (who you are). Authorization decides access (what you can do).
- Implementation in this project:
  - `AuthController` exposes `/api/auth/register`, `/api/auth/login`, `/api/auth/details`.
  - `AuthService` hashes passwords (`PasswordEncoder`, BCrypt) and issues JWTs via `JwtTokenUtil`.
  - `JwtRequestFilter` inspects `Authorization: Bearer <token>`, validates token signature and expiry, and populates the Spring `SecurityContext` with a `UserPrincipal`.
  - Role checks are implemented by checking the `role` field on the authenticated `User` (string enum: `citizen`, `admin`, `ngo`, `government`).

Talk track (interview):
- Explain that JWTs make the API stateless — servers validate signature and expiry without storing session state.
- Discuss password hashing with BCrypt — slow by design, includes per-password salt, and prevents rainbow-table attacks.
- Revocation strategies: short-lived access tokens + refresh tokens; server-side blacklist for forced revocation; or maintain token version counter on user and include it in token claims to invalidate older tokens.

Common Q&A:
- Q: How to revoke a JWT? — A: Use short expiry + refresh token or maintain a revocation list; for immediate revoke set token version on user and verify it.
- Q: Where to store tokens in SPA? — A: Prefer httpOnly secure cookies to reduce XSS risk; if using localStorage explain XSS mitigations (CSP, input validation) and CSRF protection when needed.

---

DTOs vs Entities
- Purpose:
  - Entities model DB tables and relationships; carry persistence annotations and may include lazy associations.
  - DTOs model the API contract: they validate input, prevent exposing internal fields (passwords), and allow shaping response payloads.
- In this project: DTOs live under `dto/` (`RegisterRequest`, `LoginRequest`, `OnboardingRequest`, `IssueCreateRequest`). Entities are in `models/` (`User`, `Issue`, `Announcement`).

Why this separation matters:
- Avoid accidental serialization of sensitive fields (e.g., `password`).
- Keep backward-compatible API surface even if DB changes.
- Centralize validation rules in DTOs using Jakarta Validation.

Interview pointers:
- Describe mapping flow: Controller receives `@RequestBody @Valid DTO` → Service transforms DTO to entity → Repository persists entity.
- Mention tools like MapStruct for safe, typed mapping between DTOs and entities.

---

Validation & Error Handling
- Implementation: DTOs use annotations like `@NotBlank`, `@Email`, `@Pattern`, `@Size`. Controllers accept `@Valid` DTOs. `GlobalExceptionHandler` converts validation errors into structured `ErrorResponse` JSON with a `details` map.

Example error shape (used by frontend):
```
{
  "message": "Validation failed",
  "details": { "mobile": "Mobile number must be 10 digits" }
}
```

Practical note: Frontend must send data matching server patterns. Example we fixed: backend expects `mobile` as 10 digits, frontend originally sent `+91 98765...` — we normalized on the client.

Interview practice:
- Q: How do you design error payloads for clients? — A: Provide top-level message, HTTP status, and a `details` map mapping fields to errors so the UI can color/attach messages to inputs.

---

Transactions & Service Layer
- Pattern: Keep controllers thin; put business logic in `services/`. Mark service methods `@Transactional` when multiple DB operations must succeed or fail atomically.
- When to use transactions:
  - Multi-entity updates (e.g., create issue + update counters)
  - Consistency across writes
- Advanced: Use `REQUIRES_NEW` for isolated work, or programmatic transactions for manual control.

Interview points:
- Explain why controllers shouldn't have transaction logic — separation of concerns and testability.

---

JPA/Hibernate: relationships & N+1
- Core concepts: `@ManyToOne`, `@OneToMany`, `fetch` types (LAZY by default for collections), cascade options (`PERSIST`, `MERGE`, `REMOVE`), and orphan removal.
- N+1 problem: occurs when an initial query fetches N rows and then lazily fetches associated entities one-by-one. Solutions: use `JOIN FETCH`, DTO projections, or entity graphs.

Interview prep:
- Q: How to avoid N+1? — A: Use `JOIN FETCH` in JPQL/criteria, projection queries to DTOs, or enable batch fetching and tune `hibernate.default_batch_fetch_size`.

---

Database migrations & production readiness
- Problem seen here: adding a NOT NULL `role` column with `ddl-auto=update` failed because rows had NULL. `spring.jpa.hibernate.ddl-auto=update` is convenient in development but risky in production.
- Recommended process:
  1. Write an explicit Flyway/Liquibase migration that adds the new column nullable.
  2. Backfill values via script or migration SQL based on business rules.
  3. Add NOT NULL constraint in a subsequent migration after backfill.

Interview talking points:
- Explain zero-downtime migrations: add nullable column, backfill, and then make it non-nullable; avoid destructive changes in a single migration.

---

Security considerations (practical)
- Password storage: BCrypt via `PasswordEncoder`.
- JWT: sign tokens with a strong secret; use reasonable expiry.
- Token storage tradeoffs: httpOnly cookies vs localStorage; CSRF vs XSS tradeoffs.
- Securing endpoints: validate input, rate-limit auth endpoints, and sanitize user-provided strings.

Sample answers:
- Q: How to protect login endpoints? — A: rate-limiting (reverse proxy or API gateway), progressive delays or temporary lockouts after repeated failures, and CAPTCHAs for suspicious traffic.

---

Cloudinary / file uploads
- Two main patterns:
  - Server-side upload: client sends file to backend; backend uploads to Cloudinary and stores URL in DB. Easier to implement but uses server bandwidth.
  - Direct signed upload: client uploads directly to Cloudinary using a signed payload generated by server; reduces server bandwidth and scales better.

Interview notes:
- Mention security: never expose Cloudinary API secret to clients. Use signed uploads if clients should upload directly.

---

Observability: logging, metrics, tracing
- Logging: use SLF4J/Logback; include contextual fields (request id, user id) for correlation.
- Metrics: instrument critical endpoints and long-running jobs, expose via Prometheus endpoint.
- Tracing: use OpenTelemetry to capture distributed traces across services and DB/external calls.

Interview tip:
- Be prepared to describe how you'd add tracing and correlate logs with trace ids. Explain sampling strategies to limit cost.

---

Performance & scaling
- Practical items:
  - Index columns like `email` used in frequent lookups.
  - Use pagination (limit/offset or keyset) for list endpoints.
  - Cache read-heavy data in Redis; keep services stateless for horizontal scaling; use connection pooling (Hikari) and tune pool size.

Interview answer sample:
- Q: How would you scale the API? — A: Make services stateless, run multiple replicas behind a load balancer, introduce Redis for caching, and use read replicas for DB if necessary.

---

Quick sample answers (cheat-sheet)
- Q: Why use DTOs? — A: To validate and shield the DB model from clients, avoid leaking internal fields, and keep API contracts stable.
- Q: Why not store passwords in DB directly? — A: Because plaintext is unsafe; use slow hashes (BCrypt) with salt to prevent password cracking.
- Q: How to handle schema changes in production? — A: Use a migration tool (Flyway), add columns nullable, backfill, then set NOT NULL; avoid `ddl-auto=update` for production.
- Q: What is the N+1 problem and how to fix it? — A: Explain the problem and solutions: JOIN FETCH, projections, batch fetching.

---

If you want this README expanded with code excerpts (the exact entity fields, DTO annotations, and controller method signatures), I can add them now. I can also generate a printable one-page cheat-sheet of 15 exact interview Q&A pairs.

File added: `Backend/README.md`
