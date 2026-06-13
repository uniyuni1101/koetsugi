---
description: Testing guidelines and strategies for Koetsugi. Covers Vitest, React Testing Library, mock interfaces, and XState workflow test isolation. Use when writing, modifying, or debugging unit and integration tests.
name: testing
---
# Testing Guidelines

This document outlines the testing strategy, standards, file naming conventions, and Definition of Done (DoD) for the Koetsugi codebase across all layers (Unit, Component, Integration, E2E).

## Core Verification Commands

- **Run Unit/Component/Integration tests**: `pnpm test` (Uses Vitest)
- **E2E Tests**: Use Playwright (run with the designated E2E test commands once configured).

---

## File Naming & Directory Rules

To distinguish the test scope clearly, suffix the files as follows:

| Test Type | File Naming Convention | Primary Directory |
| :--- | :--- | :--- |
| **Unit Test** | `[name].unit.test.ts` (or `.tsx`) | Next to the target code  |
| **Component Test** | `[name].component.test.tsx` | Next to the component file |
| **Integration Test** | `[name].integration.test.ts` (or `.tsx`) | Within the target feature module (e.g., `src/features/[feature]/`) |
| **E2E Test** | `[name].e2e.test.ts` | In the　 `tests/e2e/` directory |

---

## 1. Unit Testing (Pure Logic & Hooks)

Target: Helper functions, business logic utilities, and custom React hooks.
Tools: Vitest, `@testing-library/react` (for hooks).

### Guidelines
- Test pure functions with a variety of inputs (edge cases, error states).
- Keep tests fast and isolated. Avoid mounting complex components for utility testing.
- Use `renderHook` to test custom hooks that manage local state or side-effects.

### Example (Hook Unit Test)
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);
});
```

---

## 2. Component Testing

Target: Individual React UI elements (Button, Card, Input).
Tools: `@testing-library/react`, Vitest.

### Guidelines
- Focus on rendering output, user accessibility (a11y), and user interactions (click, type).
- Rely on accessible queries (e.g., `getByRole`, `getByLabelText`) rather than test IDs or DOM structure tags.
- Mock all global providers (Router, QueryClient, Theme) or wrap components in a custom test render provider.

### Example (Component Test)
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('should call onClick handler when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await userEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## 3. Integration Testing

Target: Complete feature flows (e.g., form submissions, dashboard logic, interactions between components).
Tools: `@testing-library/react` + MSW (Mock Service Worker).

### Guidelines
- Test full feature user journeys (e.g., user inputs data -> clicks submit -> API is called -> success message is shown).
- Mock all API calls using MSW (Mock Service Worker) instead of mock functions (`vi.fn()`) for network requests.
- **Workflow / XState Mocking**: When integration-testing a UI feature that triggers XState workflows, mock the `useWorkflow` hook or XState actors to avoid running real state machine logic in UI tests.

### Example (Integration with MSW)
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

test('should fetch and display user profile info', async () => {
  render(<UserProfile userId="123" />);
  
  // Wait for profile loading using MSW-mocked response
  const username = await screen.findByText(/john doe/i);
  expect(username).toBeInTheDocument();
});
```

---

## 4. E2E (End-to-End) Testing

Target: Critical business paths (Authentication flow, checkout, main dashboard interactions).
Tools: Playwright.

### Guidelines
- Test true browser interactions against a running instance of the application.
- Cover major flows that depend on third-party services, databases, and multi-page routing.
- Keep the number of E2E tests low; focus strictly on critical paths. UI validation should be done at the Component/Integration level.

---

## 5. XState Workflow Test Isolation

- **Workflows (XState)**: Test the state machines and workflow JSON data fully in isolation from React, Zustand, and DOM rendering. Run assertions directly on XState actors.
  
### Example (Workflow Unit Test)
```typescript
import { createActor } from 'xstate';
import { someWorkflowMachine } from './someWorkflowMachine';

test('should transition state on event', () => {
  const actor = createActor(someWorkflowMachine);
  actor.start();
  actor.send({ type: 'NEXT' });
  expect(actor.getSnapshot().value).toBe('nextState');
});
```

---

## Definition of Done (DoD) for Test Creation

Every test written must fulfill the following quality checklist before it is committed:

- [ ] **Naming Conventions**: The test file matches the standard format (e.g., `*.unit.test.ts`, `*.component.test.tsx`, `*.integration.test.tsx`).
- [ ] **Isolation**: The test is completely independent. It does not depend on the execution order or state of other test files.
- [ ] **No Direct Network Access**: Network requests in Component and Integration tests are fully intercepted and mocked using MSW.
- [ ] **Workflow Isolation**: UI/component tests mock the  XState actors rather than instantiating real domain logic machines.
- [ ] **Assertion Quality**: Assertions target visible behaviors (such as text displaying, accessibility attributes, or call counts) rather than internal state variables.
- [ ] **Coverage of Edge Cases**: Tests cover successful paths, validation errors, and network/server failures.
- [ ] **Formatting & Linting**: `pnpm check` runs cleanly and Biome returns zero formatting or lint errors on the test code.
- [ ] **Execution Check**: Running `pnpm test` succeeds locally without any failures or console errors/warnings.
