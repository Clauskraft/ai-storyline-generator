<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Storyline Generator

Transform text into compelling presentation storylines with AI-powered slide generation.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

## 🎯 Features

- **AI-Powered Generation**: Convert text into structured presentations
- **Multiple Presentation Models**:
  - Standard Presentation (flexible format)
  - McKinsey Method (Pyramid Principle, MECE, Action Titles)
  - Custom (user-defined)
- **Image Generation**: AI-generated images or Unsplash integration
- **Brand Customization**: Colors, fonts, tone of voice
- **Export to PowerPoint**: Download as PPTX files
- **Real-time Editing**: Drag-and-drop storyline editor

View your app in AI Studio: https://ai.studio/apps/drive/13PXOgm5lXySgO-EaUIqSw3QBCMnvs5D2

## 🚀 Quick Start

### Run Locally

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Access:** http://localhost:3000

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Set API key
export GEMINI_API_KEY=your_api_key_here

# Build and run
docker-compose up -d

# Access at http://localhost:3001
```

### Using Docker CLI

```bash
docker build -t ai-storyline-generator .
docker run -d -p 3001:3001 -e GEMINI_API_KEY=your_key ai-storyline-generator
```

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete guide.

## 🚂 Deploy to Railway

**One-Click Deploy:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

**Manual Deploy:**

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variable: `GEMINI_API_KEY`
6. Deploy! 🎉

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for complete guide.

## 📚 Documentation

- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete Docker deployment guide
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - Railway deployment guide with CLI and dashboard instructions
- **[REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md)** - Architecture and state management details
- **[STATE_MANAGEMENT_GUIDE.md](STATE_MANAGEMENT_GUIDE.md)** - React Context API implementation

## 🏗️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.5 (Flash/Pro with Thinking mode)
- **Images:** Unsplash API + AI Image Generation
- **Export:** PptxGenJS
- **Deployment:** Docker, Railway.app

## 📦 Project Structure

```
ai-storyline-generator/
├── components/          # React components
│   ├── Step1_Input.tsx    # Content input & settings
│   ├── Step2_Storyline.tsx # Storyline editor
│   └── Step3_Slides.tsx    # Final slides & export
├── contexts/           # React Context (state management)
├── services/           # API services
│   ├── geminiService.ts     # AI generation
│   └── presentationModels.ts # McKinsey & other models
├── server.js           # Express backend + static serving
├── Dockerfile          # Multi-stage production build
├── docker-compose.yml  # Docker orchestration
└── railway.json        # Railway configuration
```

## 🎨 Presentation Models

### Standard Presentation
- Flexible format
- No strict requirements
- Suitable for general use

### McKinsey Method
Based on official McKinsey communication principles:
- **Pyramid Principle**: Answer first, then supporting arguments
- **MECE Framework**: Mutually Exclusive, Collectively Exhaustive
- **SCR Storytelling**: Situation → Complication → Resolution
- **Action Titles**: Full sentences stating insights (not labels)
- **Horizontal Flow**: Titles tell complete story
- **Vertical Logic**: Content proves title claims
- **One Slide One Insight**: Single message per slide

### Custom
User-defined presentation structure (extensible for future models)

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 3001) |

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](../../issues)
- Documentation: See markdown files in project root
