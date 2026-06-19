# Sprint 7: Password Change Design

## Goal

Add user self-service password change functionality to the Settings page.

## Scope

- **In scope:** Password change for logged-in users
- **Out of scope:** Forgot password (deferred until email service is added)

## Architecture

### Backend

**New endpoint:** `POST /api/auth/change-password`

- File: `api/routes/auth.py`
- Auth: Requires `get_current_user` (authenticated)
- Rate limit: `_check_strict_rate_limit` (20/min per IP)

**Request body:**
```python
class ChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)
```

**Flow:**
1. Validate current password against `users.hashed_password`
2. Hash new password with bcrypt (12 rounds)
3. Update `users.hashed_password`
4. Delete all refresh tokens for the user (forces re-login on other devices)
5. Return success response

**Error cases:**
- 401: Current password incorrect
- 400: New password same as current
- 429: Rate limit exceeded

### Frontend

**Modified file:** `frontend/src/pages/Settings.jsx`

Add a new "Security" section between "Data & Privacy" and "Danger Zone":

```
┌─────────────────────────────────────────┐
│ 🔒 Security                             │
│ Change your password.                   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Current Password        [👁]       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ New Password            [👁]       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Confirm New Password    [👁]       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Password requirements:                  │
│ • At least 8 characters                 │
│ • Different from current password       │
│                                         │
│                    [Change Password]    │
└─────────────────────────────────────────┘
```

**Features:**
- Show/hide password toggles (eye icon, reuse AuthModal pattern)
- Client-side validation:
  - All fields required
  - New password >= 8 chars
  - New password != current password
  - Confirmation matches new password
- Password strength indicator (optional, reuse AuthModal pattern)
- Success: clear form, show toast
- Error: show inline error message

**State additions:**
```javascript
const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const [passwordErrors, setPasswordErrors] = useState({});
const [passwordLoading, setPasswordLoading] = useState(false);
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
```

**Import additions:**
```javascript
import { Lock, Eye, EyeOff } from 'lucide-react';
```

## Security Considerations

1. **Authentication required** - endpoint uses `Depends(get_current_user)`
2. **Refresh token invalidation** - all sessions except current are terminated
3. **Rate limiting** - prevents brute force attacks
4. **No password logging** - passwords never appear in logs or responses
5. **bcrypt hashing** - 12 rounds, consistent with existing auth

## Files to Modify

| File | Change |
|------|--------|
| `api/routes/auth.py` | Add `ChangePassword` model, `POST /api/auth/change-password` endpoint |
| `frontend/src/pages/Settings.jsx` | Add Security section with password change form |

## Testing

1. **Happy path:** Login → Settings → Change password → Success toast → Verify old password fails → Verify new password works
2. **Wrong current password:** Should return 401
3. **Same password:** Should return 400
4. **Short password:** Client-side validation prevents submission
5. **Mismatch confirmation:** Client-side validation prevents submission
6. **Session invalidation:** Change password → other tabs should require re-login
