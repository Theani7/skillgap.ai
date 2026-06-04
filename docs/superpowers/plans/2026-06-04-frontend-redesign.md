# Frontend Redesign: Minimalist/Clean focused Canvas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SkillGap.ai frontend to a modern, minimalist "Focused Canvas" aesthetic, removing Claymorphism and focusing on a centered, high-clarity user journey.

**Architecture:** A single-column centered layout (max-width 800px) with adaptive height and smooth state transitions using `framer-motion`.

**Tech Stack:** React 19, Vite, Framer Motion, Vanilla CSS (Design Tokens).

---

### Task 1: Refine Design Tokens & Global Styles

**Files:**
- Modify: `frontend/src/styles/tokens.css`
- Modify: `frontend/src/styles/theme.css`

- [ ] **Step 1: Update design tokens for the "Refined Flat" look.**
Replace bubbly values with minimalist ones.

```css
/* frontend/src/styles/tokens.css */
:root {
  /* ... keep color scales ... */
  
  /* Update Border Radius to be more "Soft-Rectangular" */
  --border-radius-lg: 0.5rem;     /* 8px */
  --border-radius-xl: 1rem;       /* 16px */
  --border-radius-2xl: 1.5rem;    /* 24px */
  
  /* Update Shadows to be extremely subtle */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.03);
}
```

- [ ] **Step 2: Update global theme and typography.**
Switch to 'Inter' as the primary font and clean up the global styles.

```css
/* frontend/src/styles/theme.css */
:root {
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-neutral-50);
}

body {
  font-family: var(--font-family-sans);
  background-color: var(--color-bg-primary);
  color: var(--color-neutral-900);
}

/* Remove Claymorphism effects */
.clay-bg, .clay-card {
  background: white !important;
  box-shadow: var(--shadow-sm) !important;
  border: 1px solid var(--color-neutral-200) !important;
}
```

- [ ] **Step 3: Commit changes.**
```bash
git add frontend/src/styles/tokens.css frontend/src/styles/theme.css
git commit -m "style: update design tokens and global theme for minimalist redesign"
```

---

### Task 2: Implement "Focused Canvas" Layout

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/components/FloatingBlobs.jsx`

- [ ] **Step 1: Update App.css for the centered canvas.**

```css
/* frontend/src/App.css */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top right, var(--color-primary-50), transparent);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}
```

- [ ] **Step 2: Remove visual noise (Floating Blobs).**

```jsx
// frontend/src/components/FloatingBlobs.jsx
// Simplify to return null or a very subtle background effect
export default function FloatingBlobs() {
  return null; // For true minimalism
}
```

- [ ] **Step 3: Update App.jsx routing layout.**
Ensure the layout respects the new centered canvas.

```jsx
// frontend/src/App.jsx
// ...
  return (
    <div className="app-shell">
      {!isLanding && !isAuth && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* ... */}
        </Routes>
      </main>
      {!isLanding && !isAuth && <Footer />}
    </div>
  );
// ...
```

- [ ] **Step 4: Commit changes.**
```bash
git add frontend/src/App.jsx frontend/src/App.css frontend/src/components/FloatingBlobs.jsx
git commit -m "layout: implement centered focused canvas architecture"
```

---

### Task 3: Redesign Navigation (Navbar & Footer)

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`
- Modify: `frontend/src/components/Footer.jsx`

- [ ] **Step 1: Simplify Navbar.**
Remove borders, use subtle shadow, clean up links.

```jsx
// frontend/src/components/Navbar.jsx
// ...
export default function Navbar() {
  return (
    <nav className="navbar" style={{ 
      border: 'none', 
      boxShadow: 'var(--shadow-sm)',
      padding: 'var(--space-4) var(--space-8)'
    }}>
      <div className="navbar-brand" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        SkillGap.ai
      </div>
      <div className="navbar-links">
        {/* Minimalist links */}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Simplify Footer.**
Reduce vertical height, use minimal typography.

```jsx
// frontend/src/components/Footer.jsx
// ...
export default function Footer() {
  return (
    <footer className="footer" style={{ 
      padding: 'var(--space-12) 0',
      borderTop: '1px solid var(--color-neutral-100)',
      textAlign: 'center',
      color: 'var(--color-neutral-400)'
    }}>
      <p>&copy; 2026 SkillGap.ai — Focused on your career growth.</p>
    </footer>
  );
}
```

- [ ] **Step 3: Commit changes.**
```bash
git add frontend/src/components/Navbar.jsx frontend/src/components/Footer.jsx
git commit -m "ui: redesign navbar and footer for minimalist look"
```

---

### Task 4: Redesign Landing Page

**Files:**
- Modify: `frontend/src/pages/Landing.jsx`

- [ ] **Step 1: Create a high-contrast minimalist hero.**
Use large 'Inter' typography and a focused primary CTA.

```jsx
// frontend/src/pages/Landing.jsx
// ...
const Hero = () => (
  <section className="hero" style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
    <h1 style={{ fontSize: 'var(--font-size-5xl)', letterSpacing: 'var(--letter-spacing-tight)' }}>
      Close your skill gap. <br/> <span style={{ color: 'var(--color-primary-600)' }}>Land your dream role.</span>
    </h1>
    <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-neutral-500)', margin: 'var(--space-8) 0' }}>
      AI-powered resume analysis and personalized learning roadmaps.
    </p>
    <button className="btn btn-primary btn-lg">Get Started</button>
  </section>
);
```

- [ ] **Step 2: Commit changes.**
```bash
git add frontend/src/pages/Landing.jsx
git commit -m "ui: redesign landing page with minimalist hero"
```

---

### Task 5: Redesign Analyzer Page (The Core Journey)

**Files:**
- Modify: `frontend/src/pages/Analyzer.jsx`

- [ ] **Step 1: Implement the minimalist Drop-Zone.**

```jsx
// frontend/src/pages/Analyzer.jsx
// ... redesign the dropzone div ...
<div className="dropzone" style={{
  border: '2px dashed var(--color-neutral-200)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--space-12)',
  transition: 'var(--transition-duration-normal)'
}}>
  <p>Drop your resume here or click to upload</p>
</div>
```

- [ ] **Step 2: Refactor Analysis Progress.**

```jsx
// frontend/src/pages/Analyzer.jsx
// ... replace complex loaders with a thin bar ...
<div className="progress-bar-container" style={{ height: '4px', background: 'var(--color-neutral-100)' }}>
  <motion.div 
    className="progress-bar" 
    style={{ height: '100%', background: 'var(--color-primary-600)' }}
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
  />
</div>
```

- [ ] **Step 3: Commit changes.**
```bash
git add frontend/src/pages/Analyzer.jsx
git commit -m "ui: redesign analyzer page upload and progress states"
```

---

### Task 6: Redesign Results Visualization

**Files:**
- Modify: `frontend/src/components/AnimatedScore.jsx`
- Modify: `frontend/src/components/ResultsDisplay.jsx`
- Modify: `frontend/src/components/Roadmap.jsx`

- [ ] **Step 1: Redesign AnimatedScore.**

```jsx
// frontend/src/components/AnimatedScore.jsx
// Focus on the number
<div className="score-container" style={{ fontSize: 'var(--font-size-5xl)', fontWeight: 'bold' }}>
  {score}
  <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-neutral-400)' }}>/100</span>
</div>
```

- [ ] **Step 2: Redesign ResultsDisplay cards.**

```jsx
// frontend/src/components/ResultsDisplay.jsx
// Use clean cards
<div className="result-card" style={{ 
  padding: 'var(--space-6)', 
  border: '1px solid var(--color-neutral-200)',
  borderRadius: 'var(--border-radius-lg)'
}}>
  {/* content */}
</div>
```

- [ ] **Step 3: Commit changes.**
```bash
git add frontend/src/components/AnimatedScore.jsx frontend/src/components/ResultsDisplay.jsx frontend/src/components/Roadmap.jsx
git commit -m "ui: redesign results visualization and learning roadmap"
```

---

### Task 7: Final Polish & Responsive Check

- [ ] **Step 1: Verify all transitions.**
Ensure `framer-motion` `AnimatePresence` and `layout` transitions are smooth.

- [ ] **Step 2: Mobile Responsiveness.**
Ensure the 800px canvas collapses gracefully on mobile.

- [ ] **Step 3: Final Commit.**
```bash
git commit --allow-empty -m "chore: finalize minimalist frontend redesign"
```
