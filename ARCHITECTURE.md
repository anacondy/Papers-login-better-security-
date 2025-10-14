# Security Architecture

## Application Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                         USER REQUEST                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: TRANSPORT                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ HTTPS/TLS Encryption                                 │ │
│  │ ✓ HSTS (Strict-Transport-Security)                     │ │
│  │ ✓ SSL/TLS Certificate                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 LAYER 2: WEB SERVER (Nginx)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ Rate Limiting (Infrastructure Level)                 │ │
│  │ ✓ Request Filtering                                    │ │
│  │ ✓ Security Headers                                     │ │
│  │ ✓ Proxy Protection                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 3: FLASK SECURITY MIDDLEWARE              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Flask-Talisman                                         │ │
│  │  ├─ Force HTTPS                                        │ │
│  │  ├─ Content Security Policy (CSP)                     │ │
│  │  ├─ X-Frame-Options: DENY                             │ │
│  │  ├─ X-Content-Type-Options: nosniff                   │ │
│  │  └─ Referrer-Policy                                   │ │
│  │                                                        │ │
│  │ Flask-Limiter                                          │ │
│  │  ├─ Global: 200/day, 50/hour                          │ │
│  │  ├─ Search: 10/minute                                 │ │
│  │  └─ IP-based tracking                                 │ │
│  │                                                        │ │
│  │ Flask-WTF CSRFProtect                                  │ │
│  │  ├─ Token generation                                  │ │
│  │  ├─ Token validation                                  │ │
│  │  └─ Session protection                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 4: APPLICATION SECURITY                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Input Validation                                       │ │
│  │  ├─ Length checks (2-100 chars)                       │ │
│  │  ├─ Character whitelist validation                    │ │
│  │  ├─ Regex pattern matching                            │ │
│  │  └─ Sanitization                                      │ │
│  │                                                        │ │
│  │ Session Management                                     │ │
│  │  ├─ Secure cookie flags (HTTPOnly, Secure, SameSite) │ │
│  │  ├─ 30-minute timeout                                 │ │
│  │  ├─ Random session IDs                                │ │
│  │  └─ Session refresh                                   │ │
│  │                                                        │ │
│  │ Error Handling                                         │ │
│  │  ├─ Custom error pages (404, 500)                     │ │
│  │  ├─ No information leakage                            │ │
│  │  ├─ Logging (errors only)                             │ │
│  │  └─ User-friendly messages                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 5: DATA ACCESS                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Database Security (When Implemented)                   │ │
│  │  ├─ Parameterized queries (SQL injection prevention)  │ │
│  │  ├─ ORM usage (SQLAlchemy)                            │ │
│  │  ├─ Connection pooling                                │ │
│  │  ├─ Encrypted connections                             │ │
│  │  └─ Access control                                    │ │
│  │                                                        │ │
│  │ Authentication (When Implemented)                      │ │
│  │  ├─ Password hashing (bcrypt/Argon2)                  │ │
│  │  ├─ Account lockout                                   │ │
│  │  ├─ Session management                                │ │
│  │  └─ Role-based access control                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 6: MONITORING & LOGGING                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ Security event logging                               │ │
│  │ ✓ Access logging                                       │ │
│  │ ✓ Error logging                                        │ │
│  │ ✓ Rate limit violations                                │ │
│  │ ✓ Failed authentication attempts                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      RESPONSE TO USER                        │
└─────────────────────────────────────────────────────────────┘
```

## Security Controls Matrix

### Prevention Controls (Proactive)

| Control | Purpose | Location | Status |
|---------|---------|----------|--------|
| Input Validation | Prevent injection attacks | Application | ✅ |
| CSRF Tokens | Prevent CSRF attacks | Middleware | ✅ |
| CSP Headers | Prevent XSS | Middleware | ✅ |
| Rate Limiting | Prevent brute force/DoS | Middleware | ✅ |
| HTTPS Enforcement | Encrypt data in transit | Middleware | ✅ |
| Secure Sessions | Prevent session hijacking | Configuration | ✅ |

### Detection Controls (Monitoring)

| Control | Purpose | Location | Status |
|---------|---------|----------|--------|
| Logging | Track security events | Application | ✅ |
| Error Tracking | Detect anomalies | Application | ✅ |
| Access Logs | Monitor access patterns | Web Server | ✅ |

### Response Controls (Reactive)

| Control | Purpose | Location | Status |
|---------|---------|----------|--------|
| Error Pages | Graceful failure handling | Templates | ✅ |
| Rate Limit Response | Block excessive requests | Middleware | ✅ |
| Custom Error Handlers | Prevent info leakage | Application | ✅ |

## Request Flow with Security Checks

```
1. User Request
   │
   ├─→ [HTTPS Check] → If HTTP, redirect to HTTPS
   │
   ├─→ [Rate Limit Check] → If exceeded, return 429
   │
   ├─→ [Security Headers] → Add CSP, X-Frame-Options, etc.
   │
   ├─→ [CSRF Check] → For POST/PUT/DELETE, validate token
   │
   ├─→ [Input Validation] → Sanitize and validate all inputs
   │
   ├─→ [Authentication Check] → Verify user session (if required)
   │
   ├─→ [Authorization Check] → Check user permissions (if required)
   │
   ├─→ [Business Logic] → Execute application logic
   │
   ├─→ [Output Encoding] → Escape all user-generated content
   │
   └─→ [Response] → Return with security headers

2. Response Sent
   │
   └─→ [Logging] → Log request details and any security events
```

## Attack Vector Protection

### XSS (Cross-Site Scripting) Protection

```
Input: <script>alert('XSS')</script>

Layer 1: Client-side validation (script.js)
  └─→ Reject: Special characters detected

Layer 2: Server-side validation (app.py)
  └─→ Reject: Invalid characters in input

Layer 3: Template escaping (Jinja2)
  └─→ If allowed through, output: &lt;script&gt;alert('XSS')&lt;/script&gt;

Layer 4: CSP Header
  └─→ Block: Inline scripts not allowed

Result: ✅ XSS Attack Prevented
```

### CSRF (Cross-Site Request Forgery) Protection

```
Attacker creates malicious form:
<form action="https://yourdomain.com/search" method="POST">
  <input name="query" value="malicious">
</form>

Layer 1: CSRF Token Required
  └─→ Check: Is valid token present?
      └─→ No → Reject with 403 Forbidden

Layer 2: Same-Site Cookie
  └─→ Check: Is request from same site?
      └─→ No → Cookie not sent

Result: ✅ CSRF Attack Prevented
```

### SQL Injection Protection

```
Input: ' OR '1'='1' --

Layer 1: Input Validation
  └─→ Reject: Special SQL characters detected

Layer 2: Parameterized Queries (SQLAlchemy)
  └─→ Safe: Query uses parameters, not string concatenation
      └─→ SQL: SELECT * FROM papers WHERE title = ?
          Parameters: ["' OR '1'='1' --"]

Result: ✅ SQL Injection Prevented
```

### DoS (Denial of Service) Protection

```
Attacker makes 1000 requests/second

Layer 1: Infrastructure Rate Limiting (Nginx)
  └─→ Limit: 100 requests/second per IP

Layer 2: Application Rate Limiting (Flask-Limiter)
  └─→ Limit: 50 requests/hour per IP for general
  └─→ Limit: 10 requests/minute per IP for search

Layer 3: Connection Limits
  └─→ Max: 100 concurrent connections

Result: ✅ DoS Attack Mitigated
```

## Security Monitoring Flow

```
┌─────────────┐
│   Request   │
└─────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Security Event Detection       │
│  ├─ Failed auth attempt?       │
│  ├─ Rate limit exceeded?       │
│  ├─ Invalid input detected?    │
│  ├─ CSRF token missing?        │
│  └─ Suspicious pattern?        │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│       Event Logging             │
│  ├─ Log to file                │
│  ├─ Add timestamp              │
│  ├─ Include IP address         │
│  ├─ Add user agent             │
│  └─ Log request details        │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│    Automated Response           │
│  ├─ Block IP if threshold met  │
│  ├─ Send alert notification    │
│  ├─ Update firewall rules      │
│  └─ Trigger incident response  │
└─────────────────────────────────┘
```

## Security Headers Configuration

```
HTTP Response Headers:

├─ Strict-Transport-Security: max-age=31536000; includeSubDomains
│  └─→ Forces HTTPS for 1 year
│
├─ Content-Security-Policy: default-src 'self'; script-src 'self'; ...
│  └─→ Controls resource loading, prevents XSS
│
├─ X-Frame-Options: DENY
│  └─→ Prevents clickjacking
│
├─ X-Content-Type-Options: nosniff
│  └─→ Prevents MIME type sniffing
│
├─ X-XSS-Protection: 1; mode=block
│  └─→ Enables browser XSS filter
│
├─ Referrer-Policy: strict-origin-when-cross-origin
│  └─→ Controls referrer information
│
└─ Permissions-Policy: geolocation=(), microphone=(), camera=()
   └─→ Restricts browser features
```

## Defense in Depth Strategy

```
          ┌───────────────────────────────────┐
          │   User / Attacker                 │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Firewall                        │
          │   First line of defense           │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Web Server (Nginx)              │
          │   Request filtering & rate limit  │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Flask Security Middleware       │
          │   CSRF, Rate limit, Headers       │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Application Logic               │
          │   Input validation, Auth          │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Database                        │
          │   Parameterized queries           │
          └───────────────────────────────────┘
                        │
                        ▼
          ┌───────────────────────────────────┐
          │   Logging & Monitoring            │
          │   Detect & respond                │
          └───────────────────────────────────┘

Each layer provides independent protection!
If one layer fails, others still provide security.
```

---

**This architecture implements security at every layer of the application stack!**
