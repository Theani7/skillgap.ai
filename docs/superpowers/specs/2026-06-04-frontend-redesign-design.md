# Design Spec: Minimalist/Clean Frontend Redesign (Focused Canvas)

**Date:** 2026-06-04
**Status:** Draft
**Topic:** Frontend Redesign

## 1. Overview
Redesign the SkillGap.ai frontend from its current "Claymorphism" (bubbly/soft 3D) aesthetic to a modern, **Minimalist/Clean** design. The core user experience will shift from a wide dashboard to a **Focused Canvas** step-by-step flow.

## 2. Goals
- **Minimalism**: Reduce visual noise and cognitive load.
- **Clarity**: Use typography and white space to emphasize the resume analysis and roadmap.
- **Modernity**: Adopt a "Refined Flat" look with high-precision design tokens.
- **Focus**: Guide the user through a linear journey (Upload -> Analysis -> Results).

## 3. Architecture & Layout
- **Container**: Centered single-column layout with a `max-width` of `800px`.
- **Adaptive Height**: The main canvas grows and shrinks based on the current step's content.
- **Header**: Slim, high-contrast navbar with only essential links (Logo, Profile/Settings).
- **Background**: Subtle radial gradient (White to `--color-primary-50`) replacing the current "Floating Blobs."

## 4. Visual Language
- **Aesthetic**: Refined Flat. No heavy shadows or 3D effects.
- **Typography**: Hero 'Inter' font.
    - Large Title/Score: `--font-size-5xl` (48px), bold, `--color-neutral-900`.
    - Body: `--color-neutral-600` for reduced intensity.
- **Color Palette**:
    - **Primary**: White (`#FFFFFF`) and Light Gray (`--color-neutral-50`).
    - **Action**: Blue (`--color-primary-600`) for primary buttons and progress.
    - **Insight**: Purple (`--color-secondary-500`) for skill matches and successes.
- **Components**:
    - Border Radius: `--border-radius-lg` (8px).
    - Borders: Single-pixel hairline borders (`--color-neutral-200`).

## 5. Interaction Flow
1.  **Entry (Upload)**: A minimalist dashed drop-zone centered in the canvas.
2.  **Process (Analyzing)**: Smooth transition to a progress state with a thin brand-colored bar and status text updates.
3.  **Reveal (Results)**: The canvas expands vertically using `framer-motion`.
    - Level 1: Big Score.
    - Level 2: Skill Gap Analysis.
    - Level 3: Learning Roadmap (Fades in as the user scrolls).
4.  **Navigation**: Linear "Back" arrows within the canvas to maintain focus.

## 6. Technical Implementation
- **Transitions**: Heavy reliance on `framer-motion` for layout animations (`layout` prop) and opacity fades.
- **Styles**: Migration of existing component styles into a more modular CSS structure while leveraging the existing `tokens.css` (with refinements).
- **Responsive**: Mobile-first centered column.

## 7. Success Criteria
- The user can complete an analysis without visual distraction.
- The "Resume Score" is the most prominent element on the screen upon completion.
- The interface feels "light" and "premium."
