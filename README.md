<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌽 CornBreeder: Genomic Horizons

An interactive 3D corn breeding simulator that teaches quantitative genetics concepts through hands-on selection and breeding exercises.

## ✨ Features

- **3D Field Visualization** - Interactive corn plants rendered with Three.js
- **Genetic Simulation** - Realistic breeding mechanics with heritability and environmental variance
- **AI-Powered Analysis** - Gemini AI provides expert genetic insights (optional)
- **Selection Tools** - Manual and auto-selection based on phenotype or genomic data
- **Educational Content** - Learn about selection differential, heritability, and genetic gain

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment (optional - for AI features):**
   Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Steps to Deploy:

1. **Create a GitHub repository** named `cornbreeder_-genomic-horizons`

2. **Initialize git and push:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cornbreeder_-genomic-horizons.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on every push to `main`

4. **Access your site:**
   Your app will be live at: `https://YOUR_USERNAME.github.io/cornbreeder_-genomic-horizons/`

### ⚠️ Note on AI Features

The Gemini AI features require an API key. For GitHub Pages (static hosting):
- The app works without an API key (fallback messages are shown)
- If you include an API key, it will be visible in the client-side code
- For production use with AI, consider using a backend proxy

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Three.js** - 3D Graphics
- **Recharts** - Data Visualization
- **Tailwind CSS** - Styling
- **Gemini AI** - AI Analysis (optional)

## 📜 License

MIT License - Feel free to use and modify!
