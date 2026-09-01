# Database Design

## Purpose

This document describes the database design principles for the OP2P White Label project.

It defines:

- what types of data belong in the database;
- what data must never be stored;
- how entities should be designed;
- relationships between entities;
- evolution strategy for the schema.

This document intentionally avoids implementation-specific SQL details.

---

# Living Document

This document is expected to evolve during development.

Database design is refined as:

- new business requirements appear;
- external APIs evolve;
- new entities are introduced;
- existing workflows become more precise.

Whenever the data model changes, this document must be updated before implementation.

---

# Database Ownership

The database stores only data owned by this project.

Examples include:

- user accounts;
- authentication data;
- refresh tokens;
- internal settings;
- configuration;
- mappings between internal and external identifiers.

Business data owned by external systems must not become the primary source of truth in our database.

---

# Source of Truth

Every stored entity must have one authoritative owner.

Possible ownership includes:

- Database
- Backend
- External Business System

If another system owns the data, the database should only store the minimum information necessary for integration.

---

# Design Principles

The database should satisfy the following principles.

## Normalization

Data duplication should be minimized.

The same information should not exist in multiple unrelated locations.

---

## Single Responsibility

Each table should represent one business concept.

Tables should not combine unrelated responsibilities.

---

## Explicit Relationships

Relationships between entities should be clearly defined.

Implicit relationships should be avoided.

---

## Referential Integrity

Relationships between records should remain valid throughout the lifecycle of the data.

Broken references are not acceptable.

---

## Consistent Naming

Naming conventions should remain consistent across the entire schema.

The naming strategy is defined by the project coding standards.

---

# Expected Data Categories

The database is expected to contain information related to:

- identities;
- authentication;
- authorization;
- user preferences;
- internal configuration;
- external identifier mappings;
- operational metadata.

Additional categories may be introduced when required.

---

# Data That Should Not Be Owned

The following business information is expected to remain under external ownership whenever possible.

Examples include:

- balances;
- financial calculations;
- payment processing;
- transaction execution;
- support operations;
- external business workflows.

Temporary caching is acceptable when properly documented.

Ownership must remain unchanged.

---

# Relationships

Relationships should reflect the Domain Model.

Every relationship should answer:

- who owns the data;
- what depends on what;
- whether deletion affects related records;
- whether historical information must be preserved.

Relationship implementation is defined during development.

---

# Identifiers

Every persistent entity should have a stable identifier.

Internal identifiers should remain independent from identifiers used by external systems.

Mappings between internal and external identifiers should be explicitly maintained when required.

---

# Sensitive Data

Sensitive information must be stored carefully.

Examples include:

- password hashes;
- optional backend-owned profile display name and avatar URL;
- refresh tokens;
- authentication metadata;
- internal identifiers.

Sensitive information must never be stored in plain text unless explicitly required and documented.

---

# Historical Data

Some entities may require historical tracking.

Examples include:

- authentication events;
- configuration changes;
- audit records.

Historical storage requirements are determined by business needs.

---

# Soft Delete

Some entities may require logical deletion instead of physical deletion.

Whether an entity supports soft delete depends on its business responsibility.

Deletion strategy should be documented for every persistent entity.

---

# Auditability

Where appropriate, entities should support auditing.

Examples may include:

- creation timestamp;
- update timestamp;
- creator;
- last modification.

Audit requirements may evolve during development.

---

# Indexing

Indexes should be created based on:

- query patterns;
- relationships;
- performance requirements.

Premature optimization should be avoided.

---

# Constraints

Data integrity should primarily be enforced by the database whenever practical.

Examples include:

- uniqueness;
- required fields;
- foreign key relationships;
- valid ranges.

Business validation remains the responsibility of Backend.

---

# Migrations

Schema evolution should occur through version-controlled migrations.

Direct manual changes to production databases are prohibited.

Migration strategy depends on the selected tooling.

---

# Performance

Database design should prioritize:

- correctness;
- maintainability;
- integrity.

Performance optimizations should be introduced only after measurable need has been identified.

---

# Extensibility

The schema should allow future expansion without redesign.

Examples include:

- additional integrations;
- new user features;
- administration functionality;
- analytics;
- notification systems.

New entities should integrate naturally into the existing model.

---

# Synchronization With Documentation

Whenever a database change affects:

- entities;
- relationships;
- ownership;
- business concepts;

the following documents should be reviewed:

- Domain Model
- Architecture
- API Integration
- Backend Architecture

Documentation must remain synchronized with implementation.

---

# Out of Scope

This document intentionally does not define:

- SQL schema;
- ORM models;
- migrations;
- indexes;
- query implementation;
- performance tuning.

These topics belong to implementation.

---

# Future Evolution

The database schema is expected to evolve throughout the project.

Schema evolution is considered a normal part of development.

Changes should prioritize:

- consistency;
- maintainability;
- backward compatibility when appropriate;
- alignment with the Domain Model.

The database design should always reflect the current architecture of the project rather than historical implementation decisions.
