# AGENTS.md

 Follow these instructions strictly to work on this project.

## Project Context
- **Name**: Koetsugi
- **Purpose**: Web application built with React, Vite, and TanStack Start.
- **Tech Stack**:
  - Vite, React 19, TypeScript
  - Tailwind CSS 4 (Styling)
  - TanStack Router & TanStack Start
  - Biome (Linting & Formatting)
  - Vitest & Testing Library (Testing)
  - XState (Workflow / Domain State)
  - Zustand (UI State)
  - Zod (Schma and Validate)

## Architecture (Bulletproof React + Decoupled Workflow)

### Directory Structure
```text
src/
├── app/                  # App shell, routes, providers, global layout
│   ├── providers/        # Global providers (QueryClient, Theme, etc.)
│   └── routes/           # Routing configuration (TanStack Start/Router routes)
├── components/           # Reusable, styling-only shared UI components
│   └── ui/               # Shared primitive components (e.g., button, modal)
├── features/             # Feature-based modules (detailed below)
├── workflows/            # Core workflows & XState machine definitions (pure domain logic)
│   │                     # Acts as a dynamic audio playlist engine driven by workflow JSON files
│   └── [workflow-name]/  # Workflow isolation folder
│       ├── machine.ts    # XState machine
│       ├── types.ts      # Machine context / events / states types
│       └── index.ts      # Workflow entry point
└── stores/               # Zustand stores (manages pure global UI state like modals, theme)
    └── ui-store.ts       # Global UI state store
```

### Feature Modules (`src/features/[feature-name]/`)
```text
[feature-name]/
├── api/                  # API functions and query hooks (TanStack Query)
├── components/           # Feature-specific components
├── hooks/                # Feature-specific hooks
├── types/                # Feature-specific types
├── utils/                # Feature-specific utilities
└── index.ts              # Entry point
```

### Rules & Communication Flow
- **Feature Isolation**: Do not import features from other features. Code flows one direction: **shared ➔ features ➔ app**.
- **Dynamic Audio Workflows**: The workflow is not hardcoded; it is an engine that dynamically interprets a separate workflow JSON configuration. It manages audio file playlists via transition rules (choice, random, direct, loop).
- **File Access & Paths**: Audio files are resolved dynamically from a local directory (accessed via `File System Access API`) using relative paths (`audioPath`) declared inside the loaded workflow JSON.
- **Communication Flow**:
  - XState owns domain logic and state transitions (playback state, dynamic transitions, history).
  - XState updates Zustand stores or React actors via event subscriptions. Zustand does not hold domain workflow state; it only keeps track of infrastructure-level metadata like the directory handle.

## Core Behavioral Principles (Non-negotiable)
1. **READ FIRST (1500+ lines rule)**: Before modifying a file, read its entire contents (or at least 1500 lines) to fully understand the context. Never do partial reads that lead to code duplication.
2. **NEVER RE-READ FILES**: Once you have read a file fully within this session, trust the context stored in your history. Do not read it again to save context window tokens.
3. **DELETE MORE THAN YOU ADD**: Prioritize deleting code over creating new lines. Code complexity compounds into disasters. Keep changes minimal and clean.
4. **FOLLOW EXISTING PATTERNS**: Do not invent new structures or architectural approaches. Follow the project's existing code style and structure.
5. **BUILD AND TEST**: Every change must be validated. Run `pnpm build`, `pnpm test`, and `pnpm check` to ensure no compile, test, or linting errors exist.
6. **COMMIT FREQUENTLY**: Commit your work to Git every 5-10 minutes representing a logical, verifiable step. Please use `/` skill

## Task Management
- **📋 20-POINT TODO LIST**: Always maintain a detailed, progressive todo list of at least 20 items to track your progress and prevent losing context. Keep it updated.
- Use your internal agent tools to manage, prioritize, and check off tasks continuously.
```
## Current TODO List (you MUST maintain 20+ items)
1. [ ] Read Login.tsx FULLY (1500+ lines) - you'll understand the whole flow
2. [ ] Remove at least 50% of redundant code - it's there, you'll see it
3. [ ] Run bun build - this MUST pass before moving on
4. [ ] Check localhost:XXXX works - use the RIGHT port from package.json
5. [ ] Run test.ts if it exists - don't skip this
... (keep going to 20+ or you'll lose context like lesser models do)
```

## Commands
- **Install deps**: `pnpm install`
- **Development**: `pnpm dev` (Vite dev server)
- **Build**: `pnpm build`
- **Test**: `pnpm test`
- **Lint & Format check**: `pnpm check`
