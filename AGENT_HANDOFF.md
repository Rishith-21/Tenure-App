# Tenure — Agent Handoff / Progress Log

Quick glimpse of work done in this chat session.  
**Repo:** `D:/Projects/Tenure` · **Stack:** React Native, React Navigation, Reanimated, centralized theme.

---

## 1. Profile page rebuild

- User wanted profile page rebuilt from scratch (minimal UI, no old bottom-drawer behavior).
- **Screen:** `src/screens/UserProfileScreenClean.tsx` (wired in `AppNavigator` + `MainTabNavigator`).
- Category / profession / vehicle selection sheets (multi-select for category & profession).
- Profile card edit: photo (gallery), hourly rate, logout.
- About section with **Save about** (draft vs saved state).
- **Aadhaar identity verification** block + modal (mock verify, masked `XXXX XXXX ####`).
- **Appearance:** Light / Dark / System via `ThemeContext` (persisted in `src/utils/themeStorage.ts`).

---

## 2. Date & time pickers

- Installed **`react-native-ui-datepicker`**.
- **Profile availability:** From / To time range in modal (`initialView="time"`, `hideHeader`, themed).
- **Create profile (`ProfileSetupScreen`):** DOB with **18+** (`maxDate` = today − 18 years).
- DOB supports manual **DD/MM/YYYY** typing + calendar button.
- **Fix:** `toDate()` must handle **Dayjs** objects from picker (not only `Date` / string).

---

## 3. Chat UI (Conversation)

- Themed: `ConversationScreen.tsx`, `ChatHeader.tsx`, `ChatMessageList.tsx`, `ChatComposer.tsx` using `useTheme()`.
- User feedback: changes were subtle; wanted more visible “premium” chat — not fully redesigned.
- **Bug fixed:** duplicate `const styles = StyleSheet.create` + `createStyles` syntax error in `ConversationScreen.tsx`.

---

## 4. Metro / Android dev environment

- `metro.config.js`: `resolver.blockList` for `android/.cxx`, `.gradle`, `android/build` (Windows watcher ENOENT).
- User issues: Metro disconnect, “Unable to load script”, ADB — guidance given (adb reverse, avoid frequent reset).

---

## 5. Home search UX (main late focus)

**Goal:** One search bar on Home — tap anywhere → transition; **same bar** used for search (no second bar / separate-page feel).

### What we tried
- `HomeSearchOverlay` modal with custom animations → laggy, blue artifact lines, felt like double search bar.
- Brief switch to `navigate('Search')` → user rejected (felt like separate page).

### Current approach (`HomeScreen.tsx`)
- **Collapsed:** entire bar is `Pressable` → `openSearchOverlay()`.
- **Open:** same bar becomes `TextInput` (`autoFocus`), placeholder updates, **×** closes.
- **`SearchPanel`** embedded below with:
  - `hideSearchRow` (no second search row)
  - `query` / `onChangeQuery` shared with Home bar
- Removed **Go** button.
- **Android back:** `BackHandler` closes search first, then normal back.
- **Current area** card: animates out on search open (`maxHeight` → 0, opacity, translate); **`locationCardFlat`** disables shadow/elevation during transition (less jank).
- **Meet dates** carousel: hidden when `searchOpen`.
- Search bar: `marginTop: 6`; reduced upward shift; results layer `top: insets.top + 64`, `zIndex` below top bar.

### Key files
| File | Role |
|------|------|
| `src/screens/HomeScreen.tsx` | Search open/close, animations, embedded panel |
| `src/components/search/SearchPanel.tsx` | `hideSearchRow`, controlled `query` |
| `src/components/home/HomeSearchOverlay.tsx` | May be unused by Home now — verify before delete |

---

## 6. Open / optional next steps

- [ ] Stronger premium chat UI pass (user wanted more visible change).
- [ ] Final polish on Home search transition (single bar morph, no jank).
- [ ] Theme `SearchPanel` fully via `useTheme` (still uses some `UI` tokens).
- [ ] Commit only source changes — **do not commit** `android/.cxx`, `.gradle` build artifacts.

---

## Suggested prompt for next agent

```
Continue Tenure RN. Home search: ONE bar on HomeScreen — tap opens in-page search (SearchPanel with hideSearchRow), current area hides, meet dates hidden, back closes search first. Profile: UserProfileScreenClean, ui-datepicker, DOB 18+ on ProfileSetupScreen. Read AGENT_HANDOFF.md, HomeScreen.tsx, SearchPanel.tsx, UserProfileScreenClean.tsx.
```

---

*Last updated: session handoff — May 2026*
