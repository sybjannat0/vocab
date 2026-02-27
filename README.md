# VocaVera - Vocabulary Learning PWA

A professional vocabulary learning application with flashcards, quizzes, and practice modes. Built as a Progressive Web App (PWA).

## Features

- 📚 **Word Management** - Add, edit, delete vocabulary words
- 🎯 **Multiple Practice Modes** - Basic flashcards, Advanced MCQ, Quiz Challenge
- 📊 **Statistics** - Track your progress and mastery
- 📤 **Export** - Export to Excel and PDF
- 📱 **PWA** - Installable on mobile and desktop
- 🔄 **Offline Support** - Works without internet
- 📲 **Pull to Refresh** - Refresh content easily

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect it's a static site
5. Deploy!

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Pages

1. Push your code to GitHub
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Save

Or enable GitHub Actions (already configured):
- Push to main branch
- Workflow will auto-deploy to GitHub Pages

### Option 3: Supabase (Static Hosting)

1. Create a project at [Supabase](https://supabase.com)
2. Go to Settings → Hosting
3. Upload all files to the hosting bucket
4. Your app will be available at `your-project.supabase.co`

### Option 4: Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import your repository
4. Deploy!

## PWA Installation

### Android
1. Visit the URL in Chrome
2. Tap "Install App" or menu → "Add to Home Screen"

### iOS
1. Visit the URL in Safari
2. Tap Share button → "Add to Home Screen"

### Windows
1. Visit the URL in Edge
2. Click the install icon in address bar
3. Or menu → "Apps" → "Install this site as an app"

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQL.js (SQLite in browser)
- **PWA**: Service Worker, Web App Manifest
- **Libraries**:
  - Font Awesome (icons)
  - QRCode.js (QR codes)
  - jsPDF (PDF export)
  - SheetJS (Excel export)
  - html2pdf (PDF generation)

## File Structure

```
├── index.html          # Main application
├── manifest.json        # PWA manifest
├── sw.js              # Service worker
├── sql.js             # Database wrapper
├── vercel.json        # Vercel config
├── supabase.json      # Supabase config
├── .github/
│   └── workflows/
│       └── deploy.yml # GitHub Actions
└── .gitignore        # Git ignore rules
```

## License

MIT
