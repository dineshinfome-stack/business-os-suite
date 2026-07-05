---
title: "MOD-018 — AI Workspace"
summary: "Copilot experiences, retrieval workspaces, and tool-calling surfaces that operate on top of business modules."
layer: "business"
owner: "AI Platform"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-018"
module: "AI Workspace"
domain: "AI"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-018 — AI Workspace

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Copilot experiences, retrieval workspaces, and tool-calling surfaces that operate on top of business modules.

## Business Scope

**Bounded context:** AI Surfaces and Copilots. **Primary domain:** AI.

Submodules:

- Copilot Surfaces
- Retrieval
- Tool Calling
- Prompt Library
- Governance

## Primary Users

- Business user (all modules)
- AI Steward

## Business Capabilities

- In-app copilot surfaces
- Retrieval workspaces (RAG)
- Tool-calling on module capabilities
- Prompt library and governance
- Human-approval gates for AI-initiated actions
- Cost and safety governance

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-011 Approval Engine
- ENG-020 Search Engine
- ENG-021 Reporting Engine
- ENG-022 Dashboard Engine
- ENG-024 Event Engine
- ENG-028 AI Copilot Engine

Optional:

- ENG-007 Document Engine
- ENG-008 Attachment Engine
- ENG-013 Automation Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-017 Analytics

Provides to:

- —

## Related ADRs

- ADR-032 RBAC + ABAC
- ADR-011 Multi-Tenant Isolation
- ADR-014 Audit Strategy

## Reading Order

1. This README.
2. [`MODULE_PRD.md`](./MODULE_PRD.md).
3. Referenced engines in `docs/10-erp-core/` and ADRs in `docs/11-adrs/`.

## References

- [`MODULE_PRD.md`](./MODULE_PRD.md)
- `docs/20-module-prds/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
