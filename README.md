# Paper Terminal Archive

A secure Flask-based web application for managing and searching academic papers.

## Project Structure

```
Paper terminal archive
├── static/
│   ├── script.js
│   ├── style.css
│   └── upload.js
├── templates/
│   ├── index.html
│   ├── login.html
│   └── upload.html
├── uploads/              # Upload directory (created automatically)
├── app.py               # Main application
├── create_admin_secure.py  # Secure admin creation script
├── database.py          # Database initialization
├── requirements.txt     # Python dependencies
├── .env.example        # Environment configuration template
├── .gitignore          # Git ignore patterns
└── SECURITY_ANALYSIS.md # Detailed security analysis
```

## Security Features

This application has been hardened with multiple security measures:

✅ **Authentication & Authorization**
- Password hashing using Werkzeug
- Session-based authentication
- Login required decorator for protected routes

✅ **Input Validation**
- Server-side file type validation
- MIME type verification
- Parameterized SQL queries
- Secure filename sanitization

✅ **Security Headers**
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (when using HTTPS)

✅ **Configuration Security**
- Environment-based configuration
- Secret key from environment variables
- Configurable session security
- Debug mode disabled by default

✅ **File Upload Security**
- File type whitelist (PDF only)
- File size limits
- Path traversal prevention
- Secure filename handling

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Papers-login-better-security-
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your values:
   ```bash
   # Generate a secret key:
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   
   Add the generated key to your `.env` file:
   ```
   SECRET_KEY=your-generated-secret-key-here
   ```

5. **Create an admin user**
   ```bash
   python create_admin_secure.py
   ```
   
   Follow the prompts to set a strong password (minimum 12 characters).

6. **Run the application**
   
   **For development:**
   ```bash
   export FLASK_DEBUG=True  # On Windows: set FLASK_DEBUG=True
   python app.py
   ```
   
   **For production:**
   ```bash
   # Use a production WSGI server like Gunicorn
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

## Usage

1. **Access the application**
   - Homepage: `http://localhost:5000/`
   - Admin login: `http://localhost:5000/login`

2. **Upload papers**
   - Login as admin
   - Navigate to `/admin`
   - Drag and drop PDF files
   - Fill in paper details
   - Upload

3. **Search papers**
   - Use the search interface on the homepage
   - Press Ctrl+K for quick search
   - Search supports natural language queries

## Security Best Practices

### Before Deployment

- [ ] Generate a strong SECRET_KEY and store it securely
- [ ] Change all default credentials
- [ ] Set `FLASK_DEBUG=False` in production
- [ ] Enable HTTPS/SSL
- [ ] Set `SESSION_COOKIE_SECURE=True` (requires HTTPS)
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Review SECURITY_ANALYSIS.md for additional recommendations

### Password Requirements

Admin passwords should be:
- At least 12 characters long
- Include uppercase and lowercase letters
- Include numbers
- Include special characters
- Not use common words or patterns

### File Upload Guidelines

- Only PDF files are accepted
- Maximum file size: 10MB (configurable via MAX_UPLOAD_SIZE_MB)
- Files are stored in the `uploads/` directory
- Filenames are sanitized to prevent path traversal

### Production Deployment

For production deployment, consider:

1. **Use a production WSGI server** (Gunicorn, uWSGI)
2. **Set up a reverse proxy** (Nginx, Apache)
3. **Enable HTTPS** with Let's Encrypt or other SSL certificate
4. **Use a production database** (PostgreSQL, MySQL) instead of SQLite
5. **Implement rate limiting** to prevent brute force attacks
6. **Set up monitoring and logging**
7. **Regular security updates**
8. **Backup strategy**

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| SECRET_KEY | Flask secret key for sessions | Random dev key | Yes (prod) |
| DATABASE_PATH | Path to SQLite database | papers.db | No |
| FLASK_ENV | Flask environment | production | No |
| FLASK_DEBUG | Enable debug mode | False | No |
| UPLOAD_FOLDER | Upload directory | uploads | No |
| MAX_UPLOAD_SIZE_MB | Max file size in MB | 10 | No |
| SESSION_COOKIE_SECURE | Require HTTPS for cookies | False | No |

## Security Analysis

For a detailed security analysis of this application, see [SECURITY_ANALYSIS.md](SECURITY_ANALYSIS.md).

The security analysis includes:
- Vulnerability assessment
- Security ratings by category
- Detailed mitigation strategies
- Implementation recommendations
- Deployment checklist

## Troubleshooting

### Common Issues

**Import Error: No module named 'dotenv'**
```bash
pip install python-dotenv
```

**Permission Denied: uploads/**
```bash
chmod 755 uploads/
```

**Database Locked**
- SQLite doesn't handle concurrent writes well
- Consider using PostgreSQL for production

**Session Not Persisting**
- Check that SECRET_KEY is set and consistent
- Ensure cookies are enabled in browser

## Contributing

When contributing to this project:
1. Never commit sensitive data (.env, *.db files)
2. Follow secure coding practices
3. Run security checks before submitting
4. Update documentation for new features
5. Add tests for security-critical code

## License

See LICENSE file for details.

## Support

For security issues, please review SECURITY_ANALYSIS.md first.
For bugs and features, please open an issue on GitHub.

---

**⚠️ Security Notice**: This application handles sensitive data. Always follow security best practices and keep dependencies updated.


