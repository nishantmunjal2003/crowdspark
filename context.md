# Context

## 1. What is this app?

This project is a **SaaS web application for live, interactive quizzes and polls**, similar in spirit to Kahoot.

Facilitators (teachers, trainers, speakers, etc.) can:

- Sign up themselves (self-service onboarding)
- Create question sets with correct answers
- Run live sessions where participants join by scanning a QR code
- See audience responses and live bar graphs in real time on a projector/host screen

Participants (students / audience) **do not need an account**. They simply scan the QR code, wait for the host to start, and answer questions on their mobile devices.

---

## 2. SaaS Model & Multi-Tenancy

The app is designed as a **multi-tenant SaaS**:

- Each **account (tenant)** represents an individual facilitator or an institution/team.
- Users can **self-signup** using email/password (and optionally SSO in the future).
- All quizzes, sessions, and responses are logically scoped to their owner (tenant).
- A **global platform admin** can manage all tenants and users from a central admin panel.

At a minimum, roles:

1. **Super Admin (Platform Owner)**
   - Manages all users and tenants
   - Can view and manage all quizzes/sessions (for support/audit)
   - Can manage system settings and (optionally) plans/billing in future

2. **Tenant User (Facilitator / Teacher)**
   - Signs up and logs in
   - Creates question banks/quizzes
   - Starts live sessions
   - Monitors live responses and results

3. **Participant (Student / Audience)**
   - No login
   - Joins via QR/session link
   - Receives questions in real time
   - Submits answers

---

## 3. Core Flows

### 3.1 Sign Up & Onboarding (SaaS)

1. User visits landing page and clicks **“Sign Up”**.
2. Fills in minimal details (Name, Email, Password, Organization Name [optional]).
3. Email verification (optional in MVP, recommended later).
4. Redirected to **Dashboard** with a simple “Create your first quiz” CTA.

### 3.2 Quiz/Question Management

After login, a tenant user can:

- Create **Question Sets** / Quizzes.
- For each question:
  - Question text
  - Question type (MCQ single choice, multiple select, true/false, etc.)
  - Options
  - Mark the **correct answer(s)**.
  - Optionally, time limit per question and explanation text.

Quizzes are saved and can be reused across multiple sessions.

### 3.3 Running a Live Session

1. Facilitator selects a quiz and clicks **“Start Live Session”**.
2. System generates:
   - A unique **Session Code**
   - A **QR Code** with an auto-join URL (e.g. `/join/{session_code}`)
3. On the **Host Screen** (projector) we show:
   - QR Code
   - Simple text: _“Scan to join this session”_

4. Participants scan the QR code:
   - They are taken to a **waiting screen** with a friendly message, e.g.  
     _“Something magical is happening here. Please wait for the host to start…”_

5. Host clicks **“Launch Question 1”**:
   - Question appears on:
     - Host Screen (for display)
     - All connected participant devices (without page refresh; via real-time updates)

6. Participants submit answers:
   - Their answers are stored in real time.
   - Host screen shows a **live bar graph** of answer distribution (e.g., A/B/C/D) updating as responses come in.

7. Host can:
   - Show/hide the correct answer on the projector.
   - Move to the next question.
   - End the session and view summary.

---

## 4. Admin Panel

### 4.1 Super Admin Panel (Platform Level)

Key capabilities:

- View list of **all registered users/tenants**
  - Name, Email, Sign-up date, Last login
  - Status (active/suspended)
- Search & filter users
- View usage metrics (number of quizzes, sessions, responses per tenant)
- Deactivate/ban a user if needed
- Impersonate a user (for support) – optional

Future extensions:

- Manage pricing plans and subscription tiers
- Billing overview & invoices
- System-wide configurations (branding, email settings, limits)

### 4.2 Tenant Admin / User Dashboard

- Overview:
  - Number of quizzes
  - Number of sessions run
  - Recent activity
- Quiz Management:
  - Create, edit, delete quizzes and questions
- Live Sessions:
  - Start new session from a quiz
  - Access past session summaries
- Account Settings:
  - Update profile and organization name
  - Change password

---

## 5. Real-time Behaviour

Real-time updates are crucial:

- When the host **changes the current question**, all connected participant clients should:
  - Immediately show the new question and options
  - No manual refresh
- When participants **submit answers**, the host screen:
  - Updates the **bar graph** in real-time to reflect distribution
- Technology options:
  - WebSockets (e.g., Laravel WebSockets, Pusher, or similar)
  - Or Firebase Realtime Database / Firestore listeners

The exact choice can be decided based on infrastructure & hosting preferences, but from a **product context** point of view, the app assumes real-time messaging capabilities.

---

## 6. Non-goals (for MVP)

To keep the initial version focused and shippable, the **MVP will NOT** include:

- Complex gamification (leaderboards, points, avatars, badges)
- Payment integration / subscription billing (can be added later)
- Detailed analytics dashboards
- Advanced question types (drag-and-drop, matching, etc.)
- Custom branding per tenant (white-labelling)

These can be future features once the core live quiz engine and SaaS user flows are stable.

---

## 7. Target Users & Use Cases

- **Teachers**: Quick formative assessment in class.
- **Trainers**: Warm-up questions, knowledge checks during workshops.
- **Conference Speakers**: Live audience polling.
- **Universities / Colleges**: Centralized engagement tool across departments.

The key principle: **“Self-sign up, create questions, start a live session, and see responses in real time.”** No IT support required.

---

## 8. Summary

This SaaS application provides:

- A **self-service platform** for anyone to create and run live quizzes.
- A **multi-tenant**, admin-managed environment that can scale to many users and institutions.
- A smooth, **QR-based join flow** for participants.
- A **real-time experience** where questions and live bar graphs are synchronized across screens without refreshing.

This `context.md` should guide product decisions, technical architecture, and feature prioritization as the project grows.
