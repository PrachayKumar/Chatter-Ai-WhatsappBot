# 🤖 ChatterAI — AI-Powered WhatsApp Group Bot

ChatterAI is an AI-powered WhatsApp group assistant that understands conversations, maintains recent chat context, and decides when to participate. It can generate contextual replies and reactions, making group conversations more interactive.

Built using **Python, FastAPI, Node.js, Baileys, SQLite, and the Groq API**, ChatterAI combines a lightweight backend with WhatsApp messaging integration.

## ✨ Features

- **AI-Powered Conversations:** Uses an LLM to understand messages and generate context-aware responses.
- **Context Awareness:** Stores recent group messages to help the AI understand ongoing conversations.
- **Intelligent Participation:** Decides when to reply, react, or remain silent.
- **WhatsApp Integration:** Connects to WhatsApp using the Baileys library.
- **Persistent Storage:** Uses SQLite to store group messages and decision logs.
- **Modular Architecture:** Separates WhatsApp communication, backend APIs, and AI decision-making.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend and AI integration |
| FastAPI | REST API |
| Node.js | WhatsApp bot runtime |
| Baileys | WhatsApp Web connectivity |
| SQLite | Message and decision storage |
| Groq API | LLM inference |
| OpenAI Python SDK | API client for Groq |

## 🏗️ Architecture

```text
WhatsApp Group
      │
      ▼
Node.js + Baileys
      │
      ├── Receive messages
      ├── Send messages to backend
      └── Execute AI decisions
                │
                ▼
        Python + FastAPI
                │
          ┌─────┴─────┐
          ▼           ▼
       SQLite      Groq API
          │           │
          └─────┬─────┘
                ▼
        AI Action Decision
                │
                ▼
      Reply / React / No Action
```

## 📁 Project Structure

```text
whatsapp-group-bot/
│
├── backend/
│   ├── app.py
│   ├── .env
│   └── messages.db
│
├── whatsapp/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── auth_info/
│
├── .venv/
├── .gitignore
└── README.md
```

> The `.env`, `messages.db`, virtual environment, and WhatsApp authentication directory are local files and should not be committed to GitHub.

## ⚙️ Prerequisites

Install the following before running ChatterAI:

- Python 3.10 or later
- Node.js and npm
- A Groq API key
- A WhatsApp account for pairing the bot

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/whatsapp-group-bot.git
cd whatsapp-group-bot
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Set up the Python environment

From the project root, create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install fastapi "uvicorn[standard]" python-dotenv openai pydantic
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory.

```env
GROQ_API_KEY=your_groq_api_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=openai/gpt-oss-20b
```

Replace `your_groq_api_key` with your actual API key.

**Never commit your API key to GitHub.**

### 4. Start the FastAPI backend

Open a terminal in the project root and run:

```powershell
cd backend
python -m uvicorn app:app --reload
```

The backend should be available at:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Keep this terminal running.

### 5. Install the WhatsApp dependencies

Open a second terminal:

```powershell
cd whatsapp
npm install
```

### 6. Connect WhatsApp

Start the bot using the script defined in your `package.json`. If the entry point is configured as `index.js`, run:

```powershell
node index.js
```

Scan the QR code displayed in the terminal using WhatsApp's **Linked Devices** feature.

Once connected, add the bot account to a test group and send a few messages to test its behavior.

## 🔄 How It Works

1. ChatterAI receives messages from WhatsApp groups through Baileys.
2. Incoming messages are forwarded to the FastAPI backend.
3. The backend stores messages in SQLite.
4. When a decision is requested, the backend retrieves recent conversation history.
5. The AI analyzes the context and selects an appropriate action.
6. The WhatsApp bot executes the returned action.

Depending on the AI decision, ChatterAI can reply, react, perform both actions, or remain silent.

## 🔐 Security

- Keep API keys in environment variables.
- Never upload `.env` files.
- Never commit WhatsApp authentication credentials.
- Keep local databases and virtual environments out of version control.
- Do not expose the backend publicly without appropriate authentication and security controls.

## 🚧 Future Improvements

- Improved conversation memory and context management
- More natural conversational behavior
- Configurable group-level settings
- Better error handling and retry mechanisms
- Admin dashboard for monitoring bot activity
- Support for additional AI models

## 👨‍💻 Author

**Prachay Kumar Mudiga**

AI Developer | Python | Generative AI | Backend Development

## 📄 License

This project is available under the MIT License.

If you choose this license, add a `LICENSE` file containing the MIT License text and your copyright details.
