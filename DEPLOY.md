# Step-by-Step Deployment Guide

## Option 1: Deploy to Vercel (Easiest)

### Step 1: Go to Vercel
1. Open your browser
2. Go to https://vercel.com
3. Click "Sign Up" if you don't have an account
4. Choose "Continue with GitHub"

### Step 2: Import Your Project
1. After logging in, click "Add New..." button
2. Click "Project"
3. Find your GitHub repository in the list
4. Click "Import" next to your repo

### Step 3: Deploy
1. Keep all settings as they are (Vercel will auto-detect)
2. Click "Deploy" button at the bottom
3. Wait 1-2 minutes
4. You'll see "Ready" when done!

### Step 4: Open Your App
1. Click the URL shown (like yourname.vercel.app)
2. Your app is now live!

---

## Option 2: Deploy to GitHub Pages

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Click "Settings" tab
3. Click "Pages" on the left sidebar
4. Under "Build and deployment":
   - Source: Select "Deploy from a branch"
   - Branch: Select "main" (or "master")
   - Folder: Select "/ (root)"
5. Click "Save"

### Step 2: Wait for Deployment
1. Go to your repository main page
2. Click the "Actions" tab
3. Wait for the deployment to finish (1-2 min)
4. Refresh the page

### Step 3: Open Your App
1. Go back to Settings → Pages
2. Click the URL under "Your site"
3. Your app is now live!

---

## Troubleshooting

### If Vercel shows errors:
- Make sure all files are pushed to GitHub
- Check that index.html is in the root folder

### If GitHub Pages doesn't work:
- Go to Settings → Pages
- Make sure branch is "main" and folder is "/ (root)"
- Wait 2-3 minutes for first deploy

### If app doesn't load:
- Clear browser cache (Ctrl+Shift+R)
- Make sure you're using HTTPS (not HTTP)

---

## Your App URLs will be:

- **Vercel**: https://your-username.github.io/your-repo-name
- **GitHub Pages**: https://your-username.github.io/your-repo-name

Replace "your-username" and "your-repo-name" with your actual names!
