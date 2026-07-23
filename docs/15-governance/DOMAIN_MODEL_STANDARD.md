---
title: "Domain Model Standard"
summary: "Shared business vocabulary authored before Wave 1. Each concept has a definition, owner module, canonical identifier, key relationships, and forbidden aliases."
document_type: "Governance Standard"
layer: "governance"
owner: "Architecture Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "domain-model", "vocabulary", "ddd"]
---

# Domain Model Standard

## Purpose

Fix a single, shared vocabulary for every business concept **before** functional modules are authored. Prevents drift between modules and locks down the identifiers that APIs and integrations will depend on.

Concept-level only. This document does not define storage, indexing, or UI.

## Entry Format

Every concept MUST include:

- **Definition** — what the concept is.
- **Owner module** — the module that owns the entity's system of record.
- **Canonical identifier** — the field that uniquely identifies the concept across modules and APIs. Primary is opaque (UUID). A human-facing secondary code MAY exist.
- **Key relationships** — how the concept links to other concepts.
- **Forbidden aliases** — synonyms that MUST NOT be introduced.

## Concepts

### Organization

- **Definition:** The top-level tenant. Owns all data below it.
- **Owner module:** MOD-001 Platform Administration.
- **Canonical identifier:** `organization.id` (UUID).
- **Key relationships:** contains Users (via membership), Customers, Suppliers, Employees, Products, Warehouses.
- **Forbidden aliases:** `tenant`, `account` (in this codebase).

### User

- **Definition:** A human account that can authenticate.
- **Owner module:** MOD-001 Platform Administration.
- **Canonical identifier:** `user.id` (UUID, from Supabase auth).
- **Key relationships:** belongs to zero or more Organizations via memberships.
- **Forbidden aliases:** `member` (membership is the join, not the person).

### Customer

- **Definition:** An external party the organization sells to.
- **Owner module:** MOD-003 Sales.
- **Canonical identifier:** `customer.id` (UUID). Secondary: `customer.code` (human-facing).
- **Key relationships:** Organization → Customer → Invoice, Quote, Order.
- **Forbidden aliases:** `client`, `buyer`.

### Supplier

- **Definition:** An external party the organization buys from.
- **Owner module:** MOD-004 Purchase.
- **Canonical identifier:** `supplier.id` (UUID). Secondary: `supplier.code`.
- **Key relationships:** Organization → Supplier → PurchaseOrder, Bill.
- **Forbidden aliases:** `vendor` in APIs (allowed in UI copy only).

### Employee

- **Definition:** A person employed by the organization.
- **Owner module:** MOD-007 HRMS.
- **Canonical identifier:** `employee.id` (UUID). Secondary: `employee.code`.
- **Key relationships:** optionally linked to a User; timesheets, payroll.
- **Forbidden aliases:** `staff` in APIs.

### Project

- **Definition:** A time-bound scope of work billed or tracked as a unit.
- **Owner module:** MOD-010 Projects.
- **Canonical identifier:** `project.id` (UUID). Secondary: `project.code`.
- **Key relationships:** contains Tasks; may bill a Customer.
- **Forbidden aliases:** `engagement`.

### Task

- **Definition:** A unit of work within a Project or Service ticket.
- **Owner module:** MOD-010 Projects (project tasks); MOD-016 Service Desk (service tasks).
- **Canonical identifier:** `task.id` (UUID).
- **Key relationships:** belongs to a Project or Ticket.
- **Forbidden aliases:** `todo`, `activity` in APIs.

### Product

- **Definition:** A sellable or purchasable item (goods or services).
- **Owner module:** MOD-005 Inventory.
- **Canonical identifier:** `product.id` (UUID). Secondary: `product.sku`.
- **Key relationships:** stocked in Warehouses; sold on Invoices; bought on Bills.
- **Forbidden aliases:** `item` in APIs (allowed in UI copy for line items).

### Warehouse

- **Definition:** A physical or logical stocking location.
- **Owner module:** MOD-005 Inventory.
- **Canonical identifier:** `warehouse.id` (UUID). Secondary: `warehouse.code`.
- **Key relationships:** holds stock of Products.
- **Forbidden aliases:** `location`, `store`.

### Invoice

- **Definition:** A tax document billing a Customer.
- **Owner module:** MOD-002 Accounting (system of record); MOD-003 Sales (originator).
- **Canonical identifier:** `invoice.id` (UUID). Secondary: `invoice.number` (per numbering series).
- **Key relationships:** Customer → Invoice → Payment allocations.
- **Forbidden aliases:** `bill` (Bill is a payables document, distinct).

### Payment

- **Definition:** A money movement received from or paid to another party.
- **Owner module:** MOD-002 Accounting.
- **Canonical identifier:** `payment.id` (UUID). Secondary: `payment.number`.
- **Key relationships:** allocated across one or more Invoices or Bills.
- **Forbidden aliases:** `receipt` (in APIs; UI copy may use it).

### Asset

- **Definition:** A capitalized item tracked and depreciated over time.
- **Owner module:** MOD-013 Assets.
- **Canonical identifier:** `asset.id` (UUID). Secondary: `asset.tag`.
- **Key relationships:** owned by Organization, depreciated via Accounting.
- **Forbidden aliases:** `equipment` in APIs.

## Rules

- New modules MUST NOT introduce a concept without adding it here first.
- Renaming a canonical identifier is a MAJOR version bump on this standard and requires an ADR.
- Forbidden aliases MUST NOT appear in table names, column names, API field names, or event field names.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
