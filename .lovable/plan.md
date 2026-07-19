## Add Change Control section to Repository Navigation Standard

Insert a new **Change Control** section into `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` immediately after §6 "Repository Principles".

### Edit

- File: `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`
- Insert new `## 7. Change Control` after the current §6, with three subsections:
  - **Editorial Changes** — spelling, grammar, wording, formatting, metadata, cross-references, non-functional documentation improvements. Approved via normal documentation review. SHALL NOT modify the navigation architecture.
  - **Architectural Changes** — adding/removing top-level groups, changing hierarchy, changing the standard module navigation contract, moving artifacts between groups, changing Delivery organization, introducing new navigation patterns, modifying navigation-related governance principles. SHALL require formal Business OS governance approval before implementation.
  - **Stability Principle** — expanded wording:
    > The approved Repository Navigation Standard is intended to remain stable across Business OS releases. Future modules, AI capabilities, industry extensions, optional plug-ins, and documentation additions SHALL integrate into the approved navigation architecture rather than introducing alternative organizational patterns.
    >
    > This principle preserves: repository consistency, developer experience, predictable Lovable AI implementation, documentation discoverability, and long-term maintainability.
- Renumber all subsequent sections to maintain sequential numbering.
- Bump frontmatter `version: "1.1"` and `updated: "2026-07-19"`.

### Out of scope

- No changes to `docs/_meta.json`, the renderer, routes, repository structure, or any other file.
