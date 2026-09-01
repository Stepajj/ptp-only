# Security Policy

## Purpose

This document defines the mandatory security requirements for the OP2P White Label project.

Security requirements described here apply to every module of the system.

Implementation details may change during development, but the security principles defined in this document are mandatory and must not be violated.

---

# Security Philosophy

The project processes authentication data and provides access to financial operations.

For this reason:

- Security has higher priority than development speed.
- Convenience must never reduce security.
- Temporary insecure solutions are prohibited.
- Every new feature must be evaluated from a security perspective before implementation.

---

# Trust Boundaries

The system consists of four trust zones.

```text
User Device
      │
      ▼
Frontend
      │
      ▼
Backend
      │
      ▼
Only P2P API
```

Only Backend is trusted to communicate with external systems.

Frontend is considered an untrusted environment.

The client application must always be treated as potentially compromised.

---

# Authentication

Authentication is performed only by Backend.

Frontend never authenticates users directly.

Authentication must satisfy the following requirements:

- Every user has an authenticated account.
- Protected endpoints require authentication.
- Authentication state is verified by Backend.
- Authentication must remain stateless whenever possible.
- User identity is determined only by Backend.

---

# Session Management

Authenticated sessions must be securely managed.

Requirements:

- Access Tokens must have a limited lifetime.
- Refresh Tokens must have a longer lifetime.
- Refresh Tokens must be revocable.
- User logout must invalidate active sessions.
- Expired sessions must not be reusable.

Backend is responsible for validating every authenticated request.

---

# Password Security

Passwords are never stored in plain text.

Requirements:

- Passwords must always be hashed.
- Modern password hashing algorithms must be used.
- Password hashes must never be exposed.
- Passwords must never appear in logs.
- Passwords must never be returned by any API.

Password verification is performed only by Backend.

---

# Secret Management

The following values are considered secrets:

- API credentials
- Secret keys
- JWT signing keys
- Database credentials
- Environment secrets

Requirements:

- Secrets must never be hardcoded.
- Secrets must never be committed to Git.
- Secrets must only exist in secure environment configuration.
- Secrets must never be returned to Frontend.
- Secrets must never appear in logs.

---

# Only P2P Credentials

The following values must never leave Backend:

- api_id
- secret_key

Frontend must never know:

- Only P2P endpoints
- authentication mechanism
- internal API credentials

Only Backend may communicate with Only P2P.

---

# API Security

Every incoming request must be validated.

Validation applies to:

- request body
- query parameters
- route parameters
- uploaded files

Invalid requests must be rejected before business logic execution.

---

# Authorization

Authentication and authorization are different concerns.

Authentication determines who the user is.

Authorization determines what the user is allowed to access.

Backend must verify ownership of every protected resource before performing any operation.

Users must never gain access to another user's information.

---

# Input Validation

All external input is considered untrusted.

Validation must be performed before processing.

Validation includes:

- required fields
- data types
- string length
- numeric ranges
- enum values
- file types
- file size

Frontend validation exists only for user experience.

Backend validation is mandatory.

---

# File Upload Security

File uploads require additional validation.

Requirements:

- Only explicitly supported file types are accepted.
- Uploaded file size must be limited.
- File type must be verified.
- Uploaded filenames must never be trusted.
- Uploaded files must not overwrite existing files.
- File uploads must never allow executable content.

Backend validates every uploaded file before processing.

---

# Database Security

Database access is performed only by Backend.

Requirements:

- Parameterized queries only.
- ORM-generated queries are preferred.
- Raw queries require documented justification.
- Database credentials remain private.
- Sensitive fields are never exposed through API.

---

# Logging

Logging is required for diagnostics and auditing.

Logs may contain:

- request identifiers
- timestamps
- endpoint names
- application errors
- validation failures

Logs must never contain:

- passwords
- refresh tokens
- JWT secrets
- API credentials
- secret keys
- sensitive personal information

---

# Error Handling

Errors returned to clients must not reveal internal implementation details.

Backend should return:

- meaningful error messages
- appropriate HTTP status codes
- consistent response format

Internal exceptions should only appear in server logs.

---

# Rate Limiting

Public endpoints must be protected against abuse.

Examples include:

- login
- registration
- password recovery
- file upload

Rate limiting strategy may evolve during development.

---

# HTTPS

Production deployments require encrypted communication.

Requirements:

- HTTPS only.
- Secure cookies when applicable.
- No sensitive information transmitted over insecure connections.

---

# CORS

Cross-Origin Resource Sharing must be explicitly configured.

Requirements:

- Allow only trusted origins.
- Do not allow unrestricted origins in production.
- Credentials must be explicitly controlled.

---

# Security Headers

Production deployments must include appropriate HTTP security headers.

Examples include:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

Implementation details are deployment-specific.

---

# Data Ownership

Frontend stores only the minimum amount of information required for user experience.

Sensitive business data remains under Backend control.

Only P2P remains the source of truth for:

- balances
- requisites
- requests
- support messages

---

# Principle of Least Privilege

Every component receives only the permissions required for its responsibility.

Examples:

- Frontend cannot access the database.
- Frontend cannot access Only P2P.
- Only Backend knows external credentials.
- Database is inaccessible from the public Internet.

---

# Security Reviews

Every new feature affecting:

- authentication
- authorization
- file uploads
- external integrations
- financial operations
- sensitive user data

must be reviewed for security implications before implementation.

---

# Mandatory Security Rules

The following rules are absolute.

- Secrets are never exposed to Frontend.
- Backend is the only component allowed to communicate with Only P2P.
- Every protected endpoint requires authentication.
- Every request is validated.
- Every authorization decision is performed by Backend.
- Passwords are never stored in plain text.
- Sensitive data is never written to logs.
- Temporary insecure solutions are prohibited.
- Security requirements always have priority over development speed.

---

# Future Evolution

## Current Security Additions

- Browser access tokens are not persisted in `localStorage` or another browser storage.
- Password changes verify the current bcrypt password and revoke all refresh sessions.
- Active refresh sessions can be listed and individually revoked by their owner.
- Profile avatar URLs are validated by the backend and are not treated as Telegram identity data. Telegram linking uses the existing Telegram OIDC flow; unlinking and PIN/2FA require an explicit product security policy before implementation.
- Adding the first password to a Telegram-only account requires an authenticated Telegram session, creates the identifier and bcrypt hash atomically, and does not expose or infer an email from Telegram.
- Refresh bootstrap is deduplicated in the frontend so React Strict Mode cannot rotate the same refresh cookie twice. Production enforces `SameSite=None` for the separate Vercel/Railway origins; `REFRESH_COOKIE_SECURE=true` is mandatory there.
- Revoking the current session also clears its HttpOnly refresh cookie; revoking another session leaves the current browser session intact. Refresh rotation remains one-time per session.
- Proof uploads are bounded to 25 MB and validated by extension and MIME type before forwarding.
- PIN and 2FA are not implemented because the current domain model and API contract define neither the data model nor endpoints for them.

Security mechanisms may evolve during the lifetime of the project.

Examples include:

- stronger authentication methods
- additional monitoring
- intrusion detection
- multi-factor authentication
- audit logging
- hardware-backed secrets

Such improvements must strengthen the existing security model without violating the architectural principles defined in this project.
