# Project Structure

## Purpose

This document defines the organizational structure of the project repository.

It describes how project files, modules and services should be organized to maintain consistency, scalability and maintainability throughout the project lifecycle.

This document intentionally focuses on architectural organization rather than framework-specific implementation.

---

# Living Document

This document is expected to evolve as the project grows.

Structural changes should remain incremental and must preserve the architectural principles defined by the project.

Whenever the repository organization changes, this document must be updated before implementation.

---

# Repository Layout

The project is organized as a monorepository.

Example:

```text
root/

├── apps/
│
│   ├── frontend/
│   └── backend/
│
├── docs/
│
├── .github/          (optional)
├── scripts/          (optional)
├── docker/           (optional)
├── package.json
└── README.md
```

Additional applications or services may be introduced without changing the overall repository organization.

---

# Apps Directory

The `apps` directory contains executable applications.

Typical examples include:

- frontend
- backend
- administration panel
- background worker
- command-line tools

Each application should remain independently understandable.

---

# Frontend

The frontend application contains only client-side code.

Typical responsibilities include:

- pages;
- UI components;
- application logic;
- API client;
- assets;
- styling.

Frontend must never contain backend implementation.

---

# Backend

The backend application contains server-side code.

Typical responsibilities include:

- HTTP API;
- authentication;
- business orchestration;
- persistence;
- external integrations;
- validation.

Backend must never contain frontend implementation.

---

# Documentation

The `docs` directory contains architectural and technical documentation.

Documentation is considered part of the source code.

Changes affecting architecture or business behavior should be reflected in documentation before implementation.

---

# Internal Organization

Each application should organize files by responsibility rather than by file type whenever practical.

Related functionality should remain close together.

Unrelated modules should remain isolated.

---

# Module Design

Every module should have one clearly defined responsibility.

Modules should communicate through well-defined interfaces.

Hidden dependencies should be avoided.

---

# Layer Separation

Project structure should reflect architectural layers.

Examples include:

- presentation;
- application logic;
- persistence;
- integrations;
- shared utilities.

Layer boundaries should remain visible in the directory structure.

---

# Shared Code

Shared code should exist only when genuinely shared.

Examples include:

- common types;
- validation utilities;
- reusable helper functions;
- shared constants.

Code should not be moved into shared modules prematurely.

---

# Feature Isolation

Business features should remain independent whenever practical.

A feature should encapsulate:

- business logic;
- related components;
- related validation;
- related API communication.

Features should minimize coupling with unrelated parts of the application.

---

# Naming Conventions

Directory and file names should remain:

- descriptive;
- consistent;
- predictable.

Names should communicate responsibility rather than implementation details.

Abbreviations should be avoided unless widely accepted.

---

# Import Rules

Dependencies should follow the architectural hierarchy.

Higher-level modules may depend on lower-level modules.

Lower-level modules must never depend on higher-level modules.

Circular dependencies are prohibited.

---

# Configuration Files

Configuration should remain centralized.

Typical examples include:

- environment configuration;
- build configuration;
- lint configuration;
- formatting rules.

Configuration files should not be duplicated unnecessarily.

---

# Static Assets

Static resources should remain separated from application logic.

Examples include:

- images;
- fonts;
- icons;
- static documents.

Business logic should never depend on asset locations.

---

# Environment Files

Environment-specific configuration should remain outside application code.

Secrets must never be committed to version control.

Environment configuration belongs to deployment rather than implementation.

---

# Tests

Tests should remain close to the code they verify whenever practical.

Test organization should mirror application organization.

Testing strategy is documented separately.

---

# Scripts

Automation scripts should remain isolated from application code.

Examples include:

- setup scripts;
- maintenance tasks;
- migration helpers;
- development utilities.

Scripts should not contain application business logic.

---

# Documentation Synchronization

Whenever repository organization changes, the following documents should be reviewed:

- Architecture
- Backend Architecture
- Frontend Architecture
- Database Design

Documentation should remain synchronized.

---

# Scalability

The project structure should support future growth.

Examples include:

- additional applications;
- new services;
- worker processes;
- administration tools;
- analytics modules.

New functionality should integrate naturally into the existing organization.

---

# Architectural Constraints

The following rules are mandatory.

- Frontend and Backend remain separate applications.
- Documentation remains outside application code.
- Business logic should not be duplicated.
- Shared modules should remain minimal.
- Circular dependencies are prohibited.
- Every module has a clearly defined responsibility.

---

# Out of Scope

This document intentionally does not define:

- exact folder names inside applications;
- framework-specific structure;
- implementation libraries;
- build tooling;
- deployment layout.

These topics are documented separately.

---

# Future Evolution

The repository structure is expected to evolve throughout the project.

Changes should preserve:

- maintainability;
- discoverability;
- architectural consistency;
- clear module boundaries.

The project organization should become more modular over time without requiring major restructuring.