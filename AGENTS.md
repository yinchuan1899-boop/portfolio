# AGENTS.md

## Project Overview

This repository is a personal portfolio website.

The primary goal is to maintain a visually polished, high-end, modern portfolio experience while keeping the codebase stable, maintainable, performant, and easy to extend.

The visual design and interaction experience are important product requirements, not incidental styling.

## Core Technology Stack

- React 19
- Next.js 16
- App Router
- TypeScript
- pnpm
- Custom CSS
- Tailwind CSS 4
- HTML5 Canvas 2D for cursor / particle interactions
- Vercel for production deployment

The project previously used Vite + Vinext in another environment, but the production deployment target is standard Next.js on Vercel.

---

# 1. General Working Rules

Before modifying code:

1. Inspect the relevant existing files.
2. Inspect `package.json`.
3. Understand the current implementation before replacing it.
4. Prefer modifying the existing system over rebuilding it from scratch.
5. Keep changes focused on the user's request.
6. Do not perform unrelated refactors.
7. Do not delete existing functionality unless explicitly requested.

When requirements are clear, proceed with implementation instead of repeatedly asking for confirmation.

For ambiguous design decisions, preserve the existing visual language by default.

---

# 2. Protect the Existing Visual Design

The website's visual identity is a high-priority requirement.

Do not casually change:

- overall visual style
- typography hierarchy
- font sizing system
- spacing rhythm
- dark theme
- large headline treatment
- navigation behavior
- project presentation structure
- hover interactions
- animations
- cursor effects
- Canvas particle effects
- responsive behavior

When implementing a new feature, make it feel native to the existing design.

Avoid generic SaaS-style UI unless explicitly requested.

Avoid turning custom-designed sections into generic component-library layouts.

Do not simplify unique visual details merely because a simpler implementation is easier.

---

# 3. Minimal Visual Regression Rule

For small UI requests, make the smallest reasonable visual and code change.

Example:

If the user asks to:

> increase the project card spacing

change the spacing.

Do not simultaneously:

- redesign the cards
- change typography
- rewrite the section
- replace the CSS architecture
- alter animations
- reorganize unrelated components

Preserve unaffected areas.

---

# 4. Next.js Rules

The project uses the Next.js App Router.

Prefer App Router conventions.

Keep server components as server components unless client-side behavior is required.

Only add `"use client"` when necessary for:

- state
- browser APIs
- event listeners
- Canvas
- animation logic
- other client-only behavior

Do not unnecessarily convert large component trees into client components.

Preserve Next.js optimizations whenever practical.

Use Next.js-native APIs and patterns where appropriate.

Do not introduce Pages Router patterns unless specifically required.

---

# 5. TypeScript Rules

Avoid introducing TypeScript errors.

Prefer explicit and maintainable types.

Do not use `any` merely to silence type errors unless there is a strong technical reason.

Prefer:

- proper interfaces
- type aliases
- inferred types when clear
- safe narrowing

over:

- `any`
- unsafe casts
- `@ts-ignore`

Do not hide errors instead of fixing them.

---

# 6. CSS and Tailwind Rules

The project uses both custom CSS and Tailwind CSS 4.

Respect the existing styling approach of the component being edited.

Do not migrate existing custom CSS to Tailwind unless specifically requested.

Do not migrate Tailwind code to custom CSS without a reason.

Avoid introducing duplicate styling systems for the same element.

Preserve:

- responsive breakpoints
- spacing logic
- typography hierarchy
- existing animations
- transition timing
- hover states

Before creating new global styles, check whether an existing reusable rule already exists.

Avoid unnecessary `!important`.

---

# 7. Responsive Design

Every meaningful UI change must be considered at:

- desktop
- tablet
- mobile

Do not optimize only for the current screenshot resolution.

Watch for:

- text overflow
- navigation collisions
- horizontal scrolling
- oversized headlines
- broken grid layouts
- images exceeding containers
- hover-only interactions on touch devices
- Canvas sizing problems

Do not change the desktop design merely to solve a mobile issue if a responsive rule can solve it cleanly.

---

# 8. Canvas Particle System

The cursor particle effect uses HTML5 Canvas 2D.

Treat it as a performance-sensitive visual system.

When modifying it:

- use `requestAnimationFrame`
- clean up animation loops when components unmount
- clean up event listeners
- avoid unnecessary React state updates every frame
- avoid excessive object allocation inside animation loops
- avoid unnecessary canvas resizing
- consider `devicePixelRatio`
- prevent memory leaks
- avoid blocking the main thread

Do not introduce Three.js or another 3D engine unless explicitly requested.

Do not replace the Canvas implementation merely because another library is available.

Preserve the intended visual feel of the particle interaction.

---

# 9. Performance

Do not introduce obvious performance regressions.

Pay special attention to:

- Canvas rendering
- large images
- unnecessary React re-renders
- client component boundaries
- animation loops
- scroll listeners
- mousemove / pointermove listeners
- large third-party dependencies

Prefer lightweight implementations for small visual interactions.

Use existing browser APIs where appropriate.

---

# 10. Dependency Safety

Do not install a new dependency when the feature can reasonably be implemented with the existing stack.

Before adding a dependency:

1. inspect existing dependencies
2. confirm the capability is not already available
3. consider whether native React / CSS / browser APIs can solve the problem

If a new package is genuinely necessary, explain why in the final summary.

Do not upgrade unrelated packages.

Do not perform broad dependency upgrades unless explicitly requested.

---

# 11. Package Manager

Use `pnpm`.

Do not use:

- npm install
- yarn
- bun

unless explicitly instructed.

Do not create:

- package-lock.json
- yarn.lock
- bun.lock

The existing pnpm lockfile should remain authoritative.

---

# 12. Validation Before Completion

Before declaring a coding task complete, inspect `package.json` and determine which validation scripts actually exist.

Do not invent script names.

Run the relevant available checks.

Typical checks may include:

- lint
- TypeScript type checking
- production build
- relevant tests

If an existing script is available, use it.

Examples:

`pnpm lint`

`pnpm exec tsc --noEmit`

`pnpm exec next build`

If no dedicated TypeScript script exists but TypeScript and `tsconfig.json` are present, `pnpm exec tsc --noEmit` may be used when appropriate.

For meaningful application changes, the production build should normally succeed before the task is considered complete.

Do not repeatedly run expensive checks when no code affecting them has changed.

Documentation-only changes do not require a full production build.

---

# 13. Fix Validation Failures

If a check fails because of the changes made during the current task:

1. investigate the failure
2. fix the cause
3. rerun the relevant check

Do not simply report an error that was introduced by your own changes and stop.

If the failure existed before the current task, clearly distinguish it from newly introduced issues.

Do not modify unrelated systems purely to silence an unrelated pre-existing warning.

---

# 14. Avoid Large Unnecessary Refactors

Do not perform broad architectural rewrites unless explicitly requested.

Do not:

- rename many files unnecessarily
- reorganize directories without need
- replace the styling system
- introduce a new state management library for a small feature
- replace working components solely for elegance
- rewrite the site while implementing a small UI change

Prefer incremental improvements.

A portfolio site should remain easy to understand and easy to modify.

---

# 15. Preserve Content

Do not modify portfolio copy, project names, dates, descriptions, links, images, or factual content unless requested.

When the task concerns layout or styling, treat existing content as locked.

Never invent project information.

Never silently replace assets.

---

# 16. Asset Handling

Before creating duplicate assets, check whether a suitable asset already exists.

Preserve existing filenames and paths when possible.

Avoid breaking references to:

- images
- fonts
- videos
- icons
- project thumbnails

Do not compress or alter source visual assets unless requested.

---

# 17. Accessibility

Preserve or improve basic accessibility.

Use semantic HTML where reasonable.

Interactive elements should remain keyboard-usable where applicable.

Images that communicate content should have meaningful alt text.

Do not sacrifice the intended visual design for unnecessary accessibility-driven redesigns, but avoid introducing obvious accessibility regressions.

---

# 18. Git and Repository Safety

Do not delete unrelated files.

Do not modify generated or configuration files without understanding their purpose.

Do not overwrite environment files.

Never expose secrets.

Do not commit:

- `.env`
- API keys
- private credentials
- authentication tokens

If environment variables are needed, use the project's existing environment-variable conventions.

---

# 19. Vercel Deployment Compatibility

Production targets Vercel using the standard Next.js build.

Code changes should remain compatible with that environment.

Avoid depending on:

- local-only filesystem behavior
- machine-specific absolute paths
- undocumented development-server behavior

A feature working locally is not sufficient if it breaks the production Next.js build.

---

# 20. Completion Report

After completing a task, provide a concise summary containing:

### Changed

Describe what was changed.

### Preserved

Mention important existing behavior or visual elements intentionally preserved when relevant.

### Validation

Report which checks were actually run and whether they passed.

Never claim that a test, build, visual review, or validation passed unless it was actually performed.

### Dependencies

If dependencies changed, state exactly what was added, removed, or updated and why.

If dependencies did not change, no dependency section is necessary.

### Remaining Issues

Only mention genuine unresolved issues.

Do not invent speculative problems.

---

# 21. Design Priority

When choosing between multiple technically valid implementations, prefer the solution that best preserves:

1. visual quality
2. interaction quality
3. responsiveness
4. performance
5. maintainability
6. simplicity

This is a design-led portfolio website.

The code exists to support the experience.
<!-- preview deployment test -->
