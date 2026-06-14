---
description: Guidelines for implementing, dividing, and verifying React components in the Koetsugi project. Use Component-driven design, bulletproof-react structure, and Storybook for validation. Use this skill when creating, editing, refactoring, or testing React components, writing Storybook stories, or setting up UI structures.
name: frontend-components
---
# Frontend Component Implementation & Verification Guidelines

Guidelines for component-driven design, directory structure, and Storybook/Testing Library integration.

## Component Hierarchy & Placement

Components are structured according to `bulletproof-react` and component-driven design:

```text
Page Components (src/routes/)
  └── Feature Components (src/features/[feature-name]/components/)
        └── Shared UI Components (src/components/ui/)
```

### 1. Shared UI Components (`src/components/ui/`)
- **Role**: Reusable, atomic design system primitives (e.g., buttons, modals, badges, inputs).
- **Rules**:
  - Must be **strictly stateless** and contain no business logic.
  - Do not import hooks, stores, query hooks, or workflows.
  - Accept callbacks and props for configuration.
  - Style with Tailwind CSS 4 and leverage shadcn/ui patterns.
  - Placed in `src/components/ui/`.

### 2. Feature Components (`src/features/[feature-name]/components/`)
- **Role**: Domain-specific UI elements belonging to a single feature boundary.
- **Rules**:
  - Placed under `src/features/[feature-name]/components/`.
  - Maintain minimal inline business logic.
  - Separate domain logic, state (Zustand/XState), and API requests (TanStack Query) into `src/features/[feature-name]/hooks/`, `api/`, or `workflows/` rather than nesting them directly in the UI component body.
  - Retrieve dynamic state using feature-specific custom hooks or receive them via props.
  - Never import components from another feature module. Cross-feature composition should happen at the Page level.

### 3. Page Components (`src/routes/`)
- **Role**: Route-level layout and feature composition.
- **Rules**:
  - Standard TanStack Router routes located in `src/routes/`.
  - Responsible for route loaders, parsing URL search params, handling route layouts, and composing feature/UI components.

---

## Storybook Verification Rules

To ensure components are verifiable and testable, every non-trivial component must have a corresponding Storybook story.

### 1. Co-location
- Story files (`*.stories.tsx`) MUST be placed **directly next to the component** they represent.
- Example:
  ```text
  src/features/audio-player/components/
  ├── PlayButton.tsx
  ├── PlayButton.stories.tsx
  └── PlayButton.test.tsx
  ```

### 2. Stories Definition
- Use Component Story Format 3 (CSF3).
- Define multiple stories to capture all states:
  - `Default` / `Primary`
  - `Loading` / `Submitting`
  - `Disabled` / `Error`
  - `Empty` / `NoData`
- Provide realistic mock data for props. If complex data is required, import or create factories under `src/testing/factories/`.

### 3. Storybook Preview & Environment
- Do not import full global stores (e.g. Zustand) or routing contexts directly inside primitive component stories. If a feature component requires specific providers, use decorators in the story to supply them:
  ```typescript
  import type { Meta, StoryObj } from '@storybook/react';
  // Example decorator configuration
  ```

---

## Component Testing Strategy

- **Unit/Integration Tests**: Write Vitest/Testing Library tests (`*.test.tsx`) alongside components.
- **Story Verification**: Utilize Storybook stories inside tests when possible to prevent duplicating mock setups, or write targeted user interaction tests focusing on behavioral assertions.

---

## Component Creation Workflow (Step-by-Step Checklist)

When creating a new component, copy this checklist into your task/TODO list and complete the steps sequentially:

### [ ] Step 1: Design & Placement
- [ ] Please use skill `/frontend-design`
- [ ] Ensure the component has a single, well-defined responsibility (`Single Responsibility Principle - Robert C. Martin`).
- [ ] Determine if the component is a shared primitive (`src/components/ui/`) or a feature-specific element (`src/features/[feature-name]/components/`) based on component-driven principles (`Component-Driven Development - Tom Coleman`).
- [ ] Group the component file, story file, test file, and specific types together in the same directory (`Colocation - Kent C. Dodds`).

### [ ] Step 2: Interface Design (Props / API Design)
- [ ] Define the TypeScript types/interfaces for the component's props first before writing the implementation (`API-First Design - Kas Thomas`).
- [ ] Keep the component interface minimal and focused only on the data and callbacks it strictly needs (`Interface Segregation Principle - Robert C. Martin`).

### [ ] Step 3: Implementation
- [ ] Separate business logic, state management, and API queries (Zustand, XState, TanStack Query) from the presentation layer (`Separation of Concerns - Edsger W. Dijkstra`).
- [ ] Write simple, straightforward code and avoid over-engineering or premature abstraction (`KISS Principle - Kelly Johnson`).
- [ ] Follow styling rules using Tailwind CSS 4 and shadcn/ui primitive patterns rather than ad-hoc custom styles (`Design System Integration - Brad Frost`).

### [ ] Step 4: Storybook Verification (Visual Verification)
- [ ] Create a `*.stories.tsx` file directly next to the component file (`Colocation - Kent C. Dodds`).
- [ ] Define CSF3 stories representing all visual states: Default/Primary, Loading/Submitting, Disabled, Error, and Empty/NoData (`Component-Driven Development - Tom Coleman`).

### [ ] Step 5: Behavior Testing
- [ ] Create a `*.test.tsx` file directly next to the component file (`Colocation - Kent C. Dodds`).
- [ ] Write Vitest/Testing Library assertions focused on user interactions (e.g., clicks, inputs) rather than internal implementation details (`Behavior-Driven Development - Dan North`).

### [ ] Step 6: Integration & Verification
- [ ] Run static analysis (linter, formatter) to verify code style and quality (`Continuous Integration - Martin Fowler`).
- [ ] Run `pnpm build` and `pnpm test` locally to ensure no compilation errors or broken tests exist (`Continuous Integration - Martin Fowler`).

