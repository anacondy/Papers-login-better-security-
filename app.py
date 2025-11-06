"""
Secure Flask Application for Previous Year Papers Portal
This application implements security best practices for a paper search system.
"""

import os
import logging
from datetime import timedelta
from flask import Flask, render_template, request, jsonify, session
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
import secrets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

class SecurityConfig:
    """Security configuration for the application"""
    
    # Secret key - MUST be changed in production and stored in environment variables
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    
    # Session security
    SESSION_COOKIE_SECURE = True  # Only send cookie over HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access to session cookie
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)  # Session timeout
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None  # No time limit on CSRF tokens
    WTF_CSRF_SSL_STRICT = True  # Require HTTPS for CSRF
    
    # Prevent old password vulnerabilities
    SESSION_REFRESH_EACH_REQUEST = True
    
    # File upload security (if needed in future)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config.from_object(SecurityConfig)

# ============================================================================
# SECURITY MIDDLEWARE
# ============================================================================

# CSRF Protection
csrf = CSRFProtect(app)

# Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Content Security Policy
csp = {
    'default-src': "'self'",
    'script-src': [
        "'self'",
        # If you need inline scripts, use nonces instead of 'unsafe-inline'
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'",  # Required for some CSS frameworks
        'https://fonts.googleapis.com'
    ],
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
    ],
    'img-src': [
        "'self'",
        'data:'
    ],
    'connect-src': "'self'",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'"
}

# Talisman for HTTPS enforcement and security headers
# Configure based on environment
is_production = os.environ.get('FLASK_ENV') == 'production'

talisman = Talisman(
    app,
    force_https=is_production,  # Only force HTTPS in production
    strict_transport_security=is_production,
    strict_transport_security_max_age=31536000 if is_production else 0,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src'],
    referrer_policy='strict-origin-when-cross-origin',
    feature_policy={
        'geolocation': "'none'",
        'microphone': "'none'",
        'camera': "'none'"
    }
)

# ============================================================================
# ADDITIONAL SECURITY HEADERS
# ============================================================================

@app.after_request
def set_additional_security_headers(response):
    """Add additional security headers to all responses"""
    
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # XSS Protection (legacy browsers)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # Remove server header to prevent information disclosure
    response.headers.pop('Server', None)
    
    # Permissions Policy (modern alternative to Feature-Policy)
    response.headers['Permissions-Policy'] = (
        'geolocation=(), microphone=(), camera=(), '
        'payment=(), usb=(), magnetometer=(), gyroscope=()'
    )
    
    # Cache control for static assets
    if request.path.startswith('/static/'):
        # Cache static files for 1 year
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    elif request.path in ['/', '/search', '/api/papers']:
        # Don't cache API and dynamic routes
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    
    return response

# ============================================================================
# INPUT VALIDATION
# ============================================================================

def validate_search_query(query):
    """
    Validate search query to prevent injection attacks
    
    Args:
        query (str): Search query from user
        
    Returns:
        tuple: (is_valid, sanitized_query or error_message)
    """
    if not query:
        return False, "Search query cannot be empty"
    
    # Length validation
    if len(query) > 100:
        return False, "Search query too long (max 100 characters)"
    
    if len(query) < 2:
        return False, "Search query too short (min 2 characters)"
    
    # Character validation - allow alphanumeric, spaces, and basic punctuation
    import re
    if not re.match(r'^[a-zA-Z0-9\s\-_.]+$', query):
        return False, "Invalid characters in search query"
    
    # Sanitize by stripping whitespace
    sanitized = query.strip()
    
    logger.info(f"Search query validated: {sanitized}")
    return True, sanitized

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    logger.warning(f"404 error: {request.url}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"500 error: {error}")
    return render_template('500.html'), 500

@app.errorhandler(429)
def ratelimit_handler(error):
    """Handle rate limit exceeded"""
    logger.warning(f"Rate limit exceeded from {get_remote_address()}")
    return jsonify(error="Rate limit exceeded. Please try again later."), 429

@app.errorhandler(403)
def forbidden_error(error):
    """Handle 403 errors"""
    logger.warning(f"403 error: {request.url}")
    return jsonify(error="Access forbidden"), 403

# ============================================================================
# ROUTES
# ============================================================================

@app.route('/')
def index():
    """Render the main page"""
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering index: {e}")
        return "An error occurred", 500

@app.route('/search', methods=['POST'])
@limiter.limit("10 per minute")  # Strict rate limit for search
def search():
    """
    Handle search requests with security measures
    
    Returns:
        JSON response with search results or error
    """
    try:
        # Get search query from request
        query = request.json.get('query', '') if request.is_json else request.form.get('query', '')
        
        # Validate input
        is_valid, result = validate_search_query(query)
        if not is_valid:
            logger.warning(f"Invalid search query: {result}")
            return jsonify(error=result), 400
        
        sanitized_query = result
        
        # TODO: Implement actual search logic here
        # For now, return mock results
        results = [
            {
                'title': f'Result for: {sanitized_query}',
                'subject': 'Example Subject',
                'year': '2024',
                'url': '#'
            }
        ]
        
        logger.info(f"Search performed: {sanitized_query}")
        return jsonify(results=results), 200
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify(error="An error occurred while searching"), 500

@app.route('/health')
@limiter.exempt  # Health check should not be rate limited
def health():
    """Health check endpoint"""
    return jsonify(status="healthy"), 200

@app.route('/manifest.json')
@limiter.exempt
def manifest():
    """Serve PWA manifest"""
    return app.send_static_file('manifest.json')

@app.route('/sw.js')
@limiter.exempt
def service_worker():
    """Serve service worker"""
    response = app.send_static_file('sw.js')
    response.headers['Service-Worker-Allowed'] = '/'
    return response

@app.route('/api/papers', methods=['GET'])
@limiter.limit("30 per minute")
def get_papers():
    """
    Get all papers or search papers
    
    Query parameters:
        q (str): Optional search query
    
    Returns:
        JSON response with papers list
    """
    try:
        query = request.args.get('q', '').strip()
        
        # Mock data for now - replace with actual database query
        papers = [
            {
                'class': 'MCA',
                'subject': 'Data Structures',
                'semester': 1,
                'exam_year': 2024,
                'url': '#'
            },
            {
                'class': 'MCA',
                'subject': 'Computer Networks',
                'semester': 2,
                'exam_year': 2023,
                'url': '#'
            },
            {
                'class': 'BCA',
                'subject': 'Programming in C',
                'semester': 1,
                'exam_year': 2024,
                'url': '#'
            }
        ]
        
        # Filter papers if search query provided
        if query:
            is_valid, result = validate_search_query(query)
            if not is_valid:
                return jsonify(error=result), 400
            
            query_lower = result.lower()
            papers = [
                p for p in papers 
                if query_lower in p['subject'].lower() 
                or query_lower in p['class'].lower()
                or query_lower in str(p['exam_year'])
            ]
        
        logger.info(f"Papers API called with query: {query}, results: {len(papers)}")
        return jsonify(papers), 200
        
    except Exception as e:
        logger.error(f"Papers API error: {e}")
        return jsonify(error="An error occurred"), 500

# ============================================================================
# SECURITY UTILITIES
# ============================================================================

def generate_nonce():
    """Generate a nonce for CSP"""
    return secrets.token_urlsafe(16)

@app.context_processor
def inject_nonce():
    """Inject nonce into templates for CSP"""
    return dict(csp_nonce=generate_nonce)

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

if __name__ == '__main__':
    # Check if SECRET_KEY is set in production
    if not os.environ.get('SECRET_KEY'):
        logger.warning(
            "SECRET_KEY not set! Using default. "
            "This is insecure for production. "
            "Set SECRET_KEY environment variable."
        )
    
    # Development settings
    # In production, use a proper WSGI server like Gunicorn
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    if debug_mode:
        logger.warning("Running in DEBUG mode - not suitable for production!")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=debug_mode,
        # Never use debug=True in production!
    )
