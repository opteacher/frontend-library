# LIBRARY COMPONENTS

**Purpose:** Reusable Vue 3 components for SSH account manager

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Vue components | `components/` (ColorSelect, EditableTable, PgEleSelect, etc.) |
| Type definitions | `types/` (mapper, field, batch, etc.) |
| Utilities | `utils.ts` (1076 lines - complexity hotspot) |
| Component tests | `tests/components/*.cy.ts` (Cypress) |

## CONVENTIONS
- PascalCase component names
- Vue 3 Composition API (`<script setup>`)
- Ant Design Vue components
- Export barrel patterns via `index.ts`

## ANTI-PATTERNS
- Large component files (>500 lines): EditableTable (932 lines), ColorSelect (659 lines)
- Complex utility file (utils.ts: 1076 lines)
