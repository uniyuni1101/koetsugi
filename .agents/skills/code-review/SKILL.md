---
description: Code review quality standards and refactoring guidelines. Covers static analysis checks with Biome, prioritizing code deletion over creation, and maintaining minimal complexity. Use before finalizing changes, committing to Git, or self-reviewing code quality.
name: code-review
---
# Code Review Standards

Guidelines to maintain codebase quality, cleanliness, and simplicity.

## Core Review Principles

### 1. Delete More Than You Add
- **Refactoring First**: Before writing new helper functions, classes, or utilities, check if existing code in the feature or shared directories can be reused, extended, or unified.
- **Diff Check**: Review the code changes before committing. Aim to balance new code with the deletion or simplification of obsolete code. Keep changes minimal.

### 2. Strict Pattern Compliance
- Follow the directory hierarchy (`src/app/`, `src/features/`, `src/workflows/`, `src/stores/`).
- Do not introduce new architectural abstractions without explicit alignment.

### 3. Automated Quality Verification
- Run Biome linting and formatting verification:
  ```bash
  pnpm check
  ```
  Fix all linting and formatting issues before requesting review or committing code. Never bypass biome errors.
