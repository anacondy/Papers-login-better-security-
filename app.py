import os
import sqlite3
import mimetypes
import database
from flask import Flask, request, render_template, url_for, jsonify, send_from_directory, session, redirect, flash, abort
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# SECURITY: Use environment variable for SECRET_KEY
# Generate a secret key with: python -c "import secrets; print(secrets.token_hex(32))"
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-CHANGE-THIS-IN-PRODUCTION-' + os.urandom(24).hex())
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_UPLOAD_SIZE_MB', 10)) * 1024 * 1024  # Default 10MB

# Session security settings
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 7200  # 2 hours

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
database.init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Security headers
@app.after_request
def set_security_headers(response):
    """Add security headers to all responses."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Only enable HSTS if using HTTPS
    if request.is_secure:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# File upload validation
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    """Check if file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def terminal_ui():
    return render_template('index.html')

@app.route('/admin')
@login_required
def upload_form():
    return render_template('upload.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        conn = sqlite3.connect('papers.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('upload_form'))
        else:
            flash('Invalid username or password.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('terminal_ui'))

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files: return "Missing file part", 400
    file = request.files['file']
    if file.filename == '': return "Invalid file", 400
    
    # SECURITY: Validate file type server-side
    if not allowed_file(file.filename):
        return "Only PDF files are allowed", 400
    
    # SECURITY: Verify MIME type
    mime_type = mimetypes.guess_type(file.filename)[0]
    if mime_type != 'application/pdf':
        return "Invalid file type. Only PDF files are allowed.", 400
    
    data = { "class_name": request.form.get('class', ''), "subject": request.form.get('subject', ''), "semester": request.form.get('semester', ''), "exam_year": request.form.get('exam_year', ''), "exam_type": request.form.get('exam_type', ''), "paper_code": request.form.get('paper_code', 'N/A'), "exam_number": request.form.get('exam_number', 'N/A'), "medium": request.form.get('medium', ''), "university": request.form.get('university', 'N/A'), "time": request.form.get('time', 'N/A'), "max_marks": request.form.get('max_marks', 'N/A'), "uploader_name": request.form.get('admin_name', 'Unknown') }
    required_fields = ['class_name', 'subject', 'semester', 'exam_year', 'exam_type', 'medium', 'uploader_name']
    if not all(data[key] for key in required_fields): return "A required field is empty", 400
    
    # SECURITY: Use secure_filename to prevent path traversal
    unique_prefix = str(int(os.times().system * 1000))
    filename = secure_filename(f"{unique_prefix}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    file.save(filepath)
    try:
        conn = sqlite3.connect('papers.db')
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO papers (class, subject, semester, exam_year, exam_type, paper_code, exam_number, medium, university, time, max_marks, uploader_name, filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (data['class_name'], data['subject'], data['semester'], data['exam_year'], data['exam_type'], data['paper_code'], data['exam_number'], data['medium'], data['university'], data['time'], data['max_marks'], data['uploader_name'], filename))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database Error: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return "Database error", 500
    return "Success", 200

@app.route('/api/papers')
def get_papers():
    search_query = request.args.get('q', '').strip().lower()
    conn = sqlite3.connect('papers.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if not search_query:
        cursor.execute('SELECT * FROM papers ORDER BY exam_year DESC, subject')
    else:
        raw_terms = search_query.split()
        TRANSLATION_MAP = {'1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X','one': 'I', 'two': 'II', 'three': 'III', 'four': 'IV', 'five': 'V', 'six': 'VI', 'seven': 'VII', 'eight': 'VIII','first': 'I', 'second': 'II', 'third': 'III', 'fourth': 'IV', 'fifth': 'V', '3rd': 'III','i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'v': 'V', 'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX', 'x': 'X','sem': 'semester', 'semester': 'semester','phy': 'physics', 'pys': 'psychology', 'env': 'environmental', 'sci': 'science','his': 'history', 'eco': 'economics', 'stats': 'statistics', 'biotech': 'biotechnology','cs': 'computer', 'ps': 'political', 'geo': 'geography', 'zoo': 'zoology','bot': 'botany', 'eng': 'english', 'hin': 'hindi', 'chem': 'chemistry'}
        processed_terms = [TRANSLATION_MAP.get(term, term) for term in raw_terms]
        sql_query = 'SELECT * FROM papers WHERE '
        conditions = []
        params = []
        search_columns = ['class', 'subject', 'semester', 'exam_year', 'exam_type', 'paper_code', 'exam_number', 'medium', 'university', 'uploader_name']
        for term in processed_terms:
            term_conditions = []
            for col in search_columns:
                term_conditions.append(f'LOWER({col}) LIKE ?')
                params.append(f'%{term}%')
            conditions.append(f"({' OR '.join(term_conditions)})")
        sql_query += ' AND '.join(conditions)
        sql_query += ' ORDER BY exam_year DESC, subject'
        cursor.execute(sql_query, params)
    papers_rows = cursor.fetchall()
    conn.close()
    papers_list = []
    for row in papers_rows:
        paper = dict(row)
        paper['url'] = url_for('get_uploaded_file', filename=paper['filename'])
        paper['original_name'] = f"{paper['subject']} {paper['exam_type']} {paper['exam_year']}"
        papers_list.append(paper)
    return jsonify(papers_list)

@app.route('/uploads/<path:filename>')
def get_uploaded_file(filename):
    """
    Serve uploaded files with path traversal protection.
    SECURITY: Validate filename to prevent directory traversal attacks.
    """
    # Prevent path traversal
    if '..' in filename or filename.startswith('/') or filename.startswith('\\'):
        abort(404)
    
    # Additional security: ensure the file is within the upload folder
    safe_path = os.path.abspath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    upload_folder_abs = os.path.abspath(app.config['UPLOAD_FOLDER'])
    
    if not safe_path.startswith(upload_folder_abs):
        abort(404)
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # SECURITY: Never run with debug=True in production
    # Set FLASK_DEBUG environment variable to enable debug mode in development
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    if debug_mode:
        print("WARNING: Running in DEBUG mode. Never use this in production!")
    
    app.run(debug=debug_mode)
