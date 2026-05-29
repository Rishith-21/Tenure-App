# Tenure — Agent progress handoff

Quick glimpse of what was built and discussed in prior sessions.  
**Repo:** React Native app with centralized theme (`src/context/ThemeContext.tsx`, `src/theme/palettes.ts`).

---

## Profile page (rebuilt)

- Replaced problematic drawer-based profile with **`src/screens/UserProfileScreenClean.tsx`** (wired in `AppNavigator` / `MainTabNavigator`).
- Minimal themed UI: categories, availability, location, vehicle, profession, about, logout.
- **Edit profile:** photo (gallery), name, hourly rate.
- **Category / profession:** multi-select in sheets; **vehicle:** compact sheet.
- **Availability:** time range via `react-native-ui-datepicker` (From / To, time-only).
- **About:** draft + **Save about** button.
- **Identity verification:** Aadhaar card + modal (mock verify, masked number).
- **Appearance:** Light / Dark / System theme toggle (persisted).

---

## Create profile (`ProfileSetupScreen`)

- DOB with **18+** validation.
- Manual entry **DD/MM/YYYY** + calendar picker (`react-native-ui-datepicker`).
- Fixed picker date parsing for **Dayjs** objects in `onChange`.

---

## Chat UI

- Themed **`ConversationScreen`** + **`ChatHeader`**, **`ChatMessageList`**, **`ChatComposer`** via `useTheme()`.
- User wanted a more visible “premium” chat redesign — mostly polish so far, not a full visual overhaul.
- Fixed `ConversationScreen.tsx` syntax error (duplicate styles block).

---

## Home search (main late focus)

**Goal:** One search bar on Home — tap opens search in-place (not a second bar / separate page feel).

| Done | Detail |
|------|--------|
| Single bar | Collapsed = full-bar `Pressable`; open = same bar as `TextInput` |
| No Go button | Tap anywhere on bar opens search |
| Close | `×` icon when open |
| Results | `SearchPanel` embedded with `hideSearchRow`, shared `query` state |
| Current area | Hides smoothly on search open (collapse height); shadow off during transition for performance |
| Meet dates | Hidden while `searchOpen` |
| Android back | `BackHandler` closes search first, then normal back |
| Layout | Search bar `marginTop: 6`; results layer under bar; meet carousel not shown in search mode |

**Avoided / reverted:** heavy `HomeSearchOverlay` modal animations (lag, double bar, blue artifacts); navigating to separate `Search` screen from Home for this flow.

**Key files:** `src/screens/HomeScreen.tsx`, `src/components/search/SearchPanel.tsx`  
**May be unused:** `src/components/home/HomeSearchOverlay.tsx` — verify before deleting.

---

## Packages & config

- Added **`react-native-ui-datepicker`**.
- **`metro.config.js`:** `blockList` for `android/.cxx`, `.gradle`, `android/build` (Windows Metro watcher crashes).

---

## Environment notes (not code)

- Metro disconnect / “Unable to load script” on device → `adb reverse`, stable Metro, avoid frequent full resets.
- Do **not** commit `android/.cxx`, `.gradle` build artifacts.

---

## Suggested next steps (optional)

1. Final polish on Home search transition (single bar, no jank).
2. Stronger premium pass on chat UI if user wants visible change.
3. Theme-token pass on `SearchPanel` (still uses some `UI` static tokens in places).

---

## Prompt stub for new agent

```
Read AGENT_PROGRESS.md and continue Tenure RN.
Priority: Home search = one bar, in-page SearchPanel (hideSearchRow), hide meet dates when searching, back closes search first.
Also: UserProfileScreenClean, ProfileSetupScreen DOB 18+, ConversationScreen themed chat.
```

---

*Last updated from conversation handoff — adjust this file as work continues.*
