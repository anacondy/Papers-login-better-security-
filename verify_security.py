"""
Quick Security Verification Script
Tests basic security configurations without running the full app
"""

import sys
import os

print("=" * 60)
print("Security Configuration Verification")
print("=" * 60)
print()

# Test 1: Check if app.py can be imported
print("✓ Test 1: Checking app.py syntax...")
try:
    with open('app.py', 'r') as f:
        content = f.read()
    compile(content, 'app.py', 'exec')
    print("  ✓ app.py syntax is valid")
except SyntaxError as e:
    print(f"  ✗ Syntax error in app.py: {e}")
    sys.exit(1)

# Test 2: Check if security configurations are present
print("\n✓ Test 2: Checking security configurations...")
required_configs = [
    'SECRET_KEY',
    'SESSION_COOKIE_SECURE',
    'SESSION_COOKIE_HTTPONLY',
    'SESSION_COOKIE_SAMESITE',
    'WTF_CSRF_ENABLED',
]

for config in required_configs:
    if config in content:
        print(f"  ✓ {config} is configured")
    else:
        print(f"  ✗ {config} is missing")

# Test 3: Check for security middleware
print("\n✓ Test 3: Checking security middleware...")
security_components = [
    ('CSRFProtect', 'CSRF Protection'),
    ('Limiter', 'Rate Limiting'),
    ('Talisman', 'HTTPS Enforcement'),
]

for component, name in security_components:
    if component in content:
        print(f"  ✓ {name} ({component}) is configured")
    else:
        print(f"  ⚠ {name} ({component}) not found")

# Test 4: Check for security headers
print("\n✓ Test 4: Checking security headers...")
security_headers = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Referrer-Policy',
]

for header in security_headers:
    if header in content:
        print(f"  ✓ {header} header is set")
    else:
        print(f"  ✗ {header} header is missing")

# Test 5: Check for input validation
print("\n✓ Test 5: Checking input validation...")
if 'validate_search_query' in content:
    print("  ✓ Input validation function exists")
else:
    print("  ✗ Input validation function not found")

# Test 6: Check for error handlers
print("\n✓ Test 6: Checking error handlers...")
error_handlers = ['404', '500', '429', '403']
for code in error_handlers:
    if f'errorhandler({code})' in content:
        print(f"  ✓ Error handler for {code} exists")
    else:
        print(f"  ⚠ Error handler for {code} not found")

# Test 7: Check required files
print("\n✓ Test 7: Checking required files...")
required_files = [
    'requirements.txt',
    '.gitignore',
    'README.md',
    'SECURITY_ASSESSMENT.md',
    'SECURITY.md',
    'IMPLEMENTATION_GUIDE.md',
    '.env.example',
]

for filename in required_files:
    if os.path.exists(filename):
        print(f"  ✓ {filename} exists")
    else:
        print(f"  ✗ {filename} is missing")

# Test 8: Check templates and static folders
print("\n✓ Test 8: Checking project structure...")
if os.path.exists('templates') and os.path.isdir('templates'):
    print("  ✓ templates/ directory exists")
    template_files = os.listdir('templates')
    print(f"    - Contains {len(template_files)} template(s)")
else:
    print("  ✗ templates/ directory not found")

if os.path.exists('static') and os.path.isdir('static'):
    print("  ✓ static/ directory exists")
    static_files = os.listdir('static')
    print(f"    - Contains {len(static_files)} static file(s)")
else:
    print("  ✗ static/ directory not found")

# Test 9: Check for dangerous patterns
print("\n✓ Test 9: Checking for dangerous patterns...")
dangerous_patterns = [
    ('eval(', 'eval() usage'),
    ('exec(', 'exec() usage'),
    ('__import__', 'dynamic imports'),
]

found_issues = False
for pattern, desc in dangerous_patterns:
    # Exclude this test file itself
    if pattern in content and 'compile(content' not in content:
        print(f"  ⚠ Found potentially dangerous pattern: {desc}")
        found_issues = True

if not found_issues:
    print("  ✓ No dangerous patterns detected")

# Test 10: Check JavaScript file
print("\n✓ Test 10: Checking JavaScript security...")
if os.path.exists('static/script.js'):
    with open('static/script.js', 'r') as f:
        js_content = f.read()
    
    if 'escapeHtml' in js_content:
        print("  ✓ HTML escaping function found")
    else:
        print("  ⚠ HTML escaping function not found")
    
    if 'validateSearchQuery' in js_content:
        print("  ✓ Client-side validation found")
    else:
        print("  ⚠ Client-side validation not found")
    
    if 'X-CSRFToken' in js_content or 'csrf' in js_content.lower():
        print("  ✓ CSRF token handling found")
    else:
        print("  ⚠ CSRF token handling not found")
else:
    print("  ✗ static/script.js not found")

print("\n" + "=" * 60)
print("Security verification completed!")
print("=" * 60)
print()
print("Next steps:")
print("1. Install dependencies: pip install -r requirements.txt")
print("2. Set up environment: cp .env.example .env")
print("3. Generate SECRET_KEY and add to .env")
print("4. Review SECURITY_ASSESSMENT.md for detailed analysis")
print("5. Follow IMPLEMENTATION_GUIDE.md for deployment")
print()
