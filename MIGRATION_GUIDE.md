# Migration Guide for Existing Users

If you're already using the Paper Archive application, this guide will help you upgrade to the secure version.

## ⚠️ Important Notice

The previous version of this application had **several critical security vulnerabilities**. It is strongly recommended that you:

1. **Upgrade immediately** to the secured version
2. **Change all admin passwords** (assume they were compromised)
3. **Regenerate SECRET_KEY**
4. **Review access logs** for suspicious activity

---

## Quick Migration (5 Minutes)

### Step 1: Backup Current Installation

```bash
# Backup database
cp papers.db papers.db.backup

# Backup uploads
cp -r uploads uploads.backup

# Backup any custom changes
cp app.py app.py.backup
```

### Step 2: Pull Latest Changes

```bash
# Pull the secure version
git pull origin main

# Or download the new files if not using git
```

### Step 3: Install New Dependencies

```bash
# If using virtual environment
source venv/bin/activate

# Install new dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Generate a NEW secret key (IMPORTANT!)
python3 -c "import secrets; print(secrets.token_hex(32))"

# Edit .env and add your secret key
nano .env
```

Set these values in `.env`:
```bash
SECRET_KEY=<your-new-generated-key>
FLASK_ENV=production
FLASK_DEBUG=False
SESSION_COOKIE_SECURE=True  # Set to True if using HTTPS
UPLOAD_FOLDER=uploads
MAX_UPLOAD_SIZE_MB=10
```

### Step 5: Update Admin Password

```bash
# Create a new admin user with a STRONG password
python3 create_admin_secure.py
```

**Important**: Use a different password than before! The old one may have been exposed.

### Step 6: Restart Application

```bash
# Stop the old application (Ctrl+C if running in terminal)

# Or if using systemd:
sudo systemctl restart paper-archive

# Or if using Docker:
docker-compose restart
```

### Step 7: Verify

```bash
# Test that the application starts
python3 app.py

# Should see: "Running on http://127.0.0.1:5000"
# And NOT see: "WARNING: Running in DEBUG mode"
```

Visit `http://localhost:5000` and test:
- ✅ Login with new credentials
- ✅ Upload a PDF file
- ✅ Search for papers
- ✅ Logout

---

## Detailed Migration Steps

### What Changed?

#### Files Modified
- `app.py` - Multiple security fixes
- `requirements.txt` - Added python-dotenv
- `README.md` - Enhanced documentation

#### Files Added
- `.env.example` - Environment configuration template
- `.gitignore` - Prevents committing sensitive files
- `SECURITY_ANALYSIS.md` - Detailed security report
- `SECURITY_SUMMARY.md` - Quick reference
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `create_admin_secure.py` - Secure admin creation
- `setup.sh` - Automated setup script

#### Behavior Changes
- Secret key now from environment variable (not hardcoded)
- Debug mode disabled by default (not always on)
- File uploads validated server-side (not just client-side)
- Path traversal protection added
- Security headers added to responses
- Session timeout set to 2 hours
- File size limits enforced

### Breaking Changes

**None!** The application maintains backward compatibility. Your existing:
- Database structure remains the same
- Upload folder location unchanged (configurable)
- API endpoints unchanged
- Frontend interface unchanged

### Database Migration

**No database migration needed!** The database schema hasn't changed.

Your existing `papers.db` will work with the new version without modifications.

---

## Configuration Migration

### Old Configuration (Insecure)
```python
# app.py
app.config['SECRET_KEY'] = 'a-very-secret-and-random-string-that-you-should-change'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.run(debug=True)
```

### New Configuration (Secure)
```python
# app.py - uses environment variables
from dotenv import load_dotenv
load_dotenv()

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
app.run(debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
```

```bash
# .env - your configuration
SECRET_KEY=your-new-secret-key-here
UPLOAD_FOLDER=uploads
FLASK_DEBUG=False
```

---

## Security Review After Migration

### Check These Items

- [ ] New SECRET_KEY generated and set in `.env`
- [ ] `.env` file has permissions 600 (not readable by others)
- [ ] `papers.db` has permissions 600
- [ ] Debug mode is OFF (`FLASK_DEBUG=False`)
- [ ] Admin password changed to strong password (12+ characters)
- [ ] Old `create_admin.py` not being used
- [ ] Application runs without errors
- [ ] File uploads work correctly
- [ ] Search functionality works
- [ ] Login/logout works
- [ ] `.gitignore` in place (prevents committing secrets)

### Verify Security Headers

```bash
# Test security headers are present
curl -I http://localhost:5000

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### Check File Permissions

```bash
# Secure sensitive files
chmod 600 .env
chmod 600 papers.db
chmod 700 uploads/
```

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```bash
# Stop new version
# (Ctrl+C or systemctl stop paper-archive)

# Restore old files
cp app.py.backup app.py

# Restore database (if modified)
cp papers.db.backup papers.db

# Restore uploads (if needed)
rm -rf uploads
cp -r uploads.backup uploads

# Restart with old version
python3 app.py
```

**However**, the old version is insecure! Use rollback only temporarily while troubleshooting.

---

## Upgrading Production Deployments

### If Using Systemd

```bash
# Stop service
sudo systemctl stop paper-archive

# Update code
cd /var/www/paper-archive
git pull
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Add your configuration

# Update admin password
python3 create_admin_secure.py

# Restart service
sudo systemctl start paper-archive
sudo systemctl status paper-archive
```

### If Using Docker

```bash
# Update docker-compose.yml to include environment variables
# Add .env file with SECRET_KEY

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

### If Using Nginx

No Nginx configuration changes needed! The application's endpoints remain the same.

---

## Troubleshooting Migration Issues

### Issue: "No module named 'dotenv'"

**Solution**:
```bash
pip install python-dotenv
```

### Issue: "SECRET_KEY not set"

**Solution**:
```bash
# Create .env file
cp .env.example .env

# Generate key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Add to .env
echo "SECRET_KEY=<your-generated-key>" >> .env
```

### Issue: "Permission denied: uploads/"

**Solution**:
```bash
chmod 755 uploads/
# Or if using www-data user:
sudo chown -R www-data:www-data uploads/
```

### Issue: "Session not persisting"

**Cause**: SECRET_KEY changed, invalidating old sessions

**Solution**: This is expected! Users need to login again with new credentials.

### Issue: "Import error: cannot import name 'secure_filename'"

**Solution**: Update Werkzeug:
```bash
pip install --upgrade werkzeug
```

---

## Post-Migration Checklist

After migrating, verify these improvements are working:

### Security Features
- [ ] SECRET_KEY is unique and not hardcoded
- [ ] Debug mode disabled in production
- [ ] File upload validation working (try uploading non-PDF)
- [ ] Path traversal protection (try accessing ../etc/passwd)
- [ ] Security headers present in responses
- [ ] Session timeout after 2 hours
- [ ] File size limits enforced

### Functionality
- [ ] Homepage loads correctly
- [ ] Login works with new credentials
- [ ] Can upload PDF files
- [ ] Search returns results
- [ ] Can view/download uploaded papers
- [ ] Logout works correctly

### Documentation
- [ ] Reviewed SECURITY_ANALYSIS.md
- [ ] Read DEPLOYMENT_GUIDE.md if deploying to production
- [ ] Updated any custom documentation

---

## Additional Security Recommendations

After migration, consider:

1. **Review Access Logs**
   ```bash
   grep -i "login" /var/log/paper-archive/*.log
   # Look for suspicious patterns
   ```

2. **Check for Unauthorized Files**
   ```bash
   find uploads/ -type f ! -name "*.pdf"
   # Should return nothing
   ```

3. **Audit Users**
   ```bash
   sqlite3 papers.db "SELECT * FROM users;"
   # Verify only legitimate admin accounts
   ```

4. **Enable HTTPS** (if not already)
   - See DEPLOYMENT_GUIDE.md for Let's Encrypt setup

5. **Set Up Monitoring**
   - Enable fail2ban
   - Configure log rotation
   - Set up disk space alerts

---

## Support

If you encounter issues during migration:

1. **Check the logs**: Look for error messages
2. **Review SECURITY_ANALYSIS.md**: Understand what changed
3. **Consult DEPLOYMENT_GUIDE.md**: Production-specific guidance
4. **Check permissions**: Ensure files are readable/writable
5. **Verify dependencies**: Run `pip list` to check versions

---

## Summary

Migration is straightforward:
1. ✅ Backup current installation
2. ✅ Pull updates
3. ✅ Install dependencies
4. ✅ Configure environment (.env)
5. ✅ Update admin password
6. ✅ Restart application
7. ✅ Verify functionality

**Estimated time**: 5-15 minutes

**Risk level**: Low (backward compatible)

**Benefit**: Critical security vulnerabilities eliminated

---

**Important**: After migration, the old version should be considered compromised. Change all passwords and monitor for suspicious activity.

If you had this application publicly accessible with the old version, assume:
- Admin credentials were exposed
- SECRET_KEY was known
- File system was potentially accessible

Take appropriate remediation actions based on your risk assessment.
