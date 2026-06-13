---
description: XState-based workflow design patterns. Covers the isolation of domain logic in src/workflows/, JSON-driven state machines, useWorkflow hook usage, and decoupling transitions from UI state. Use when designing, writing, or modifying workflows, integrating state machines with React/Zustand, or implementing domain state logic.
name: xstate-workflow
---
# XState Workflow Architecture

Guidelines for implementing domain workflows using XState, decoupled from React UI and Zustand.

## Core Rules

- **Pure Domain Isolation**: All XState machine definitions and business logic MUST reside in `src/workflows/`. They must not import from UI layers, React, or browser APIs (like `window` or `localStorage` directly—inject these if needed).
- **JSON-Driven Audio Playlists**: Workflows are controlled by loading dynamic configurations or definitions (e.g., workflow JSON data) containing a flat map of nodes, audio file paths (`audioPath`), and transitions.
- **UI Decoupling**: React components interact with workflows through a dedicated `useWorkflow` custom hook. UI components and Zustand stores must only react to state output or dispatch input events. They should not directly manage the internal transitions of the machines.

## Integration Pattern: useWorkflow Hook

When integrating XState with React:
1. Load workflow JSON data (definitions) inside the hook or context.
2. Initialize or spawn the XState actor representing the dynamic playlist engine, passing the JSON nodes and transitions into context.
3. Manage audio playback lifecycle events (play, pause, audio ended) by sending corresponding events (`AUDIO_PLAY`, `AUDIO_PAUSE`, `AUDIO_ENDED`) to the actor.
4. Interpret transitions based on node definitions:
   - **Choice**: Present the transition options (`buttonText`) to the UI, pausing playback until an option is selected.
   - **Random**: Calculate probabilistic branching automatically before playing the next node.
   - **Direct / Loop**: Automatically transition to the specified node when the current audio ends.
5. Keep Zustand stores focused strictly on ephemeral infrastructure state (e.g., File System Access API directory handle, modals, theme). Do not mirror workflow state inside Zustand.
