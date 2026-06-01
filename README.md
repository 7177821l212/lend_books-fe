# LendBook — Mobile App (React Native / Expo)

> **Phase 1 Foundation** — Money lending management app for informal lenders.  
> Built with React Native (Expo), TypeScript, React Query, and Axios.

---

## Overview

LendBook is a mobile-first lending management platform with two distinct user roles:

| Role | Access | Primary Flow |
|---|---|---|
| **Investor (Owner)** | Dashboard, Customers, Loans, Team, Reports | Create loans, monitor collections, manage collectors |
| **Collector (Field Agent)** | Today's pickups, Collect payment, History, Profile | Daily collection route, record payments |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.76 + Expo 52 |
| Language | TypeScript (strict) |
| Navigation | React Navigation v7 (Bottom Tabs + Native Stack) |
| State — Server | TanStack React Query v5 |
| State — Auth | React Context + expo-secure-store |
| HTTP Client | Axios (with JWT interceptor) |
| Forms | React Hook Form + Zod |
| Build | Expo EAS Build |
| Updates | Expo EAS Update (OTA) |

---

## Project Structure

```
src/
├── app/
│   └── navigation/
│       ├── RootNavigator.tsx       # Role-based routing
│       ├── InvestorNavigator.tsx   # Investor tab layout
│       └── CollectorNavigator.tsx  # Collector tab layout
├── assets/                         # Images, fonts
├── components/
│   ├── ui/                         # Button, Card, Badge
│   └── layout/                     # ScreenWrapper
├── config/
│   └── constants.ts                # Brand colors, status colors
├── features/
│   ├── auth/                       # Login screen, AuthContext, useLogin
│   ├── investor/
│   │   ├── dashboard/              # KPIs, trend chart, activity feed
│   │   ├── customers/              # List + detail + blacklist
│   │   ├── loans/                  # Detail + new loan form
│   │   ├── team/                   # Collectors management
│   │   └── reports/                # Overdue + analytics
│   └── collector/
│       ├── my-day/                 # Daily pickup list
│       ├── collect/                # Record payment (CASH/UPI/BANK + proof)
│       ├── history/                # Past collections
│       └── profile/                # Settings, sign out
├── hooks/                          # Global shared hooks
├── lib/
│   └── api.ts                      # Axios instance + interceptors
├── types/
│   └── index.ts                    # All domain TypeScript types
└── utils/
    ├── currency.ts                 # formatINR (₹1.7L notation)
    └── date.ts                     # formatDate, getInstallmentStatus
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli eas-cli`
- iOS Simulator (Mac) or Android Emulator

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set API_URL to your backend

# 3. Start development
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `API_URL` | FastAPI backend base URL | `http://localhost:8000/api/v1` |

---

## Authentication

- **Investor login**: email + password
- **Collector login**: email + password (Phase 1) → phone OTP (Phase 2)
- Tokens stored in `expo-secure-store` (iOS Keychain / Android Keystore)
- JWT auto-attached to every request via Axios interceptor
- Auto-logout on 401

---

## Screens — Phase 1

### Investor (8 screens)

| Screen | Route | Status |
|---|---|---|
| Login | `/login` | ✅ Done |
| Dashboard | `/dashboard` | 🔧 In progress |
| Customer List | `/customers` | 🔧 In progress |
| Customer Detail | `/customers/:id` | 🔧 In progress |
| Loan Detail | `/loans/:id` | 🔧 In progress |
| New Loan | `/loans/new` | 🔧 In progress |
| Team | `/team` | 🔧 In progress |
| Reports | `/reports` | 🔧 In progress |

### Collector (5 screens)

| Screen | Route | Status |
|---|---|---|
| My Day (pickup list) | `/my-day` | 🔧 In progress |
| Collect Payment | `/collect/:loanId` | 🔧 In progress |
| History | `/history` | 🔧 In progress |
| Profile | `/profile` | 🔧 In progress |

---

## Build & Deploy

### Development Build (internal testing)
```bash
eas build --platform android --profile development
```

### Production Build
```bash
eas build --platform all --profile production
eas submit --platform all
```

### OTA Update (JS-only changes — no store review needed)
```bash
eas update --branch production --message "feat: add collect proof photo"
```

---

## Code Standards

Follows [GenWorx COE React Standards](../docs/COE/react-standard.md):
- Feature-based folder structure
- Hooks handle logic, components handle rendering
- All API calls through `src/lib/api.ts`
- TypeScript strict mode enforced

---

## Backend

See [`lendbook-be`](https://github.com/7177821l212/lend_books-be) — FastAPI + PostgreSQL.

API base URL configured in `app.config.js` via `extra.apiUrl`.
