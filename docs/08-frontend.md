# Frontend Architecture

## Purpose

This document describes the architecture of the Frontend application.

It defines:

- responsibilities of the Frontend;
- interaction with Backend;
- application layers;
- state management principles;
- UI responsibilities;
- architectural constraints.

Implementation details may evolve during development, but the architectural principles defined here must remain consistent.

---

# Living Document

This document is expected to evolve during the lifetime of the project.

Whenever the frontend architecture changes, this document must be updated before implementation.

Implementation should always follow the current architecture.

---

# Frontend Responsibilities

Frontend is responsible for providing the user interface of the platform.

Its responsibilities include:

- rendering the application;
- navigation;
- user interaction;
- forms;
- displaying data;
- client-side validation for user experience;
- state management;
- communication with Backend;
- handling loading states;
- handling error presentation.

Frontend must never own business logic belonging to Backend or external systems.

---

# Architectural Principles

Frontend follows the architectural principles defined by the project documentation.

These include:

- Single Responsibility
- Separation of Concerns
- Security First
- Production Ready
- Documentation First
- Strict Type Safety

Every module should follow these principles.

---

# High-Level Architecture

The application is divided into logical layers.

```text
Pages

↓

UI Components

↓

Application Logic

↓

API Layer

↓

Backend
```

Each layer has a clearly defined responsibility.

---

# Pages

Pages represent user navigation.

Responsibilities:

- composing layouts;
- combining features;
- initiating data loading;
- defining page structure.

Pages should contain minimal business logic.

---

# UI Components

UI components are responsible only for presentation.

Responsibilities:

- rendering UI;
- displaying data;
- collecting user input;
- emitting events.

UI components should remain reusable whenever practical.

UI components should not communicate directly with external services.

---

# Application Logic

Application logic coordinates user interactions.

Responsibilities include:

- form submission;
- local state updates;
- invoking Backend requests;
- handling UI workflows.

Business rules owned by Backend must never be duplicated here.

---

# API Layer

All communication with Backend occurs through a dedicated API layer.

Responsibilities:

- request execution;
- response handling;
- error normalization;
- request configuration;
- authentication handling.

Components should never perform direct HTTP requests.

---

# Routing

Routing defines application navigation.

Responsibilities include:

- page navigation;
- protected routes;
- public routes;
- navigation flow.

Routing implementation depends on the selected framework.

---

# State Management

State should be divided according to responsibility.

Typical categories include:

- UI state;
- authenticated user state;
- server state;
- temporary form state.

State ownership should remain clear.

---

# Local State

Local state belongs to individual UI components.

Examples include:

- modal visibility;
- selected tabs;
- input values;
- temporary interactions.

Local state should not become global without justification.

---

# Global State

Global state should contain only information shared across multiple parts of the application.

Typical examples include:

- authenticated user;
- application preferences;
- global UI settings.

Global state should remain minimal.

---

# Server State

Data received from Backend should be treated as server-owned state.

Frontend displays server state.

Frontend should never assume ownership of business data received from Backend.

---

# Forms

Forms are responsible for collecting user input.

Responsibilities include:

- displaying fields;
- client-side validation;
- user feedback;
- submitting data to Backend.

Backend always performs final validation.

---

# Validation

Frontend validation exists only to improve user experience.

Frontend validation must never replace Backend validation.

Users must never gain additional permissions by bypassing client-side validation.

---

# Authentication

Frontend participates in authentication but does not own it.

Responsibilities include:

- displaying authentication screens;
- submitting credentials;
- handling authenticated UI state;
- reacting to session changes.

Authentication decisions belong exclusively to Backend.

---

# Authorization

Frontend may hide unavailable interface elements for usability.

Backend remains responsible for enforcing permissions.

Frontend authorization should never be treated as a security mechanism.

---

# Error Handling

Frontend presents errors received from Backend.

Responsibilities include:

- displaying validation errors;
- displaying unexpected errors;
- providing retry options when appropriate;
- maintaining a consistent user experience.

Internal Backend details should never be exposed.

---

# Loading States

Every asynchronous operation should provide clear feedback.

Examples include:

- initial loading;
- form submission;
- background refresh;
- file upload.

Users should always understand the current state of the application.

---

# File Upload

Frontend is responsible for:

- selecting files;
- basic client-side validation;
- displaying upload progress when available.

Backend remains responsible for secure validation and processing.

---

# Responsive Design

The interface should support different screen sizes.

Responsive behavior should remain consistent across the application.

Implementation details are outside the scope of this document.

---

# Accessibility

User interface components should be designed with accessibility in mind.

Examples include:

- semantic markup;
- keyboard navigation;
- focus management;
- descriptive labels.

Accessibility improvements should be incorporated throughout development.

---

# Performance

Frontend should prioritize:

- fast rendering;
- efficient updates;
- minimizing unnecessary re-renders;
- efficient network usage.

Performance optimizations should be based on measurable needs.

---

# Security

Frontend must never expose:

- external API credentials;
- internal secrets;
- authentication secrets;
- sensitive server configuration.

Sensitive business decisions always belong to Backend.

---

# Extensibility

Frontend architecture should support future expansion.

Examples include:

- additional pages;
- new dashboard modules;
- administration interfaces;
- additional integrations;
- localization.

New functionality should integrate naturally into the existing architecture.

---

# Relationship With Other Documents

Frontend architecture depends on:

- Project Overview
- Architecture
- Security
- Domain Model
- API Integration
- Backend Architecture
- System Flows

Implementation should remain consistent with these documents.

---

# Out of Scope

This document intentionally does not define:

- folder structure;
- framework-specific APIs;
- styling methodology;
- component library;
- routing implementation;
- state management library;
- build configuration.

These topics are documented separately.

---

# Future Evolution

## Current Integration Rules

The frontend uses backend routes for all business data. OnlyP2P addresses, invoices, requests, balances, requisites and support messages are never fetched directly from the external provider.

Support updates use polling with `after_id`; no WebSocket is required. Funding QR codes are generated from the real address or payment URL returned by the backend.

Access tokens remain memory-only in the browser. Session restoration uses the HttpOnly refresh cookie.

Frontend architecture is expected to evolve during the project.

Changes should preserve:

- clear separation of responsibilities;
- maintainability;
- security;
- consistency with Backend;
- stable user experience.

Architectural improvements should extend the existing design rather than replace it whenever possible.
- The profile screen keeps backend-owned profile editing; no local mock or fake file upload is allowed. The backend still supports a validated HTTPS avatar URL, while the visible change-photo control is intentionally omitted until object storage is approved. A binary upload requires an approved object-storage contract.
- Landing navigation uses real internal section anchors and real external contacts only; unsupported legal-document, payout-history, API-key and channel URLs are not rendered. Quantitative marketing claims are not presented unless they come from a documented source.
- Dashboard counts, active requisites, history filters and quick actions use backend data/routes; no hardcoded account state is used.
- The profile security screen uses `POST /auth/credentials` for Telegram-only users and `POST /auth/password` for users who already have a local credential. Support chat returns through client-side navigation so the in-memory access token is not lost.
