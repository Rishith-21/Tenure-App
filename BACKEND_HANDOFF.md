# Tenure Backend Handoff (From Current Frontend)

This document is inferred from current frontend screens in `src/screens`.

## 1) Product Flow Seen in Frontend

1. Splash -> Login
2. Login (phone input) -> OTP screen
3. OTP verify -> Profile creation
4. Profile creation save -> Location + language
5. Location + language save -> Category preference
6. Category preference save -> Home

## 2) Core Entities Needed

### User
- `id` (UUID)
- `tenureId` (string, unique; shown like `763GCG76` / `FGR45IH`)
- `phone` (string, unique, E.164 recommended)
- `name` (string)
- `gender` (enum: `man`, `woman`, `other`)
- `dob` (date)
- `profileImageUrl` (string)
- `onboardingCompleted` (boolean)
- `createdAt`, `updatedAt`

### OTP Session
- `id` (UUID)
- `phone` (string)
- `otpCodeHash` (string)
- `expiresAt` (timestamp)
- `attemptCount` (number)
- `isUsed` (boolean)
- `createdAt`

### User Location Profile
- `id` (UUID)
- `userId` (FK -> users)
- `countryCode` (string, e.g. `IN`)
- `stateCode` (string)
- `district` (string)
- `zipCode` (string)
- `lat` / `lng` (optional now, useful for map)
- `formattedAddress` (optional)
- `createdAt`, `updatedAt`

### User Languages
- `id` (UUID)
- `userId` (FK)
- `languageCode` (string; e.g. `en`, `kn`, `ml`, `hi`, `tcy`)

### User Category Preferences
- `id` (UUID)
- `userId` (FK)
- `categoryCode` (string)

### User Budget Preference
- `id` (UUID)
- `userId` (FK)
- `amountPerHour` (number)
- `currency` (string; default `INR`)

### Match/Request (for Home cards)
- `id` (UUID)
- `requesterUserId` (FK)
- `targetUserId` (nullable FK)
- `categoryCode` (string)
- `status` (enum: `open`, `accepted`, `completed`, `cancelled`)
- `meetDateTime` (timestamp)
- `location` (string/json)
- `createdAt`, `updatedAt`

### Active Session/Engagement (for top active card + timer)
- `id` (UUID)
- `userId` (FK)
- `peerUserId` (FK)
- `startedAt` (timestamp)
- `status` (enum: `active`, `ended`)

## 3) Suggested API Contract (v1)

Base: `/api/v1`

### Auth
- `POST /auth/send-otp`
  - body: `{ "phone": "+916263246705" }`
  - response: `{ "success": true, "requestId": "otp_req_xxx", "retryAfterSec": 30 }`

- `POST /auth/verify-otp`
  - body: `{ "phone": "+916263246705", "otp": "1234", "requestId": "otp_req_xxx" }`
  - response (existing user):
    - `{ "success": true, "token": "jwt", "refreshToken": "...", "user": {...}, "onboardingStep": "home" }`
  - response (new/incomplete onboarding):
    - `{ "success": true, "token": "jwt", "refreshToken": "...", "user": {...}, "onboardingStep": "profile" }`

- `POST /auth/resend-otp`
  - body: `{ "phone": "+916263246705", "requestId": "otp_req_xxx" }`
  - response: `{ "success": true, "requestId": "otp_req_yyy", "retryAfterSec": 30 }`

### Profile Onboarding
- `PUT /users/me/profile`
  - body: `{ "name": "...", "gender": "man", "dob": "2001-08-14", "profileImageUrl": "https://..." }`

- `PUT /users/me/location-language`
  - body:
    - `{ "countryCode": "IN", "stateCode": "KA", "district": "Dakshina Kannada", "zipCode": "576111", "languages": ["kn", "en"] }`

- `PUT /users/me/preferences`
  - body:
    - `{ "categories": ["movie_mate", "travel_mate"], "budget": { "amountPerHour": 50, "currency": "INR" } }`

- `GET /users/me`
  - returns assembled user profile + onboarding flags

### Home Screen
- `GET /home`
  - response:
    - `currentLocation` (formatted address)
    - `activeEngagement` (if any: peer info + startedAt or elapsedSec)
    - `incomingRequests` / `nearbyRequests` list with category + meet date

### Optional Master Data (recommended)
- `GET /meta/countries`
- `GET /meta/states?country=IN`
- `GET /meta/districts?state=KA`
- `GET /meta/languages`
- `GET /meta/categories`

(Frontend currently hardcodes options; these endpoints make it dynamic.)

## 4) Validation Rules Matching Frontend

- Phone must be Indian format in current UI: 10 digits starting with `6/7/8/9`.
- OTP currently 4 digits in UI.
- Name required.
- Gender required.
- DOB required.
- At least 1 language should be enforced server-side.
- Category/budget can be optional or required based on business decision (UI allows quick save flow).

## 5) Auth + Security Notes

- Use JWT access token + refresh token rotation.
- Store OTP hashed (never plaintext).
- OTP expiry: 2-5 min.
- Rate limit send/resend/verify by phone + IP.
- Lockout after repeated wrong OTP attempts.
- Add device/session tracking for logout-all support later.

## 6) Frontend Gaps Your Backend Friend Should Know

- No actual API integration yet (`axios` installed but unused).
- OTP screen currently uses a hardcoded phone display.
- Login screen has duplicate/unused OTP UI state (`showOtpBox`) and currently only navigates.
- Home screen cards/timer/location are all static placeholders.
- Image picker returns local URI; backend should ideally support upload flow (pre-signed URL or multipart endpoint).

## 7) Immediate Backend Deliverables (MVP)

1. Auth OTP endpoints (`send`, `verify`, `resend`).
2. `GET /users/me` and onboarding profile update endpoints.
3. Reference/meta endpoints for languages/categories/location.
4. `GET /home` aggregated payload.
5. DB schema + migrations for entities listed above.

## 8) Suggested Response Envelope

Use consistent envelope:
- Success: `{ "success": true, "data": { ... }, "message": "..." }`
- Error: `{ "success": false, "error": { "code": "INVALID_OTP", "message": "OTP is invalid" } }`

## 9) Suggested Error Codes

- `INVALID_PHONE`
- `OTP_EXPIRED`
- `OTP_INVALID`
- `OTP_ATTEMPTS_EXCEEDED`
- `ONBOARDING_INCOMPLETE`
- `VALIDATION_ERROR`
- `UNAUTHORIZED`

## 10) Frontend Integration Order

1. Integrate `send-otp` in Login.
2. Pass phone + requestId to OTP screen.
3. Integrate `verify-otp` and route using `onboardingStep`.
4. Integrate profile/location/preferences save endpoints.
5. Replace Home placeholders with `/home` data.
