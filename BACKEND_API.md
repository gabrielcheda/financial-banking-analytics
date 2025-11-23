# Backend API Requirements

The web client proxies authenticated requests to the backend through `/api/internal/**`, which maps to `${NEXT_PUBLIC_BACKEND_API_URL}` (default `http://localhost:3001/api/v1`).  
The settings experience depends on the following REST endpoints. At the moment only `GET /auth/me` is available, so the remaining routes must be implemented server-side for the UI to persist data.

## 1. User Profile

### 1.1 Get Profile
- **Method/Path:** `GET /auth/me`
- **Purpose:** Populate the Settings page (profile tab, avatar, preferences).
- **Response shape:** 
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "+1 555 0100",
      "avatarUrl": "https://...",
      "preferences": { ... } // see section 2
    },
    "meta": { "timestamp": "...", "requestId": "..." }
  }
  ```

### 1.2 Update Profile
- **Method/Path:** `PUT /users/profile`
- **Used by:** Profile form (first name, last name, phone) and avatar upload.
- **Request body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+1 555 0100",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA..." // optional base64 payload, <= 2MB
  }
  ```
- **Response:** `ApiResponse<UserDTO>` with updated user and preferences.

## 2. User Preferences

The Preferences, Notifications, and Privacy tabs all call the same endpoints.

### 2.1 Get Preferences
- **Method/Path:** `GET /users/preferences`
- **Purpose:** Fetch structured preferences independently of `/auth/me` (React Query key `['user','preferences']`).
- **Response shape (simplified):**
  ```json
  {
    "success": true,
    "data": {
      "currency": "USD",
      "language": "en-US",
      "theme": "dark",
      "dateFormat": "MM/DD/YYYY",
      "timeFormat": "12h",
      "notifications": {
        "email": {
          "enabled": true,
          "billReminders": true,
          "budgetAlerts": true,
          "weeklyReports": true,
          "monthlyReports": false,
          "goalMilestones": true,
          "securityAlerts": true
        },
        "push": {
          "enabled": true,
          "billReminders": true,
          "budgetAlerts": false,
          "largeTransactions": true
        },
        "reminderTime": "09:00"
      },
      "privacy": {
        "showBalance": true,
        "analyticsConsent": false
      },
      "integrations": {
        "bankSync": {
          "enabled": false,
          "lastSync": null
        }
      }
    }
  }
  ```

### 2.2 Update Preferences
- **Method/Path:** `PUT /users/preferences`
- **Payload:** Partial updates are sent for each action. The backend should merge the provided fields into the stored preferences and return the updated structure.
- **Examples:**
  - Theme button:
    ```json
    { "theme": "light" }
    ```
  - Currency select:
    ```json
    { "currency": "BRL" }
    ```
  - Date or time format:
    ```json
    { "dateFormat": "DD/MM/YYYY" }
    { "timeFormat": "24h" }
    ```
  - Email notification toggles:
    ```json
    { "notifications": { "email": { "monthlyReports": true } } }
    ```
  - Push notification toggles:
    ```json
    { "notifications": { "push": { "largeTransactions": false } } }
    ```
  - Privacy toggles:
    ```json
    { "privacy": { "showBalance": false } }
    { "privacy": { "analyticsConsent": true } }
    ```
- **Response:** Updated `UserPreferencesDTO`.

## 3. Security

### 3.1 Change Password
- **Method/Path:** `POST /auth/change-password`
- **Payload:**
  ```json
  {
    "currentPassword": "oldPass123",
    "newPassword": "newPass456"
  }
  ```
- **Response:** `{ "success": true, "data": { "message": "Password updated" } }`
- **Notes:** The frontend validates `confirmPassword` before sending the request.

## 4. Additional Operations

The Privacy tab contains a "Danger Zone" delete button (not wired yet). When implemented it should call:
- **Method/Path:** `DELETE /users/account`
- **Payload:** `{ "password": "confirmPass" }`
- **Response:** `{ "success": true, "data": { "message": "Account deleted" } }`

## Summary

To unlock the Settings screen end-to-end the backend must expose:
1. `PUT /users/profile` (accepting base profile fields + avatar base64).
2. `GET /users/preferences` and `PUT /users/preferences` with support for the fields described above.
3. `POST /auth/change-password` (already referenced by the UI).
4. Optional `DELETE /users/account` for the danger zone.

Once these endpoints exist, the front-end will function without any further changes because every control now calls the respective mutation with the expected payloads.
