# Backend Overview — CrowdSourced (Spring Boot)

Last updated: 2026-06-17

This document explains the Java Spring Boot backend for the CrowdSourced project, intended to help you understand the codebase, data model, runtime configuration, typical flows, troubleshooting, and likely interview topics with concise talking points.

**Contents**
- Quick start
- Architecture & folders
- Main entities (data model)
- Key files & responsibilities
- Validation, DTOs and error handling
- Security (JWT) and auth flow
- Database & migration notes
- Running & debugging
- Sample requests (curl)
- Common interviewer topics & suggested talking points

---

**Quick start**
- Prereqs: Java 21+ (project built with Java 26 on this machine), Maven, PostgreSQL running and reachable.
- Run the backend from project root `Backend`:

```bash
cd Backend
mvn clean spring-boot:run
```

- Primary base URL: http://localhost:5000 (configured in `application.properties`).

---

**Architecture & folders (important packages)**
- `com.urbaneye.backend` — app root.
- `controllers` — REST controllers mapping endpoints (AuthController, UserController, IssueController, AnnouncementController).
- `services` — business logic and transaction boundaries (AuthService, UserService, IssueService, AnnouncementService).
- `repositories` — Spring Data JPA repositories for DB access.
- `models` — JPA Entities (User, Issue, Announcement, Feedback, etc.).
- `dto` — Request/Response DTOs carrying validation annotations (RegisterRequest, LoginRequest, OnboardingRequest, IssueCreateRequest).
- `security` — JWT utils, filters, user principal, password encoding and authentication configuration.
- `config` — app configuration and seeding (DatabaseSeeder/DataLoader).
- `exception` — custom exceptions, `ErrorResponse` and `GlobalExceptionHandler`.
- `resources` — `application.properties` (DB, JWT, Cloudinary, logging).

---

**Main entities (high-level)**
Note: field names below reflect the JPA entities in `models`.

- `User`
  - fields: id, name, email, password (hashed), mobile, address, city, district, role (citizen|admin|ngo|government), onboarded (boolean), createdAt, updatedAt
  - constraints: email unique, password stored hashed, `role` enumerated via check constraint in DB and validated in DTOs/logic.

- `Issue`
  - fields: id, title, description, category, status, location (lat/lng or address fields), images (Cloudinary URLs), reporter (User relationship), upvotes, createdAt, updatedAt

- `Announcement`
  - fields: id, title, body, createdBy (User or admin), attachments (optional), createdAt

- `Feedback` / `Comments` (if present)
  - linking users to issues with textual feedback and timestamps

These models are mapped via JPA annotations in `Backend/src/main/java/com/urbaneye/backend/models`.

---

**Key files & responsibilities**
- `BackendApplication.java` — application entrypoint.
- `application.properties` — DB URL, user/password, `spring.jpa.hibernate.ddl-auto`, JWT secret, Cloudinary keys, logging levels.
- `controllers/AuthController.java` — registration, login, onboarding (`/api/auth/register`, `/api/auth/login`, `/api/auth/details`). Uses `@Valid` DTOs.
- `services/AuthService.java` — implements register, login, addDetails (onboarding). Hashes passwords and generates JWTs.
- `security/JwtTokenUtil.java` — creates/parses JWTs (claims, expiry).
- `security/JwtRequestFilter.java` — extracts token from `Authorization` header, validates, and sets SecurityContext.
- `security/CustomUserDetailsService` & `UserPrincipal` — adapt `User` entity to Spring Security.
- `dto/RegisterRequest.java` — validation: `@NotBlank`, `@Email`, `@Size` for password.
- `dto/OnboardingRequest.java` — validation: `mobile` pattern (10 digits), `district`/`city` not blank, `role` allowed values.
- `exception/GlobalExceptionHandler.java` — handles `MethodArgumentNotValidException` and forms a consistent `ErrorResponse` JSON with `details` map for field -> message.
- `config/DatabaseSeeder.java` (or `DataLoader`) — creates initial admin user using properties; useful for local dev.

---

**Validation, DTOs and error handling**
- DTOs use Jakarta Validation (`spring-boot-starter-validation`). With `@Valid` on controller args, `GlobalExceptionHandler` captures validation errors and returns structured JSON:

```json
{
  "message": "Validation failed",
  "details": { "mobile": "Mobile number must be 10 digits", "role": "must be one of: citizen, admin, ngo, government" }
}
```

- Frontend must send fields that pass DTO validation. Example common gotcha: mobile must be exactly 10 digits (strip country code before sending).

---

**Security (JWT) and auth flow**
- Registration: POST `/api/auth/register` with `RegisterRequest`; `AuthService.register()` saves `User` with hashed password.
- Login: POST `/api/auth/login` with `LoginRequest`; on success returns `{ token, user }` where `token` is a signed JWT.
- Onboard details: POST `/api/auth/details` (Authorization: Bearer <token>) — sets `mobile`, `district`, `city`, `role`, and marks `onboarded=true`.
- JWT generation: token contains a `user` claim with `id` and has configurable expiry (see `application.properties`).
- Password hashing: uses Spring Security `PasswordEncoder` (BCrypt).

Security talking points for interviews:
- Why not store raw passwords — explain hashing + salt and BCrypt.
- JWT pros/cons: stateless, scalable, but revocation and refresh tokens need handling.

---

**Database & migration notes**
- DB: PostgreSQL. JPA/Hibernate used for ORM. Default dialect auto-detected.
- Important: be careful with `spring.jpa.hibernate.ddl-auto=update` when adding `NOT NULL` columns without defaults — existing rows may have nulls and schema update fails (we encountered `role` column error). For production use migrations (Flyway or Liquibase) are recommended.

Migration gotcha seen in this project:
- Adding `role` as `not null` caused startup failure because existing `users` rows had null `role`. Fixes: backfill values, add column nullable then update, or use `create-drop` in development only.

---

**Running & debugging**
- Run with `mvn spring-boot:run` from `Backend`.
- To enable verbose Spring/Hibernate debug logs: set `--debug` or change logging levels in `application.properties`.
- Check `logs/application.log` for request/validation traces (project already logs detailed validation failures).

---

**Sample requests**
- Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}' | jq .
```

- Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq .
```

- Onboard (after login — use token):

```bash
curl -X POST http://localhost:5000/api/auth/details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"mobile":"9876543210","district":"Pune","city":"Pune","role":"citizen"}' | jq .
```

---

**Common interviewer topics & concise talking points**
Below are topics you should be ready to explain and sample points to hit in an interview.

1) Authentication & Authorization
  - Explain the JWT flow: issuance at login, storing token client-side, including token in Authorization header, stateless server validation.
  - Password handling: use `PasswordEncoder` (BCrypt) and never store plaintext.
  - Role-based auth: how roles are modeled (`role` field) and used to guard endpoints.

2) DTOs vs Entities
  - Entities represent DB objects and often include persistence annotations and relationships.
  - DTOs validate input and shape data sent to/from clients — avoids exposing internal fields like passwords.

3) Validation & Error Handling
  - Use Jakarta Validation (`@NotBlank`, `@Email`, `@Pattern`, `@Size`) on DTOs.
  - Centralize error handling with `@ControllerAdvice` and return structured error payloads for frontend consumption.

4) Transactions & Service Layer
  - Service layer groups business logic and marks transaction boundaries (`@Transactional`) where necessary to maintain data integrity.

5) JPA/Hibernate basics & relationships
  - Understand `@OneToMany`, `@ManyToOne`, cascade types, fetch strategies (LAZY vs EAGER) and N+1 query problems.

6) Database migrations & production readiness
  - Why `ddl-auto=update` is risky in prod; prefer Flyway/Liquibase migrations, plan schema changes with backfills.

7) Security considerations
  - Token expiry, refresh tokens, CSRF considerations for single-page apps, secure cookie vs localStorage tradeoffs, and rate-limiting/login throttling.

8) Cloudinary integration
  - How images are uploaded and stored (signed uploads or server-side upload), storing only URLs in DB.

9) Observability
  - Logging levels, structured logs (JSON), metrics (Prometheus), and tracing (OpenTelemetry) — prepared lines on how you'd add them.

10) Performance & scaling
  - DB indexing for frequent queries (email), caching for read-heavy endpoints (Redis), and horizontal scaling for stateless services (thanks to JWT tokens).

---

**Common debugging scenarios & fixes**
- Validation errors on `mobile`: frontend sent `+91 98765...` but backend expects 10 digits — strip country code in frontend or relax pattern.
- `role` column migration failure: means existing rows have null `role`. Solutions: add column as nullable, backfill values, then set NOT NULL; or drop/recreate table in dev only.
- Login returns token but authorization fails: verify `Authorization` header includes `Bearer ` prefix and token not expired.

---

**Next steps & recommendations**
- Add automated DB migrations with Flyway and commit migration scripts.
- Add unit & integration tests for controllers and services (Spring Boot test slice + Testcontainers for Postgres).
- Add logging and monitoring (Prometheus + Grafana) in staging.
- Add refresh token flow if long-lived sessions required.

---

If you want, I can:
- expand this document with exact code snippets for each entity and controller (fields and annotations), or
- generate a shorter interview cheat-sheet (one-pager) with 10–15 sample Q&A pairs tailored to your role.

File created: [Backend/BACKEND_OVERVIEW.md](Backend/BACKEND_OVERVIEW.md)
