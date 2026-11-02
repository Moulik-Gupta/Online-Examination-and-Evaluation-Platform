# CheatBlock

An online exam platform with browser-based proctoring. Students take timed multiple-choice exams while the browser watches for signs of cheating. Admins create exams and questions, and review scores and warning logs.

**Live demo:** https://online-examination-and-evaluation.onrender.com/
The demo runs on a free plan. It can take about a minute to wake up, and its data resets after a restart.

## What it does

**For students**
- Sign in, see available exams, and take each exam once.
- A pre-exam check confirms the camera works and shows the rules.
- During the exam: a timer that cannot be stalled by slowing the browser, a question navigator, flagging, and a live warning log.
- The score comes from the server, never from the browser.

**Proctoring (in the browser)**
- Face check with MediaPipe: no face, or more than one face, for 4 seconds is logged.
- Tab switch, window blur, leaving fullscreen and camera loss are logged.
- Copy, cut, paste, right-click and common shortcuts are blocked (blocked, not counted).
- Five warnings submit the exam automatically.
- Only the timestamped log is stored. Camera images are never saved.

**For admins**
- Create and delete exams, and add, edit and delete questions.
- See every attempt with its score and warning count, and open the warning log for each one.

**Server rules**
- One attempt per student per exam.
- An exam with a scheduled time cannot be started before it.
- A submit that arrives more than 60 seconds after the time limit is saved with a score of 0.

## Honest limits

Browser proctoring is a deterrent and an evidence log, not a guarantee.

- It can be bypassed: a second device, a virtual camera, developer tools, or a person off camera.
- A web page cannot block `Alt+Tab`, `Ctrl+T`, `Ctrl+W`, or opening developer tools from the browser menu.
- Face detection can give false alarms (poor light, leaving the frame) and can miss things.
- The warning log is evidence for a person to review. It is not proof of cheating.
- Warnings are sent by the browser, so the server trusts them as sent.

## Tech

- **Client:** React 18, Vite, Tailwind CSS 4, shadcn/ui (Radix), recharts, `@mediapipe/tasks-vision`
- **Server:** Node 24, Express, SQLite through the built-in `node:sqlite`
- **Auth:** scrypt password hashes and an HMAC-signed HTTP-only session cookie (8 hours)

Node **24 or newer** is required (`node:sqlite` and `--env-file`).

## Run it locally

You need two terminals.

```
git clone <your-repo-url>
cd <repo-folder>
```

**Server** (`server/`):

```
cd server
pnpm install
```

Create `server/.env` (it is git-ignored):

```
PORT=3001
SESSION_SECRET=<a long random string>
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Then:

```
pnpm dev
```

The database file `cheatblock.db` is created on first run and filled with demo data if it is empty.

**Client** (`client/`):

```
cd client
pnpm install
pnpm dev
```

Open http://localhost:5173/. The Vite dev server proxies `/api` to port 3001.

**Demo accounts (local only):**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cheatblock.local` | `admin123` |
| Student | `student@cheatblock.local` | `student123` |

To reset the data: stop the server, delete `server/cheatblock.db`, and start it again.

Run every `pnpm` command inside `client/` or `server/`, never in the repo root.

## Environment variables (server)

| Variable | Purpose |
|---|---|
| `PORT` | Port to listen on (default 3001) |
| `SESSION_SECRET` | Secret for signing session cookies. Required. |
| `DATABASE_PATH` | Database file (default `cheatblock.db`, relative to where the server runs) |
| `NODE_ENV` | Set to `production` to make cookies `secure` |
| `ADMIN_PASSWORD`, `STUDENT_PASSWORD` | Passwords for the demo accounts. **Required in production**; locally they default to the simple passwords above. |

## Deploy

The server also serves the built client, so one service is enough (one URL, no CORS).

- **Build command:** `npm install -g pnpm && cd client && pnpm install && pnpm build && cd ../server && pnpm install`
- **Start command:** `cd server && node src/index.js`
- **Environment:** `NODE_VERSION=24`, `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `STUDENT_PASSWORD`
- The site must be served over **HTTPS** for the camera to work. Hosts do this by default.

SQLite is a file. On hosts with a temporary disk (such as free plans), data is lost on restart, and the demo data is created again. For real use, attach a persistent disk and set `DATABASE_PATH` to a path on it.

## Notes

- **Face model:** the small face detection model loads from a Google Storage URL when an exam starts, so students need an internet connection. To work offline, download the `.tflite` file into `client/public/` and point `modelAssetPath` in `ExamInterface.tsx` at it.
- **WASM files:** the MediaPipe engine files live in `client/public/mediapipe/wasm/`. After upgrading `@mediapipe/tasks-vision`, copy them again from `node_modules/@mediapipe/tasks-vision/wasm`.
- **Warning limit:** `VIOLATION_LIMIT` is a constant at the top of `client/src/app/components/ExamInterface.tsx`.

## API

All routes are under `/api`.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/health` | public | Server check |
| POST | `/auth/login` | public | `{ email, password }`, sets the cookie |
| POST | `/auth/logout` | public | Clears the cookie |
| GET | `/auth/me` | signed in | Current user |
| GET | `/exams` | signed in | List with question counts |
| GET | `/exams/:id` | signed in | Exam and questions, without correct answers |
| GET | `/completed-exams` | student | Ids of exams already submitted |
| POST | `/attempts` | student | `{ examId }`. Starts or resumes an attempt. Refused after a submit, or before the scheduled time. |
| POST | `/attempts/:id/violations` | student | `{ type, detail }` |
| POST | `/attempts/:id/submit` | student | `{ answers }`. Scored on the server. |
| GET | `/results` | signed in | The caller's finished attempts |
| POST, PUT, DELETE | `/admin/exams`, `/admin/exams/:id` | admin | Manage exams. Delete is refused if the exam has attempts. |
| GET, POST | `/admin/exams/:id/questions` | admin | Questions (with correct answers) |
| PUT, DELETE | `/admin/questions/:id` | admin | Manage a question |
| GET | `/admin/attempts` | admin | All attempts |
| GET | `/admin/attempts/:id/violations` | admin | Warning log for one attempt |

Violation types: `tab_switch`, `window_blur`, `fullscreen_exit`, `camera_lost`, `no_face`, `multiple_faces`.

## Project layout

```
client/   React app (Vite)
  src/app/components/   pages: Landing, Login, StudentDashboard, PreExamCheck,
                        ExamInterface, ResultsAnalytics, AdminDashboard
  src/app/api.ts        fetch helper
  src/app/auth.tsx      sign-in state
server/   Express API
  src/index.js          app, login, serves the client
  src/exams.js          exams, attempts, violations, submit
  src/admin.js          results and admin routes
  src/auth.js           passwords, sessions, role checks
  src/db.js             SQLite schema
  src/seed.js           demo data
```

## Known gaps

- No rate limiting on login.
- Sessions are stateless: signing out clears the cookie, but a stolen token stays valid until it expires.
- Violations are reported by the browser, so a determined user can suppress them.

## Authors

Moulik Gupta and Shubh Verma.

## Credits and license

The interface started from a frontend-only export from Figma Make. See `ATTRIBUTIONS.md` for the third-party components and assets used.

No license has been chosen yet.