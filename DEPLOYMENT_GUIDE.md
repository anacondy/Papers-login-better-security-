# Production Deployment Guide

This guide provides step-by-step instructions for securely deploying the Paper Terminal Archive application to production.

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Reviewed all security recommendations in `SECURITY_ANALYSIS.md`
- [ ] Generated a strong SECRET_KEY
- [ ] Changed all default credentials
- [ ] Configured environment variables properly
- [ ] Set up HTTPS/SSL certificate
- [ ] Configured firewall rules
- [ ] Set up backup strategy
- [ ] Tested the application in a staging environment

## Deployment Options

### Option 1: Deploy with Gunicorn + Nginx (Recommended)

This is the recommended approach for production deployments.

#### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nginx
```

#### 2. Application Setup

```bash
# Clone repository
git clone <your-repo-url> /var/www/paper-archive
cd /var/www/paper-archive

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Edit .env file
nano .env
```

Set these values in `.env`:
```bash
SECRET_KEY=<your-generated-secret-key>
FLASK_ENV=production
FLASK_DEBUG=False
SESSION_COOKIE_SECURE=True
UPLOAD_FOLDER=/var/www/paper-archive/uploads
MAX_UPLOAD_SIZE_MB=10
```

#### 4. Create Admin User

```bash
python3 create_admin_secure.py
```

#### 5. Set Permissions

```bash
# Create uploads directory
mkdir -p /var/www/paper-archive/uploads

# Set ownership
sudo chown -R www-data:www-data /var/www/paper-archive

# Set permissions
chmod 755 /var/www/paper-archive
chmod 700 /var/www/paper-archive/uploads
chmod 600 /var/www/paper-archive/.env
chmod 600 /var/www/paper-archive/papers.db
```

#### 6. Create Systemd Service

Create `/etc/systemd/system/paper-archive.service`:

```ini
[Unit]
Description=Paper Archive Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/paper-archive
Environment="PATH=/var/www/paper-archive/venv/bin"
ExecStart=/var/www/paper-archive/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/var/www/paper-archive/paper-archive.sock \
    --access-logfile /var/log/paper-archive/access.log \
    --error-logfile /var/log/paper-archive/error.log \
    --log-level info \
    app:app

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Create log directory:
```bash
sudo mkdir -p /var/log/paper-archive
sudo chown www-data:www-data /var/log/paper-archive
```

Enable and start the service:
```bash
sudo systemctl enable paper-archive
sudo systemctl start paper-archive
sudo systemctl status paper-archive
```

#### 7. Configure Nginx

Create `/etc/nginx/sites-available/paper-archive`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size (for file uploads)
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/paper-archive-access.log;
    error_log /var/log/nginx/paper-archive-error.log;

    # Proxy to Gunicorn
    location / {
        proxy_pass http://unix:/var/www/paper-archive/paper-archive.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Static files
    location /static {
        alias /var/www/paper-archive/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/paper-archive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### Option 2: Deploy with Docker

#### 1. Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Set permissions
RUN chmod 755 /app
RUN chmod 700 /app/uploads

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - FLASK_ENV=production
      - FLASK_DEBUG=False
      - SESSION_COOKIE_SECURE=True
    volumes:
      - ./uploads:/app/uploads
      - ./papers.db:/app/papers.db
    restart: always
```

#### 3. Deploy

```bash
# Set environment variables
export SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check service status
sudo systemctl status paper-archive
sudo systemctl status nginx

# Check logs
sudo tail -f /var/log/paper-archive/error.log
sudo tail -f /var/log/nginx/paper-archive-error.log

# Test HTTPS
curl -I https://your-domain.com
```

### 2. Security Hardening

#### Configure Firewall

```bash
# Allow only HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Set Up Fail2Ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create jail for application
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[paper-archive]
enabled = true
port = http,https
filter = paper-archive
logpath = /var/log/paper-archive/access.log
maxretry = 5
bantime = 3600
```

#### Regular Updates

```bash
# Create update script
sudo nano /usr/local/bin/update-paper-archive.sh
```

Add:
```bash
#!/bin/bash
cd /var/www/paper-archive
source venv/bin/activate
pip install --upgrade -r requirements.txt
sudo systemctl restart paper-archive
```

```bash
chmod +x /usr/local/bin/update-paper-archive.sh
```

### 3. Monitoring

#### Set Up Log Rotation

Create `/etc/logrotate.d/paper-archive`:

```
/var/log/paper-archive/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload paper-archive
    endscript
}
```

#### Monitor Disk Space

```bash
# Check disk usage
df -h

# Monitor uploads directory
du -sh /var/www/paper-archive/uploads/
```

### 4. Backup Strategy

#### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-paper-archive.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/paper-archive"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/paper-archive/papers.db $BACKUP_DIR/papers_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/paper-archive/uploads .

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-paper-archive.sh
```

#### Schedule Backups

```bash
# Add to crontab
sudo crontab -e
```

Add:
```
# Backup daily at 2 AM
0 2 * * * /usr/local/bin/backup-paper-archive.sh >> /var/log/paper-archive-backup.log 2>&1
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u paper-archive -n 50 --no-pager

# Check permissions
ls -la /var/www/paper-archive

# Test Gunicorn manually
cd /var/www/paper-archive
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 app:app
```

### Nginx 502 Bad Gateway

```bash
# Check if Gunicorn is running
sudo systemctl status paper-archive

# Check socket file exists
ls -la /var/www/paper-archive/paper-archive.sock

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### File Upload Fails

```bash
# Check upload directory permissions
ls -la /var/www/paper-archive/uploads

# Check Nginx client_max_body_size
grep client_max_body_size /etc/nginx/sites-available/paper-archive

# Check application MAX_CONTENT_LENGTH
grep MAX_UPLOAD_SIZE_MB /var/www/paper-archive/.env
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check disk space

**Weekly:**
- Review access logs for suspicious activity
- Check backup integrity

**Monthly:**
- Update system packages
- Update Python dependencies
- Review security settings
- Test disaster recovery

### Update Application

```bash
cd /var/www/paper-archive
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart paper-archive
```

---

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Strong SECRET_KEY in use
- [ ] Debug mode disabled
- [ ] Secure session cookies enabled
- [ ] File permissions properly set (600 for sensitive files)
- [ ] Database outside web root
- [ ] Regular backups configured
- [ ] Log rotation enabled
- [ ] Fail2Ban configured
- [ ] System updates scheduled
- [ ] Monitoring in place
- [ ] Admin password is strong and unique

---

## Additional Resources

- [Flask Deployment Documentation](https://flask.palletsprojects.com/en/latest/deploying/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Need Help?**

For security issues, refer to `SECURITY_ANALYSIS.md`.
For deployment issues, check the troubleshooting section above.
