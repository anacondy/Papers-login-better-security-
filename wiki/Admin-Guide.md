# Admin Guide

This guide covers administrative functions for managing the Previous Year Papers Portal.

## 🔐 Admin Access

### Prerequisites

Before you can access admin features, you need:
1. Flask backend running (not available in static GitHub Pages version)
2. Admin account credentials
3. Secure connection (HTTPS in production)

### Creating an Admin Account

#### Method 1: Simple Setup (Development)

Use the basic admin creation script:

```bash
python create_admin.py
```

**What it does:**
- Creates a basic admin account
- Stores username and password
- Quick setup for testing

⚠️ **Warning**: Not recommended for production use.

#### Method 2: Secure Setup (Production)

Use the secure admin creation script:

```bash
python create_admin_secure.py
```

**What it does:**
- Prompts for username and password
- Hashes password with bcrypt
- Generates secure salt
- Stores encrypted credentials
- Follows security best practices

**Example:**
```bash
$ python create_admin_secure.py
Enter admin username: admin
Enter admin password: ********
Confirm password: ********

✅ Admin account created successfully!
Username: admin
Password: [encrypted with bcrypt]
```

### Logging In

1. Navigate to `/login` route:
   ```
   http://localhost:5000/login
   ```

2. Enter your credentials:
   - Username: Your admin username
   - Password: Your admin password

3. Click "Log In"

4. Upon successful login, you'll be redirected to the upload page

### Security Features

The login system includes:
- ✅ **CSRF Protection**: Every form has a unique token
- ✅ **Rate Limiting**: 5 failed attempts per minute max
- ✅ **Secure Sessions**: HTTPOnly, Secure, SameSite cookies
- ✅ **Password Hashing**: Bcrypt with automatic salting
- ✅ **Session Timeout**: 30 minutes of inactivity
- ✅ **Input Validation**: Username and password sanitization

## 📤 Upload Management

### Accessing Upload Page

After logging in, you'll automatically be directed to `/upload`:

```
http://localhost:5000/upload
```

Or navigate manually after logging in.

### Upload Interface Overview

The upload page provides a sophisticated multi-file upload system:

```
┌─────────────────────────────────────┐
│  Drag & Drop PDF files here         │
│            or                       │
│     [Select Files Button]           │
└─────────────────────────────────────┘

     [Upload All Pending Files]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  File 1      │ │  File 2      │ │  File 3      │
│  Form        │ │  Form        │ │  Form        │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Uploading Papers

#### Step 1: Select Files

**Option A: Drag & Drop**
1. Open file explorer
2. Select one or more PDF files
3. Drag them to the upload zone
4. Drop when the zone highlights

**Option B: File Browser**
1. Click "Select Files" button
2. Navigate to your files
3. Select one or more PDFs
4. Click "Open"

#### Step 2: Fill Metadata

For each file, a form card appears. Fill in:

**University** (Autocomplete available)
- University of Rajasthan
- S.S Jain Subodh (Auto) College
- Custom entry

**Paper Count**
- First Paper (1)
- Second Paper (2)
- Third Paper (3)
- Fourth Paper (4)
- Fifth Paper (5)

**Year**
- 2025
- 2024
- 2023
- 2022
- 2021
- 2020
- Custom entry

**Time Duration**
- 1 hr
- 1 hr 30 min
- 2 hr
- 2 hr 30 min
- 3 hr
- 3 hr 30 min
- Custom entry

**Maximum Marks**
- 20
- 54
- 80
- 100
- Custom entry

#### Step 3: Upload

1. Review all forms for accuracy
2. Click "Upload All Pending Files"
3. Wait for uploads to complete
4. Check status indicators on each card

### Status Indicators

Each file card shows a status:

- 🟦 **Pending**: Ready to upload, metadata filled
- 🟨 **Uploading**: Currently being uploaded
- 🟩 **Success**: Upload completed successfully
- 🟥 **Error**: Upload failed (see error message)

### Form Validation

The system validates:
- ✅ File type (must be PDF)
- ✅ File size (max 16MB)
- ✅ Required fields (all metadata)
- ✅ University name format
- ✅ Year range (1900-2099)
- ✅ Valid time duration
- ✅ Positive marks value

### Multiple File Upload

You can upload **multiple files simultaneously**:

1. Select or drag multiple PDFs
2. Forms appear in a horizontal scroll
3. Fill each form independently
4. Upload all with one click
5. Each file uploads asynchronously

### Error Handling

If an upload fails:

1. **Check the error message** on the file card
2. **Common issues:**
   - File too large (>16MB)
   - Invalid PDF format
   - Missing metadata
   - Network error
   - Server timeout
3. **Fix the issue** and try again
4. **Individual retry**: Each file can be re-uploaded independently

## 🗂️ File Management

### File Storage

Uploaded files are stored:
- **Location**: `uploads/` directory (configurable)
- **Naming**: Unique filenames (UUID + original name)
- **Organization**: By category (class, subject, year)
- **Permissions**: Restricted access, admin only

### Database Entries

Each upload creates a database entry with:
- File ID (unique identifier)
- Original filename
- Stored filename
- University
- Paper number
- Year
- Time duration
- Maximum marks
- Upload timestamp
- Admin user (who uploaded)

### Viewing Uploads

To view uploaded papers:
1. Query the database directly
2. Use admin dashboard (if implemented)
3. Check `uploads/` directory
4. View through API endpoints

## 🔧 Admin Settings

### Session Management

**Timeout**: 30 minutes of inactivity

**Extending session:**
- Any activity resets the timer
- Navigate pages
- Upload files
- Refresh page

**Logging out:**
- Click logout button (if available)
- Close browser
- Wait for timeout

### Security Best Practices

As an admin, follow these practices:

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Avoid common words
   - Don't reuse passwords

2. **Secure Sessions**
   - Always use HTTPS
   - Don't share credentials
   - Log out when finished
   - Use private browsing if on shared computer

3. **File Validation**
   - Scan PDFs for malware before upload
   - Verify file contents
   - Check file sizes
   - Ensure proper metadata

4. **Regular Maintenance**
   - Change password regularly
   - Review uploaded files
   - Check system logs
   - Monitor storage space

5. **Backup**
   - Regularly backup database
   - Store files externally
   - Keep backup of credentials
   - Document procedures

## 📊 Admin Dashboard Features

### Statistics (Future Feature)

Planned admin statistics:
- Total papers uploaded
- Storage space used
- Popular papers
- User activity
- Upload history

### User Management (Future Feature)

Planned features:
- Add/remove admin users
- Set permissions
- View activity logs
- Manage roles

## 🔍 Troubleshooting

### Cannot Login

**Issue**: Login fails even with correct credentials

**Solutions:**
1. Check username spelling (case-sensitive)
2. Verify password is correct
3. Clear browser cookies
4. Check if account exists
5. Recreate admin account

### Upload Fails

**Issue**: Files won't upload

**Solutions:**
1. Check file size (<16MB)
2. Verify PDF format
3. Check internet connection
4. Try one file at a time
5. Check server logs
6. Verify permissions on uploads directory

### Session Expires Quickly

**Issue**: Logged out frequently

**Solutions:**
1. Check session timeout setting
2. Keep browser tab active
3. Refresh periodically
4. Check browser cookie settings
5. Verify system time is correct

### Missing Upload Button

**Issue**: Can't find upload button

**Solutions:**
1. Ensure you're logged in
2. Clear browser cache
3. Check JavaScript is enabled
4. Try different browser
5. Verify upload.js is loaded

## 🛡️ Security Considerations

### Production Checklist

Before deploying to production:

- [ ] Change default admin credentials
- [ ] Enable HTTPS/TLS
- [ ] Set strong SECRET_KEY
- [ ] Configure firewall
- [ ] Set up rate limiting
- [ ] Enable logging
- [ ] Regular security audits
- [ ] Backup procedures
- [ ] Monitor for suspicious activity
- [ ] Keep software updated

### Monitoring

Regularly check:
- Failed login attempts
- Unusual upload patterns
- Large file uploads
- System resource usage
- Error logs

### Incident Response

If security breach suspected:
1. Change admin password immediately
2. Review all recent uploads
3. Check server logs
4. Scan for malware
5. Notify users if needed
6. Document incident
7. Implement additional security

## 📞 Support

For admin-related issues:
1. Check this guide first
2. Review error messages
3. Check server logs
4. Consult security documentation
5. Contact system administrator
6. Report bugs on GitHub

---

**Related Pages:**
- [Upload Guide](Upload-Guide.md) - Detailed upload instructions
- [Security Features](Security-Features.md) - Security implementation details
- [Development Guide](Development-Guide.md) - For developers
