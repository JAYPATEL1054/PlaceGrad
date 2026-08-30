# PlaceGrad

A full-stack placement portal for college students — authentication, an
admin dashboard, company/application tracking, placement statistics, and
an AI-assisted chatbot and resume analyzer.

## 📌 Overview

PlaceGrad helps students track campus placement activity (companies,
applications, upcoming events, results) and get support through an
AI-powered chatbot and a resume feedback tool. It's built as two
cooperating services: a Node/Express + MongoDB backend for the portal
itself, and a Python/Flask microservice for the AI features.

## ✨ Features

- **Authentication** — registration, login, JWT sessions, bcrypt password
  hashing, OTP email verification, password reset, and rate-limited auth
  endpoints.
- **Admin dashboard** — manage companies, results, and events.
- **Company & application tracking** — students can view companies and
  track their applications.
- **Placement stats & upcoming events** — portal-wide statistics and event
  listings.
- **Academic results tracking** — dedicated model and routes.
- **AI chatbot ("PlaceGrad Bot")** — answers placement/career questions
  using Google Gemini, layered under keyword-matched responses for
  specific recruiting companies and common questions (greetings,
  interview tips, HR questions).
- **Resume analyzer** — extracts text from an uploaded PDF resume and
  gives a rule-based skill/experience breakdown, a heuristic job-fit
  score, and templated recommendations. *(Rule-based keyword matching,
  not a trained ML model.)*
- **Frontend pages** — aptitude test, resume builder, language-specific
  coding-question pages, interview prep, training/support pages.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Backend (main API) | Node.js, Express |
| Backend (AI microservice) | Python, Flask |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, bcrypt, OTP email verification |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Resume parsing | PyPDF2 |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, CORS |
| Frontend | HTML, CSS, JavaScript |

## 🏗️ Architecture

```text
Browser (public/)
        ↓
Node/Express server — port 3000
   ├─ /api/* → MongoDB (auth, companies, applications,
   │           placement stats, upcoming events, results)
   └─ /chat, /chat/ask → proxied to
                Flask microservice — port 5000
                   ├─ Keyword-matched responses
                   ├─ Google Gemini API
                   └─ /analyze → resume analyzer (rule-based)
```

## 🚀 Getting Started

This project runs as two services.

**Node/Express backend:**
```bash
npm install
npm run dev
```

**Python/Flask AI microservice:**
```bash
pip install -r requirements.txt
python app.py
```

## 🔧 Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | Node | MongoDB Atlas connection string |
| `JWT_SECRET` | Node | JWT signing secret (must be set — no safe default) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Node | Nodemailer (OTP/reset emails) |
| `GEMINI_API_KEY` | Flask | Google Gemini API key |

## 📂 Project Structure

```text
PlaceGrad/
├── server.js              # Express entry point
├── app.py                 # Flask AI microservice
├── config/                # DB, email, default-stats config
├── controllers/           # Route handlers
├── middleware/             # Auth, error handling
├── models/                 # Mongoose schemas
├── routes/                 # API route definitions
├── services/                # Email service
├── utils/                   # Validators
├── public/                  # Frontend (HTML/CSS/JS)
└── src/                      # Backend variant configured for Render deployment
```

## 🔮 Future Improvements

- Persist chatbot conversation history beyond the session.
- Replace the rule-based resume analyzer with an actual ML/NLP model.
- Consolidate the `src/` deployment variant to avoid duplicated code.

## 🎯 Skills Demonstrated

- Full-stack development (Express + MongoDB + vanilla JS frontend).
- Authentication & security: JWT, bcrypt, rate limiting, OTP verification.
- Multi-service architecture: Node backend proxying to a Python
  microservice.
- LLM API integration (Google Gemini) with prompt design and fallback
  handling.
- PDF parsing and text-based analysis.

## 👨‍💻 Author

Jay Patel

AI/ML Engineer | Data Science | Automation | Python | Data Analysis | Data Engineer
