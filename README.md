# 🐝 SkillHive: Peer-to-Peer Skill Exchange

SkillHive is a decentralized learning platform where knowledge is the only currency. Exchange your expertise for new skills, guided by AI.

## 🚀 Core Features
- **🧠 AI Synergy Engine**: Semantic peer matching using Gemini 3 Flash.
- **🗺️ AI Roadmaps**: Personalized 5-step learning paths for any skill.
- **✅ Skill Verification**: Adaptive AI quizzes to earn "Verified" badges.
- **🎨 Collaborative Whiteboard**: Real-time shared canvas for visual teaching.
- **💬 Secure Messaging**: Real-time chat with file sharing and safety controls.
- **🏆 Gamified Progress**: Earn credits and badges for completing tasks.

## 🛠️ Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **AI**: Google GenAI SDK (Gemini 3 Flash & Lite)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Analytics**: Recharts

## ⚙️ Setup Instructions
1. **Clone the project** to your local directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**: Create a `.env` file with:
   ```env
   API_KEY=your_google_gemini_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Initialize Database**: Execute the `supabase_schema.sql` in your Supabase SQL Editor.
5. **Run the App**:
   ```bash
   npx serve
   ```
---
*Built for the future of decentralized education.*