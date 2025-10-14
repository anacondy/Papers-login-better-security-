import database

# ⚠️ WARNING: This file contains hardcoded credentials and is INSECURE!
# ⚠️ Use create_admin_secure.py instead for production environments.
# ⚠️ This file is kept for backward compatibility only.
# --- SET YOUR ADMIN USERNAME AND PASSWORD HERE ---
ADMIN_USERNAME = "AdminName"
ADMIN_PASSWORD = "YourPassword" # Choose a strong password!
# ---------------------------------------------

database.init_db() # Make sure tables exist
database.add_user(ADMIN_USERNAME, ADMIN_PASSWORD)
