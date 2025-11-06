# GitHub Pages Setup Guide

This guide explains how to deploy the Previous Year Papers Portal to GitHub Pages.

## ⚠️ Important Note

GitHub Pages is designed for static websites. Since this is a Flask application (Python backend), you have two options:

### Option 1: Static Export (Recommended for Demo)

1. Create a static version of your site by generating HTML files:
   ```bash
   # This requires running the Flask app and exporting pages
   python -m flask freeze
   ```

2. Configure GitHub Pages:
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` (or create a `gh-pages` branch)
   - Select folder: `/` or `/docs`
   - Save

3. Access your site at:
   ```
   https://anacondy.github.io/Papers-login-better-security-/
   ```

### Option 2: Deploy to a Cloud Platform (Recommended for Production)

For a fully functional application with backend API, deploy to:

#### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku login
heroku create your-app-name
git push heroku main
```

#### Render
1. Go to https://render.com
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Add environment variables (SECRET_KEY, FLASK_ENV=production)

#### Railway
1. Go to https://railway.app
2. Connect your GitHub repository
3. Deploy automatically
4. Configure environment variables

#### PythonAnywhere
1. Go to https://www.pythonanywhere.com
2. Create an account
3. Upload your code
4. Configure WSGI file
5. Set environment variables

## Static Demo Site

To create a simple static demo page for GitHub Pages:

1. Create an `index.html` in the repository root or `docs` folder
2. Add your static content
3. Enable GitHub Pages as described above

## Environment Variables

When deploying, ensure these environment variables are set:

```bash
SECRET_KEY=your-secure-random-key-here
FLASK_ENV=production
```

Generate a secure secret key:
```bash
python -c 'import secrets; print(secrets.token_hex(32))'
```

## HTTPS Configuration

- GitHub Pages automatically provides HTTPS
- For other platforms, ensure SSL/TLS certificates are configured
- Update `app.py` to set `force_https=True` in production

## Domain Configuration (Optional)

### Custom Domain with GitHub Pages

1. Add a `CNAME` file to your repository with your domain:
   ```
   papers.yourdomain.com
   ```

2. Configure DNS records:
   - Type: CNAME
   - Name: papers (or @)
   - Value: anacondy.github.io

3. Enable HTTPS in GitHub Pages settings

## Testing Deployment

After deployment, test these features:
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] API endpoints respond
- [ ] Security headers are present
- [ ] HTTPS is enforced
- [ ] Mobile responsiveness

## Troubleshooting

### Issue: "Application Error" or "503"
- Check logs for errors
- Verify environment variables are set
- Ensure `requirements.txt` is complete
- Check Python version compatibility

### Issue: Static files not loading
- Verify paths are correct
- Check `url_for('static', filename='...')` usage
- Ensure static folder is committed to git

### Issue: CSRF errors
- Verify SECRET_KEY is set
- Check that HTTPS is enabled
- Review CSRF configuration in app.py

## Security Checklist

Before going live:
- [ ] SECRET_KEY is set and secure
- [ ] FLASK_ENV=production
- [ ] Debug mode is disabled
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] Input validation is working
- [ ] Error handling doesn't leak information

## Monitoring

Set up monitoring for:
- Application uptime
- Error rates
- API response times
- Security incidents

Recommended tools:
- UptimeRobot (free uptime monitoring)
- Sentry (error tracking)
- Google Analytics (usage stats)

## Support

For issues with:
- GitHub Pages: https://docs.github.com/en/pages
- Heroku: https://devcenter.heroku.com
- Render: https://render.com/docs
- Railway: https://docs.railway.app

---

**Note**: The README.md contains a link to the GitHub Pages site. Update this link after deployment to reflect your actual deployment URL.
