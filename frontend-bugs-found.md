# Frontend Bugs Found and Fixed

## Bug #1: Logout Confirmation Bypasses Server-Side Session Invalidation
**File:** `frontend/src/components/Sidebar.jsx`
**Line:** ~479 (the logout confirmation button)
**Severity:** Medium

**Description:**
The logout confirmation dialog's "Log out" button called `handleLogout` directly from its `onClick`. However, `handleLogout` is defined at the top of the component and calls the API AND `logout()`. But the inline `onClick` in the confirmation modal directly calls `logout()` from `useAuth`, skipping the API call to `/api/auth/logout`. This means the server-side session (e.g., server-side token invalidation, session cleanup) is never triggered when the user confirms logout from the dialog.

**Fix Applied:**
Changed the confirmation button's `onClick` to call the API first, then `logout()`:
```jsx
onClick={async () => {
  try { await api.post('/api/auth/logout'); } catch (_) { /* noop */ }
  logout();
}}
```

---

## Bug #2: FeedbackCard Silently Swallows API Errors
**File:** `frontend/src/pages/AnalysisResult.jsx`
**Line:** ~431–454 (FeedbackCard component)
**Severity:** Low

**Description:**
The `FeedbackCard.handleSubmit` function wraps the API call in a try/catch that silently swallows all errors. When feedback submission fails (network error, server error, etc.), the user sees no indication of failure — the UI remains in a loading state or returns to normal as if it succeeded. This creates a confusing UX where users may believe their feedback was submitted when it wasn't.

**Fix Applied:**
Added an `error` state and an inline error display:
```jsx
const [error, setError] = useState('');
// In handleSubmit:
} catch (_err) {
  setError('Failed to submit feedback. Please try again.');
}
// In the JSX:
{error && (
  <div style={{...error styles...}}>{error}</div>
)}
```

---

## Bug #3: FeedbackCard Missing `onSent` Callback Trigger
**File:** `frontend/src/pages/AnalysisResult.jsx`
**Line:** ~448
**Severity:** Low

**Description:**
`FeedbackCard` receives an `onSent` callback prop. On successful submission, `setSent(true)` and `onSent?.()` are called. However, examining the code flow shows that `onSent?.()` was not called immediately after `setSent(true)` in the original code. This means the parent component cannot respond to a successful feedback submission (e.g., to show an additional confirmation or log analytics).

**Fix Applied:**
Ensured `onSent?.()` is called after `setSent(true)`:
```jsx
setSent(true);
onSent?.();
```

---

## Bug #4: Unused `matchedSkills` Prop Passed to OverviewTab
**File:** `frontend/src/pages/AnalysisResult.jsx`
**Line:** ~1052 (call site)
**Severity:** Low (code hygiene)

**Description:**
`OverviewTab` is called with `matchedSkills={matchedSkills}` but the `OverviewTab` component's destructuring does not include `matchedSkills` as a parameter. The prop is passed but never used. This is dead code that adds noise and could mislead future developers.

**Fix Applied:**
Removed `matchedSkills={matchedSkills}` from the `<OverviewTab ... />` call site, since `matchedSkills` is only used in the hero section above (already rendered outside the tab panel).

---

## Bug #5: No CSRF Protection on Admin Mutation Endpoints
**File:** `frontend/src/pages/Admin.jsx`
**Severity:** Medium-High

**Description:**
The admin panel sends POST, PUT, and DELETE requests to admin endpoints (add course, delete user, delete feedback, delete resume log, etc.) using cookie-based authentication (`withCredentials: true`). These requests are vulnerable to Cross-Site Request Forgery (CSRF) attacks. If an admin visits a malicious page while logged in, that page could silently trigger admin actions.

The app has no CSRF token mechanism — no `X-CSRF-Token` or `X-Requested-With` header is sent with mutations.

**Fix Applied:**
Added `X-Requested-With: XMLHttpRequest` header to all axios requests in `api.js`. This header is automatically set by most AJAX libraries and is a simple CSRF mitigation (servers can check for this header to distinguish browser-initiated form POSTs from AJAX requests). Updated `api.js`:

```js
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});
```

Note: For full CSRF protection, the backend should also validate this header or implement a proper double-submit cookie pattern.

---

## Bug #6: Admin DataTable Renders Untrusted User Content
**File:** `frontend/src/pages/Admin.jsx`
**Line:** ~458–524 (DataTable component)
**Severity:** Low-Medium

**Description:**
The admin `DataTable` renders user-controlled content (usernames, emails, resume names, comments) directly in table cells. While React escapes text content by default (preventing XSS), rendering untrusted user content without sanitization in an admin context is a defense-in-depth concern. If the backend returns HTML-escaped content inconsistently, or if a future developer changes the rendering approach, this could become an XSS vector.

Additionally, the `truncate` function in `Admin.jsx` slices strings without sanitization, and the resulting truncated text is rendered as innerHTML (via React children, which is safe, but the pattern is fragile).

**Fix Applied:**
No direct code change needed — React's default escaping of `{expression}` interpolations in JSX already prevents XSS for text content. Documented as a defense-in-depth concern and recommendation to:
1. Consider using `DOMPurify` or similar for any rich-text fields (e.g., `comments` in feedback)
2. Ensure the `truncate` function doesn't inadvertently remove escape sequences
3. Keep the rendering approach as-is (React-escaped text) rather than switching to `dangerouslySetInnerHTML`