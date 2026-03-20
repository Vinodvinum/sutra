# SUTRA — Complete Build Reference
# Give this file + sutra-advanced.html to Codex before every prompt

---

## WHAT IS SUTRA

SUTRA is a Life OS mobile app and web dashboard.
It tracks a user's discipline, health, finances, and growth
and combines them into a single number called the Life Score (0-100).

The app is inspired by Sanatana Dharma philosophy.
Every feature uses Sanskrit concepts as the naming system.

---

## PHILOSOPHY

- No social feed. No scrolling. Only action + feedback.
- Users see their Life Score every day. It goes up or down based on real behavior.
- Accountability Circles = small groups (max 8) who see each other's daily check-ins silently.
- Brahma AI = the intelligent guide that gives personalized insights based on the user's data.

---

## TECH STACK

Mobile App     → React Native + Expo
Web Dashboard  → Next.js (hosted on Vercel)
Authentication → Firebase Auth
Database       → Supabase (PostgreSQL)
AI             → OpenAI API (gpt-4o-mini)
Push Alerts    → Expo Notifications
Fonts          → Cinzel (headings) + Cormorant Garamond (body) + DM Sans (UI)

---

## DESIGN SYSTEM

### Colors
bg:        '#05060A'   ← main background
bg2:       '#080B12'
bg3:       '#0C1018'
surface:   '#111620'   ← card backgrounds
surface2:  '#181E2C'
border:    'rgba(255,220,130,0.07)'
border2:   'rgba(255,220,130,0.14)'
gold:      '#D4A853'   ← primary accent
gold2:     '#F0C97A'
gold3:     '#FFE4A0'
golddim:   'rgba(212,168,83,0.10)'
goldglow:  'rgba(212,168,83,0.20)'
saffron:   '#E8722A'
sacred:    '#7B5EA7'   ← purple
white:     '#F2EDE4'
white2:    '#A89F94'
white3:    '#574F47'
red:       '#D45C5C'
green:     '#52C97A'
blue:      '#4E8FD4'
teal:      '#3DBFAA'

### Fonts
Headings  → Cinzel (uppercase, letter-spacing 2px)
Body text → Cormorant Garamond (italic for quotes/descriptions)
UI labels → DM Sans (weights: 300, 400, 500)

### Rules
- NEVER use white backgrounds
- NEVER use Inter, Roboto, or Arial
- All cards: dark surface + subtle gold border
- Active states: golddim background + gold text
- Every screen has CosmosBackground (stars + nebula) behind content

---

## SANSKRIT NAMING SYSTEM

Discipline pillar  → Tapas (तप)
Health pillar      → Ārogya (आरोग्य)
Finance pillar     → Artha (अर्थ)
Growth pillar      → Vidyā (विद्या)

Daily tasks        → Dharma (धर्म)
Streak             → Agni Streak (अग्नि)
Circles            → Sacred Circles (संघ)
AI Guide           → Brahma (ब्रह्म)
Score labels       → Rebuilding / Building / Disciplined / Elite / Legendary
User role          → Sadhak (साधक) = seeker

---

## LIFE SCORE FORMULA

Total = (Tapas × 0.35) + (Ārogya × 0.25) + (Artha × 0.20) + (Vidyā × 0.20)

TAPAS (Discipline, 0-100):
  tasks_completed / tasks_total × 60
  + streak bonus: Math.min(25, Math.log(streakDays + 1) × 10)
  + circle check-in consistency: max 15 points

ĀROGYA (Health, 0-100):
  sleep hours score (6-8hrs optimal): max 50 points
  + sleep time consistency: max 15 points
  + movement logged: max 30 points
  - decays 5 pts/day if nothing logged

ARTHA (Finance, 0-100):
  (1 - wastePercent) × 50
  + savings goals on track × 30
  + clean spending days streak × 20

VIDYĀ (Growth, 0-100):
  learning logged today × 40
  + goal milestones hit × 40
  + reflection entries × 20

Score Labels:
  0-40:  "Rebuilding — पुनर्निर्माण"
  41-65: "Building — निर्माण"
  66-80: "Disciplined — अनुशासित"
  81-92: "Elite — श्रेष्ठ"
  93-100:"Legendary — महान"

Rules:
  - Score updates ONCE daily at 10 PM
  - 2 days no logging = -3 decay per day
  - First 7 days = baseline week (no score shown)

---

## AUTHENTICATION — FIREBASE

Provider: Firebase Auth
Methods: Email/Password + Google Sign In

Firebase config keys (user must add their own):
  apiKey
  authDomain
  projectId
  storageBucket
  messagingSenderId
  appId

Files:
  src/lib/firebase.ts      ← initialize Firebase app
  src/lib/firebaseAuth.ts  ← auth helper functions
  src/hooks/useAuth.ts     ← auth state listener

Auth flow:
  New user  → Welcome → Signup → GoalsSetup → BaselineWeek → Main App
  Returning → Welcome → Login → Main App
  Google    → One tap → if new user go to GoalsSetup, else Main App

After Firebase signup:
  - Get Firebase UID
  - Create matching row in Supabase profiles table using that UID as the id
  - This links Firebase auth to Supabase data

Firebase Auth functions needed:
  signUpWithEmail(email, password, name)
  signInWithEmail(email, password)
  signInWithGoogle()
  signOut()
  resetPassword(email)
  getCurrentUser() → Firebase User | null
  onAuthStateChanged(callback)

---

## DATABASE — SUPABASE

Tables:
  profiles          ← user info, linked to Firebase UID
  daily_logs        ← life score history per day
  tasks             ← today's dharma tasks
  circles           ← accountability groups
  circle_members    ← who is in which circle
  finance_logs      ← spending entries
  milestones        ← achievements unlocked

Key rule: profiles.id = Firebase Auth UID
This is how Firebase auth connects to Supabase data.

Supabase client uses anon key for public access.
Row Level Security is enabled on all tables.
Each user can only read/write their own data.

---

## APP SCREENS

### Mobile (React Native + Expo)

Auth Screens:
  WelcomeScreen      ← Om symbol, SUTRA logo, two buttons
  SignupScreen       ← name + email + password form
  LoginScreen        ← email + password + Google button
  ForgotPasswordScreen ← email input, sends reset link

Onboarding Screens:
  GoalsSetupScreen   ← 3 goal inputs + pillar selection chips
  BaselineWeekScreen ← explanation of 7-day watching period

Main App Screens (bottom tab navigation):
  HomeScreen         ← Life Score + tasks + graph + AI card
  CirclesScreen      ← Circle cards + member rows + SOS button
  IntelligenceScreen ← Weekly report + insight cards
  BrahmaScreen       ← AI chat interface
  FinanceScreen      ← Score + spending + goals
  IdentityScreen     ← Profile + reputation + milestones

### Web (Next.js)

/login             ← Login page
/signup            ← Signup page
/onboarding        ← Goals + baseline setup
/dashboard         ← Home equivalent (sidebar layout)
/circles           ← Circles page
/intel             ← Intelligence page
/brahma            ← AI chat page
/finance           ← Finance page
/identity          ← Identity page

---

## NAVIGATION STRUCTURE

Mobile:
  RootNavigator
  ├── AuthStack (not logged in)
  │   ├── WelcomeScreen
  │   ├── LoginScreen
  │   ├── SignupScreen
  │   └── ForgotPasswordScreen
  ├── OnboardingStack (logged in, not onboarded)
  │   ├── GoalsSetupScreen
  │   └── BaselineWeekScreen
  └── MainStack (logged in + onboarded)
      └── BottomTabNavigator
          ├── HomeScreen       ⊙
          ├── CirclesScreen    ◎
          ├── IntelligenceScreen ◈
          ├── BrahmaScreen     ✦
          ├── FinanceScreen    ◇
          └── IdentityScreen   ◉

---

## BRAHMA AI SYSTEM PROMPT

"You are Brahma — the intelligent life guide within SUTRA.
You speak with wisdom inspired by Sanatana Dharma, the Bhagavad Gita,
Chanakya Niti, and Arthashastra. You have access to the user's Life Score,
pillar data, streaks, and patterns. Keep responses under 60 words.
Speak directly. Reference Sanskrit concepts naturally.
Never be generic. Always be personal to their specific data."

Context to pass with every message:
  user name, life score, tapas score, arogya score,
  artha score, vidya score, streak days, top insight

---

## BOTTOM TAB BAR DESIGN

Background:    rgba(5,6,10,0.95) + blur
Border top:    1px rgba(255,220,130,0.07)
Height:        80px
Active item:   gold (#D4A853) + golddim background
Inactive item: #574F47
Font:          Cinzel, 8px, letter-spacing 2px
Icons:         ⊙ ◎ ◈ ✦ ◇ ◉ at 20px

---

## INPUT FIELD DESIGN

Background:       #111620
Border normal:    1px rgba(255,220,130,0.14)
Border focused:   1px rgba(212,168,83,0.5)
Text color:       #F2EDE4
Placeholder:      #574F47
Border radius:    14px
Padding:          16px horizontal, 14px vertical
Font:             DM Sans 14px
Label above:      Cinzel 9px, letter-spacing 2px, gold color

---

## COSMOS BACKGROUND

Animated background on every screen:
- 150 stars: small white dots, random positions, fade in/out
- 8 nebula blobs: large blurred circles, drift slowly
  Colors: gold rgba(212,168,83,0.08) and purple rgba(123,94,167,0.06)
- All animations loop forever
- Position absolute, behind all content
- useNativeDriver: true for performance

---

## CARD DESIGN

Standard card:
  background:    rgba(17,22,32,0.8)
  border:        1px rgba(255,220,130,0.07)
  border-radius: 20px
  padding:       22px
  backdrop-filter: blur(10px)

Gold glow card (score card):
  + radial gradient top-right corner in gold

Saffron glow card (finance):
  + radial gradient top-left corner in saffron

Sacred glow card (identity/growth):
  + radial gradient bottom-right corner in purple

AI/Brahma card:
  background: linear-gradient gold tint
  border: rgba(212,168,83,0.16)

---

## PLAY STORE SETUP

Tool:    EAS Build (Expo Application Services)
Command: eas build --platform android --profile production
Output:  .aab file → upload to Google Play Console

App details:
  Name:        SUTRA
  Package:     com.sutra.lifeos
  Version:     1.0.0
  Icon:        Dark background + gold Om ॐ symbol + "SUTRA" text
  Splash:      #05060A background + gold SUTRA centered

Cost:
  EAS Build free tier = 30 builds/month (enough for development)
  Google Play Console = $25 one-time fee
  Apple App Store = $99/year (do Android first)
