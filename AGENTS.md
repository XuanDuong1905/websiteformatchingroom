# AGENTS.md

## Project Overview

This is a student project called **Ghep Tro - Ghep Ban**, a roommate and rental matching website for students.

The system helps users:

- Register and log in
- Create a roommate profile
- Find compatible roommates
- View matching scores and matching reasons
- Browse rental rooms
- Support safer and more transparent rental decisions

This repository uses **Next.js App Router** with the `src/app` directory.

## Source of Truth

The official tech stack document is the source of truth.

Official tech stack:

- Next.js
- React
- TailwindCSS
- MySQL / MariaDB
- Prisma
- JWT
- bcrypt
- Cloudinary
- React Hook Form
- Zod
- Git
- GitHub
- Vercel
- Local demo with npm commands

If a suggested folder structure conflicts with this tech stack, follow the tech stack.

Do not convert this project to Vite or another framework.

## Repository Context

Current repository structure uses:

```txt
src/app
src/app/api
src/lib
prisma
```

The project has:

```txt
next.config.ts
tsconfig.json
package.json
prisma.config.ts
src/app/layout.tsx
src/app/page.tsx
src/lib/prisma.js
```

This means the project should be treated as a **Next.js App Router** project.

## My Role

I am **Member 5 - Frontend Matching + Auth UI**.

My assigned work:

- Login UI
- Register UI
- Roommate profile form
- Matching result page
- MatchCard component
- Auth API integration
- Profile API integration
- Matching API integration
- Loading states
- Error states
- Empty states
- Responsive UI with TailwindCSS
- Form handling and validation with React Hook Form and Zod

## Main Rule

Focus only on Member 5 frontend work.

Do not rewrite the whole project.

Do not modify other members' modules unless absolutely necessary for integration.

Do not change database schema, Prisma models, or backend matching logic unless explicitly requested.

## Main Files To Create Or Update

Create or update these files:

```txt
src/app/login/page.tsx
src/app/register/page.tsx
src/app/profile/page.tsx
src/app/matches/page.tsx

src/components/LoginForm.tsx
src/components/RegisterForm.tsx
src/components/ProfileForm.tsx
src/components/MatchCard.tsx

src/lib/api/authApi.ts
src/lib/api/profileApi.ts
src/lib/api/matchApi.ts

src/lib/utils/format.ts
```

If a folder does not exist, create it.

Expected folders:

```txt
src/components
src/lib/api
src/lib/utils
```

## API Endpoints

Expected Auth APIs from Member 1:

```txt
POST /api/auth/login
POST /api/auth/register
GET  /api/users/me
```

Expected Profile and Matching APIs from Member 4:

```txt
POST /api/profiles
GET  /api/profiles/:userId
PUT  /api/profiles/:userId
GET  /api/matches/:userId
```

When calling APIs inside the same Next.js project, use relative paths.

Example:

```ts
fetch("/api/matches/1");
```

If frontend and backend are separated during local development, use:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
```

Do not hardcode external API URLs unless necessary.

## Profile Form Fields

The roommate profile form must use these exact field names:

```ts
type ProfileFormData = {
  userId: number;
  budgetMin: number;
  budgetMax: number;
  preferredDistrict: string;
  preferredGender: "male" | "female" | "any";
  hasPet: boolean;
  acceptPet: boolean;
  isSmoker: boolean;
  acceptSmoking: boolean;
  sleepTime: string;
  wakeTime: string;
  cleaningFrequency: "daily" | "weekly" | "monthly";
  privacyLevel: "low" | "medium" | "high";
  noiseLevel: "low" | "medium" | "high";
  guestFrequency: "rare" | "sometimes" | "often";
};
```

Do not rename these fields without confirmation because they must match Member 4's API.

## Profile Form UI Requirements

The profile page should include fields for:

- User ID
- Minimum budget
- Maximum budget
- Preferred district
- Preferred gender
- Has pet
- Accept pet
- Is smoker
- Accept smoking
- Sleep time
- Wake time
- Cleaning frequency
- Privacy level
- Noise level
- Guest frequency

Use Vietnamese labels for the user interface.

Example labels:

```txt
Mã người dùng
Ngân sách tối thiểu
Ngân sách tối đa
Khu vực mong muốn
Giới tính mong muốn
Có nuôi thú cưng
Chấp nhận thú cưng
Có hút thuốc
Chấp nhận hút thuốc
Giờ ngủ
Giờ thức dậy
Tần suất dọn dẹp
Mức độ riêng tư
Mức chấp nhận tiếng ồn
Tần suất có khách
```

## Matching Result Data

Each matching result item may look like:

```ts
type MatchItem = {
  user: {
    id: number;
    fullName: string;
    gender: string;
    school: string;
    reputationScore: number;
  };
  matchScore: number;
  scores: {
    sleepScore: number;
    cleaningScore: number;
    privacyScore: number;
    noiseScore: number;
  };
  reasons: string[];
};
```

## MatchCard Requirements

The `MatchCard` component must display:

- Full name
- Gender
- School
- Reputation score
- Total match score
- Sleep score
- Cleaning score
- Privacy score
- Noise score
- Matching reasons

Use a clean card layout with TailwindCSS.

The card should be responsive and easy to read during demo.

## Pages To Build

### `/login`

Login page.

Should include:

- Email input
- Password input
- Submit button
- Loading state
- Error message
- Link to register page

Expected API:

```txt
POST /api/auth/login
```

If login succeeds and backend returns token/user, store them if the project does not already have an auth strategy.

Suggested localStorage keys:

```txt
token
user
```

### `/register`

Register page.

Should include fields based on available backend API.

Expected basic fields:

- Full name
- Email
- Password
- Confirm password
- Gender
- School
- Phone, if supported by backend

Expected API:

```txt
POST /api/auth/register
```

If the exact register API response is unclear, implement defensive handling and add TODO comments.

### `/profile`

Roommate profile form page.

Should:

- Load existing profile if userId is available
- Allow creating a new profile
- Allow updating an existing profile
- Use React Hook Form
- Use Zod validation
- Show loading, error, and success states

Expected APIs:

```txt
GET  /api/profiles/:userId
POST /api/profiles
PUT  /api/profiles/:userId
```

### `/matches`

Matching result page.

Should:

- Get current userId
- Fetch matching results
- Render a list of `MatchCard`
- Show loading state
- Show error state
- Show empty state if no matches are found

Expected API:

```txt
GET /api/matches/:userId
```

## Validation Rules

Use React Hook Form and Zod.

Validate at least:

- Email must be valid
- Password must not be empty
- Password should have a minimum length
- Required fields must not be empty
- Budget values must be positive numbers
- `budgetMax` must be greater than or equal to `budgetMin`
- Time fields must not be empty
- Select fields must use valid enum values

## API Helper Rules

Create API helper files:

```txt
src/lib/api/authApi.ts
src/lib/api/profileApi.ts
src/lib/api/matchApi.ts
```

Each helper should:

- Use `fetch`
- Set `Content-Type: application/json` when sending JSON
- Parse JSON response safely
- Throw clear errors when request fails
- Use relative paths by default

Example style:

```ts
async function request(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
```

## UI Style

Use TailwindCSS.

UI should be:

- Clean
- Simple
- Responsive
- Suitable for student project demo
- Easy to explain during presentation

Use Vietnamese text for visible UI labels, buttons, and messages.

Implementation notes and code comments may be in English.

## Loading, Error, Empty States

Every API-driven page should include:

- Loading state while fetching
- Error state if API fails
- Empty state if there is no data
- Success message after successful form submission

Example empty state for matching:

```txt
Chưa tìm thấy người ở ghép phù hợp.
```

## Auth Handling

If backend returns a JWT token, store it only if no other auth strategy exists.

Suggested localStorage keys:

```txt
token
user
```

When calling protected APIs, include token if available:

```ts
Authorization: Bearer ${token}
```

If the backend does not require token yet, keep the code defensive.

Do not assume the exact Auth API response unless already documented.

Add TODO comments for unclear parts.

## Git Rules

Current working branch may be named:

```txt
Trung
```

Do not commit directly to `main`.

Make small commits.

Suggested commits:

```bash
git add .
git commit -m "Add member 5 API helpers"
git commit -m "Add auth UI pages"
git commit -m "Add roommate profile form"
git commit -m "Add matching result page"
```

## Commands

Install dependencies:

```bash
npm install
```

Install Member 5 form dependencies if missing:

```bash
npm install react-hook-form zod @hookform/resolvers
```

Run development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build project:

```bash
npm run build
```

## Do Not Do

Do not:

- Convert the project to Vite
- Convert App Router to Pages Router
- Mix App Router and Pages Router unnecessarily
- Rewrite the whole project
- Delete other members' files
- Change Prisma schema without confirmation
- Change database models without confirmation
- Change backend matching algorithm
- Rename Profile API fields
- Add unnecessary dependencies
- Hardcode data permanently without TODO comments
- Break the existing homepage

## Assumptions To Confirm

Before final integration, confirm these with the team:

1. Exact Auth login request body and response body
2. Exact Auth register request body and response body
3. Whether `/api/users/me` exists
4. How to get current `userId`
5. Whether JWT is required for Profile and Matching APIs
6. Whether profile field names are final
7. Whether districts use English values like `Thu Duc` or Vietnamese values like `Thủ Đức`
8. Whether seed data exists for testing matching results

## Final Summary Required

After making changes, summarize:

1. Files created or changed
2. How to run the project locally
3. Which APIs are connected
4. Which assumptions were made
5. What still needs confirmation from Member 1 or Member 4
6. Any errors or limitations found during implementation
