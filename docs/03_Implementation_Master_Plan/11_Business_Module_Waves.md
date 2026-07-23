---
document: IMP Chapter 11 — Business Module Waves
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 11 — Business Module Waves

## Wave A — Platform Foundation
- MOD-001 Platform Administration
- Rationale: shared services (see Ch. 10)

## Wave B — Master Data
- MOD-005 Inventory (item master, warehouses, valuation)
- MOD-006 CRM (customer master, contacts, opportunities)
- MOD-007 HRMS (employee master)
- Rationale: downstream commercial and finance modules require stable master data.

## Wave C — Commercial
- MOD-003 Sales, MOD-004 Purchase, MOD-015 POS
- Rationale: transactional flows that produce financial documents.

## Wave D — Finance
- MOD-002 Accounting, MOD-008 Payroll
- Rationale: consumes documents from Wave C and master data from HRMS.

## Wave E — Operations
- MOD-019 Warehouse, MOD-009 Manufacturing, MOD-010 Projects
- Rationale: operational execution on top of inventory + commercial + HR.

## Wave F — Service
- MOD-011 AMC, MOD-012 Field Service, MOD-016 Service Desk
- Rationale: post-sale service depends on sales history and platform notifications.

## Wave G — Assets & Fleet
- MOD-013 Assets, MOD-014 Fleet
- Rationale: asset lifecycle after inventory; fleet after asset register.

## Wave H — Intelligence
- MOD-017 Analytics, MOD-018 AI Workspace
- Rationale: analytics needs stable transactional data; AI needs stable analytics indices and workflows.

## References
- Ch. 04 Dependency Architecture
- Ch. 07 Module Implementation Sequence
- Module Publications for each MOD-00N
