# VocaVera 📚

A modern, offline-first vocabulary builder PWA with adaptive quizzes, spaced repetition, and seamless cloud sync.

![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Smart Learning**: Spaced repetition with mastery tracking
- **Offline-First**: Works without internet, syncs when back online
- **Installable**: Add to home screen on any device
- **Adaptive Quizzes**: Multiple question types (MCQ, fill-blank, matching, typing)
- **Rich Data**: Categories, word groups, synonyms, examples, Bangla meanings
- **Progress Sync**: Seamless cloud backup via Supabase
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Real-time Stats**: Heatmaps, achievements, streaks

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vocavera)

### Option 2: Manual Deploy

1. **Fork/Clone this repository**

```bash
git clone https://github.com/yourusername/vocavera.git
cd vocavera
```

2. **Add Supabase credentials**

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase keys:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Install dependencies**

```bash
npm install
```

4. **Run development server**

```bash
npm run dev
```

Open http://localhost:8080

5. **Build for production**

```bash
npm run build
```

6. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to [Vercel](https://vercel.com) and it will auto-deploy on push.

## 📁 Project Structure

```
vocavera/
├── index.html          # Main app (SPA)
├── sw.js              # Service Worker (PWA)
├── manifest.json      # Web App Manifest
├── offline.html       # Offline fallback
├── vite.config.js     # Vite configuration
├── package.json       # Dependencies
├── vercel.json        # Vercel config
├── icons/             # PWA icons (72-512px)
├── supabase_fix.sql   # Database schema
└── README.md          # This file
```

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase_fix.sql` to set up tables
3. Get your project URL and anon key from Settings → API
4. Add them to `.env.local` or Vercel environment variables

### PWA Icons

Replace placeholder icons in `/icons/` folder with real branded icons:
- `icon-72x72.png` to `icon-512x512.png`
- Minimum 512x512 required for PWA install

## 🎯 Features Breakdown

### PWA Capabilities
- ✅ Installable on any platform
- ✅ Offline-first architecture
- ✅ Background sync
- ✅ Push notifications
- ✅ Auto-update with user prompt

### Learning System
- ✅ Spaced repetition (SRS)
- ✅ Mastery tracking (0-100%)
- ✅ 5 quiz types (MCQ, fill, true/false, matching, typing)
- ✅ Word categories & groups
- ✅ Synonyms & examples
- ✅ Bangla meanings

### Data Management
- ✅ Export JSON/CSV
- ✅ Import from Excel/CSV/JSON
- ✅ Duplicate detection
- ✅ Auto-create categories/groups on import
- ✅ Cloud sync via Supabase

### UI/UX
- ✅ Modern glassmorphism design
- ✅ Dark/light mode ready
- ✅ Touch-optimized mobile UI
- ✅ Smooth page transitions
- ✅ Skeleton loading states
- ✅ Responsive layout

## 📱 Mobile Installation

### Android
1. Open in Chrome
2. Tap "Add to Home Screen" banner OR
3. Menu → "Install app"

### iOS
1. Open in Safari
2. Share button → "Add to Home Screen"
3. Opens in standalone mode

### Desktop
- Click install button in address bar (Chrome/Edge)
- Or use menu → "Install VocaVera"

## 🔄 Background Sync

The app queues all changes when offline:
- Word additions/edits/deletes
- Quiz results
- Progress updates

When connectivity returns, data syncs automatically. You'll see a green "Syncing..." indicator.

## 📊 Statistics & Achievements

Track your learning:
- Words learned, mastered, struggling
- Streak days (consecutive days)
- Quiz accuracy
- XP & level progression
- Activity heatmap (last 30 days)
- Achievement badges

## 🎨 Customization

### Theme Colors

Edit CSS variables in `index.html`:

```css
:root {
  --primary: #4F46E5;
  --primary-light: #E0E7FF;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### Icon Set

Replace icons in the `icons/` folder with your branded versions. Keep the naming convention:
- `icon-{size}x{size}.png` (72, 96, 128, 144, 152, 192, 384, 512)

### Splash Screens

Add splash images to `/splash/` folder (640x1136, 750x1334, etc.) and update `manifest.json`.

## 🐛 Troubleshooting

### Service Worker not activating
1. Clear site data in browser settings
2. Hard refresh (Ctrl+Shift+R)
3. Check `chrome://serviceworker-internals`

### Icons not showing
- Ensure icons exist in `/icons/` folder
- Check Manifest in DevTools → Application
- Icons must be PNG, correct dimensions

### Sync not working
1. Verify Supabase credentials in Vercel dashboard
2. Check Network tab for API errors
3. Ensure tables exist (run `supabase_fix.sql`)

### PWA install prompt not showing
- Engagement tracking requires 2+ sessions
- Clear localStorage to reset: `localStorage.clear()`
- Works only on HTTPS or localhost

## 📈 Performance

- **First Contentful Paint**: < 1s on 3G
- **Time to Interactive**: < 2s on 4G
- **Lighthouse Score**: 90+ (Performance, PWA, Accessibility)
- **Offline Load**: Instant (from cache)

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Credits

Built with ❤️ for language learners everywhere.

---

**Need help?** Open an issue on GitHub or contact support@vocavera.app
