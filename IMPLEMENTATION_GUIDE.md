# Security Implementation Guide

This guide provides step-by-step instructions for implementing and maintaining the security features in this application.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Security Configuration](#security-configuration)
3. [Authentication Implementation](#authentication-implementation)
4. [Database Security](#database-security)
5. [Deployment Security](#deployment-security)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Security Testing](#security-testing)

---

## Initial Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Generate Secret Key

```bash
# Generate a secure secret key
python -c 'import secrets; print(secrets.token_hex(32))'
```

Copy the output and add it to your `.env` file:

```bash
SECRET_KEY=your-generated-secret-key-here
```

### 3. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set all required values.

---

## Security Configuration

### Content Security Policy (CSP)

The application includes a strict CSP by default. To modify it, edit `app.py`:

```python
csp = {
    'default-src': "'self'",
    'script-src': ["'self'", "'nonce-{nonce}'"],  # Use nonces for inline scripts
    'style-src': ["'self'", "'unsafe-inline'"],   # Required for some CSS
    # Add more as needed
}
```

### Security Headers

All security headers are automatically applied. To customize, modify the `set_additional_security_headers` function in `app.py`.

### Rate Limiting

Default limits:
- Global: 200 per day, 50 per hour
- Search endpoint: 10 per minute

To customize:

```python
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["500 per day", "100 per hour"]  # Adjust as needed
)
```

---

## Authentication Implementation

### Step 1: Install Flask-Login

```bash
pip install Flask-Login Flask-Bcrypt
```

### Step 2: User Model

Create `models.py`:

```python
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin):
    def __init__(self, id, username, email, password_hash):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def create_password_hash(password):
        return generate_password_hash(password)
```

### Step 3: Initialize Flask-Login

In `app.py`:

```python
from flask_login import LoginManager, login_user, logout_user, login_required

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    # Load user from database
    return User.query.get(int(user_id))
```

### Step 4: Login Route

```python
@app.route('/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")  # Prevent brute force
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Validate input
        if not username or not password:
            return jsonify(error="Username and password required"), 400
        
        # Find user (implement your database query)
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            # Don't reveal which field was wrong
            return jsonify(error="Invalid credentials"), 401
    
    return render_template('login.html')
```

### Step 5: Protect Routes

```python
@app.route('/protected')
@login_required
def protected():
    return render_template('protected.html')
```

---

## Database Security

### Step 1: Install SQLAlchemy

```bash
pip install Flask-SQLAlchemy Flask-Migrate
```

### Step 2: Configure Database

```python
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Use environment variable for database URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///papers.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
```

### Step 3: Secure Queries

Always use parameterized queries:

```python
# ✅ GOOD - Parameterized query
user = User.query.filter_by(username=username).first()

# ❌ BAD - SQL injection vulnerability
user = db.session.execute(f"SELECT * FROM users WHERE username='{username}'")
```

### Step 4: Database Encryption

For sensitive data, use encryption:

```bash
pip install cryptography
```

```python
from cryptography.fernet import Fernet

# Generate key (store securely, e.g., in environment variables)
key = Fernet.generate_key()
cipher_suite = Fernet(key)

# Encrypt sensitive data
encrypted_data = cipher_suite.encrypt(b"sensitive data")

# Decrypt when needed
decrypted_data = cipher_suite.decrypt(encrypted_data)
```

---

## Deployment Security

### 1. HTTPS Setup

#### Using Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Production Server

Use Gunicorn with proper configuration:

```bash
# Install
pip install gunicorn

# Run
gunicorn -w 4 -b 127.0.0.1:5000 --access-logfile access.log --error-logfile error.log app:app
```

Create systemd service `/etc/systemd/system/papers.service`:

```ini
[Unit]
Description=Papers Portal
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/app
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable papers
sudo systemctl start papers
```

### 3. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## Monitoring and Maintenance

### 1. Logging

The application logs to stdout by default. For production, configure file logging:

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### 2. Security Monitoring

Monitor for suspicious activity:

```python
from flask import request
import logging

@app.before_request
def log_request_info():
    if request.method in ['POST', 'PUT', 'DELETE']:
        logger.info(f'Request: {request.method} {request.path} from {request.remote_addr}')
```

### 3. Dependency Updates

Regularly check for updates:

```bash
# Check for outdated packages
pip list --outdated

# Check for security vulnerabilities
safety check

# Update packages
pip install --upgrade package-name
```

### 4. Automated Backups

Create backup script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
cp /path/to/papers.db $BACKUP_DIR/papers_$DATE.db

# Backup environment config (be careful with secrets!)
# Only backup structure, not actual secrets
cp .env.example $BACKUP_DIR/env_structure_$DATE.txt

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "papers_*.db" -mtime +30 -delete
```

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

---

## Security Testing

### 1. Automated Security Scans

```bash
# Static analysis
bandit -r app.py

# Dependency vulnerabilities
safety check

# Code quality
flake8 app.py
```

### 2. Manual Testing Checklist

- [ ] Test CSRF protection (try submitting forms without token)
- [ ] Test rate limiting (make rapid requests)
- [ ] Test input validation (try SQL injection, XSS)
- [ ] Test authentication (try accessing protected routes)
- [ ] Test session security (check cookie attributes)
- [ ] Verify HTTPS enforcement
- [ ] Check security headers (use securityheaders.com)
- [ ] Test error handling (verify no sensitive info leaks)

### 3. Penetration Testing Tools

```bash
# OWASP ZAP
# Download from https://www.zaproxy.org/

# Nikto web scanner
sudo apt-get install nikto
nikto -h https://yourdomain.com

# SQLMap (SQL injection testing)
sqlmap -u "https://yourdomain.com/search" --data="query=test"
```

### 4. Security Headers Test

Use online tools:
- https://securityheaders.com/
- https://observatory.mozilla.org/

Expected results:
- Security Headers: A+ grade
- CSP: Properly configured
- HSTS: Enabled
- X-Frame-Options: DENY

---

## Security Checklist

### Before Production Deployment

- [ ] SECRET_KEY set to random value in environment
- [ ] DEBUG mode disabled (FLASK_ENV=production)
- [ ] HTTPS enabled with valid certificate
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error handling doesn't leak information
- [ ] Logging configured properly
- [ ] Database credentials secured
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Security testing completed
- [ ] Firewall configured
- [ ] Dependencies updated
- [ ] Security policy documented

### Regular Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security scans
- [ ] Quarterly penetration tests
- [ ] Review logs for suspicious activity
- [ ] Update SSL certificates before expiry
- [ ] Review and update security policies

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Guide](https://flask.palletsprojects.com/en/2.3.x/security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## Support

For security questions or to report vulnerabilities:
- Review SECURITY.md
- Contact: [security@yourdomain.com]

**Remember**: Security is an ongoing process, not a one-time implementation!
