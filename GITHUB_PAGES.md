# GitHub Pages Deployment Guide

This guide explains how to deploy this repository to GitHub Pages and make it live on the web.

## 📋 Overview

GitHub Pages allows you to host static websites directly from your GitHub repository. This project includes:
- **`index.html`** - Main static page in the root directory
- **`static/`** - CSS and JavaScript files
- **`.nojekyll`** - Ensures proper serving of all files

## 🚀 Step-by-Step Deployment

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository: `https://github.com/anacondy/Papers-login-better-security-`
2. Click on **Settings** (gear icon in the top menu)

### Step 2: Access GitHub Pages Settings

1. In the left sidebar, scroll down to find **Pages** (under "Code and automation")
2. Click on **Pages**

### Step 3: Configure Source

Configure the deployment source:

- **Source**: Select **"Deploy from a branch"**
- **Branch**: Select **`main`** (recommended) or **`copilot/make-site-live-on-pages`** (current branch)
- **Folder**: Select **`/ (root)`**
- Click **Save**

### Step 4: Wait for Deployment

1. GitHub Actions will automatically start building your site
2. You'll see a blue banner: "Your site is ready to be published"
3. Wait 1-2 minutes for the deployment to complete
4. The banner will turn green: "Your site is live at..."

### Step 5: Access Your Site

Your site will be available at:
```
https://anacondy.github.io/Papers-login-better-security-/
```

## 🎯 Branch Options

You have two options for which branch to deploy:

### Option 1: Deploy from `main` branch (Recommended)
- Merge your changes to `main` first
- More stable and permanent
- Best for production

**To merge:**
```bash
git checkout main
git pull origin main
git merge copilot/make-site-live-on-pages
git push origin main
```

### Option 2: Deploy from `copilot/make-site-live-on-pages` branch
- Deploy directly from the current branch
- Good for testing
- Temporary solution

## 📁 Files Structure for GitHub Pages

```
Papers-login-better-security-/
├── index.html          # Main page (in root directory) ✅
├── .nojekyll          # Tells GitHub Pages not to use Jekyll ✅
├── static/            # Static assets ✅
│   ├── style.css     # Styles
│   └── script.js     # JavaScript
├── README.md          # Documentation
└── ... (other files)
```

## 🔧 Troubleshooting

### Site Not Loading?

1. **Check deployment status:**
   - Go to **Actions** tab in your repository
   - Look for "pages-build-deployment" workflow
   - Ensure it completed successfully (green checkmark)

2. **Verify settings:**
   - Settings → Pages
   - Confirm branch is set correctly
   - Confirm folder is set to `/ (root)`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### CSS/JS Not Loading?

1. **Check file paths in index.html:**
   - Should be: `static/style.css` and `static/script.js`
   - Not: `{{ url_for('static', filename='...') }}`

2. **Verify .nojekyll exists:**
   ```bash
   ls -la .nojekyll
   ```

### Getting 404 Errors?

1. Ensure `index.html` is in the **root directory**, not in `templates/`
2. Wait a few minutes after deployment
3. Try accessing the full URL with `/index.html` at the end

## ⚙️ Advanced Configuration

### Custom Domain (Optional)

If you have a custom domain:

1. Go to Settings → Pages
2. Enter your custom domain in "Custom domain"
3. Click Save
4. Update your DNS records:
   ```
   Type: CNAME
   Name: www
   Value: anacondy.github.io
   ```

### HTTPS (Automatic)

- GitHub Pages automatically provides HTTPS
- Your site will be accessible via both HTTP and HTTPS
- HTTPS is enforced by default (recommended)

## 📊 Monitoring

### View Deployment Status

1. Go to **Actions** tab
2. Look for "pages-build-deployment" workflow
3. Click on any run to see details

### View Site Analytics

- Go to Settings → Pages
- Enable Analytics (if available for your account type)

## ⚠️ Important Notes

### Static vs. Dynamic Content

- **GitHub Pages serves static content only**
- Flask backend features (search, database) won't work
- The page will display the UI but won't connect to backend APIs
- For full functionality, deploy the Flask app separately

### What Works on GitHub Pages:
- ✅ HTML/CSS/JavaScript
- ✅ Static content display
- ✅ Client-side interactions
- ✅ Search modal UI (Ctrl+K)
- ✅ Mobile responsive design

### What Doesn't Work on GitHub Pages:
- ❌ Flask backend
- ❌ Database queries
- ❌ Server-side search
- ❌ Authentication/login
- ❌ File uploads

## 🚀 Full Application Deployment

For the complete Flask application with backend features, consider:

- **Heroku**: `https://heroku.com`
- **Railway**: `https://railway.app`
- **PythonAnywhere**: `https://pythonanywhere.com`
- **AWS Elastic Beanstalk**: `https://aws.amazon.com/elasticbeanstalk/`
- **Google Cloud Run**: `https://cloud.google.com/run`

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for Flask deployment instructions.

## 📞 Need Help?

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the [Troubleshooting](#troubleshooting) section above
3. Open an issue in this repository
4. Check GitHub Status: `https://www.githubstatus.com/`

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site is accessible at `https://<username>.github.io/<repo-name>/`
- [ ] Page loads with dark terminal-style theme
- [ ] CSS is applied correctly (green theme)
- [ ] JavaScript is working (check browser console)
- [ ] Search modal opens with Ctrl+K
- [ ] Mobile view is responsive
- [ ] No console errors (F12 → Console)

---

**Repository**: `anacondy/Papers-login-better-security-`  
**Live URL**: `https://anacondy.github.io/Papers-login-better-security-/`  
**Last Updated**: October 2025
