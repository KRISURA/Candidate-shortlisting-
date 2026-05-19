# 🚀 Candidate Shortlisting System

AI-powered candidate shortlisting with OpenRouter integration.

---

## ⚙️ Setup Instructions

### Step 1: Configure Environment Variables

Open `backend/.env` and fill in your keys:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/candidate_shortlisting
JWT_SECRET=any_random_secret_string_here
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
```

#### 🗄️ MongoDB Atlas (Free):
1. Go to https://www.mongodb.com/atlas
2. Create free account → Create cluster (free tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<username>` and `<password>`

#### 🤖 OpenRouter API Key:
1. Go to https://openrouter.ai
2. Sign up → Go to "Keys" section
3. Create new key → Copy it
4. Paste in `OPENROUTER_API_KEY`

---

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Server starts at: http://localhost:5000

---

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

App opens at: http://localhost:5173

---

## 📁 Project Structure

```
Aifsd_EndsemPractice/
├── backend/
│   ├── models/
│   │   ├── User.js          # Recruiter auth model
│   │   ├── Candidate.js     # Candidate profile model
│   │   └── SavedShortlist.js
│   ├── routes/
│   │   ├── auth.js          # Login/Register
│   │   ├── candidates.js    # CRUD candidates
│   │   ├── match.js         # Shortlisting logic
│   │   └── ai.js            # OpenRouter AI
│   ├── middleware/
│   │   └── auth.js          # JWT protection
│   ├── server.js
│   └── .env                 # ← PUT YOUR KEYS HERE
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Candidates.jsx
        │   ├── AddCandidate.jsx
        │   ├── Shortlist.jsx    # Basic matching + chart
        │   ├── AIShortlist.jsx  # OpenRouter AI
        │   └── SavedShortlists.jsx
        └── context/
            └── AuthContext.jsx
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register recruiter |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/candidates | Add candidate |
| GET | /api/candidates | Get all (with search/filter) |
| DELETE | /api/candidates/:id | Delete candidate |
| POST | /api/match | Basic shortlisting |
| POST | /api/match/save | Save shortlist |
| GET | /api/match/saved | Get saved shortlists |
| POST | /api/ai/shortlist | AI-powered ranking |
| POST | /api/ai/interview-questions | Generate interview Qs |
