# DevMetric


**DevMetric** is a full-stack, AI-powered Developer Portfolio Analyzer. It helps developers instantly analyze their **GitHub**, **LeetCode**, and **Resume** to receive concise, actionable feedback and improvement tips—powered by **Google Gemini AI**.

---

## 🔥 Features

- **GitHub Analyzer**  
  Analyze your GitHub profile and repositories. Get a summary, top projects, and suggestions to improve.

- **LeetCode Analyzer**  
  Input your LeetCode stats (total, easy, medium, hard, categories) to receive a breakdown of your strengths, weaknesses, and a short plan for improvement.

- **Resume Analyzer**  
  Upload your PDF/DOCX resume and receive a realistic **ATS score**, summary, and tailored improvement tips.

- **AI-Powered Feedback**  
  All analysis and recommendations are powered by **Google Gemini AI** for natural, insightful feedback.

- **Modern Developer UI**  
  Clean, responsive design with **Tailwind CSS**, dark/light mode, and GitHub-style markdown rendering.

---

## 🛠 Tech Stack

| Layer      | Technologies                                                                 |
|------------|------------------------------------------------------------------------------|
| **Frontend** | React, Tailwind CSS, React Router, Marked.js, DOMPurify                     |
| **Backend**  | Node.js, Express, Gemini AI SDK, Multer, pdf-parse, mammoth                 |
| **Utilities**| Axios, dotenv, CORS                                                         |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devmetric.git
cd devmetric
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

- Create a `.env` file inside the `server` folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

- Start the backend:

```bash
npm start
# or
node index.js
```

Server will run at: [http://localhost:5000](http://localhost:5000)

---

### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
```

Frontend will run at: [http://localhost:3000](http://localhost:3000)  
API requests are proxied to the backend.

---

## 🧠 Analyzers & How to Use

### 🐙 GitHub Analyzer
- Enter your GitHub username or profile URL.
- See a summary of your profile, top repositories, and suggestions to improve.

### 🧮 LeetCode Analyzer
- Input your stats: total problems solved, easy/medium/hard counts, and categories.
- Get a breakdown of your coding strengths, gaps, and a short improvement plan.

### 📄 Resume Analyzer
- Upload a `.pdf` or `.docx` resume.
- Receive:
  - **Realistic ATS score**
  - A one-line professional summary
  - Key improvement tips

---

## 📡 API Endpoints

| Method | Endpoint               | Description                               |
|--------|------------------------|-------------------------------------------|
| POST   | `/api/analyze-github`  | Analyze a GitHub profile (`{ githubProfile: string }`) |
| POST   | `/api/analyze-leetcode`| Analyze LeetCode stats (`{ total, easy, medium, hard, categories }`) |
| POST   | `/api/analyze-resume`  | Analyze resume file (`form-data: resume`) |

---

## 🌐 Environment Variables

In the `server/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Gemini API key is required to enable AI-based analysis.

---

## 🎨 Customization & Branding

- Project name: **DevMetric** (used in tab title, manifest, navbar, footer, etc.)
- Logo & Favicon: `client/public/devmetric-favicon.ico`
- Footer layout:  
  - Left: Project name  
  - Center: GitHub / LinkedIn links  
  - Right: About / Contact  
- Fully responsive and mobile-optimized

---

## 🤝 Contributing

Want to contribute? Great! Follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add: New Feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 🙌 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/gemini-api/docs)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- [mammoth](https://www.npmjs.com/package/mammoth)

---

> **DevMetric** – Built by developers, for developers.  
> Analyze your skills. Improve your presence. Stand out from the crowd.
