#!/usr/bin/env python3
"""
Secure admin user creation script.
This script prompts for credentials instead of hardcoding them.
"""
import sys
import getpass
import database

def create_admin_user():
    """Creates an admin user with credentials provided interactively."""
    print("=" * 50)
    print("Admin User Creation")
    print("=" * 50)
    
    username = input("Enter admin username: ").strip()
    
    if not username:
        print("Error: Username cannot be empty")
        sys.exit(1)
    
    if len(username) < 3:
        print("Error: Username must be at least 3 characters")
        sys.exit(1)
    
    password = getpass.getpass("Enter admin password: ")
    password_confirm = getpass.getpass("Confirm admin password: ")
    
    if password != password_confirm:
        print("Error: Passwords do not match")
        sys.exit(1)
    
    if len(password) < 12:
        print("Error: Password must be at least 12 characters")
        sys.exit(1)
    
    # Initialize database and create user
    database.init_db()
    database.add_user(username, password)
    
    print("\n" + "=" * 50)
    print("Admin user created successfully!")
    print("=" * 50)
    print("\nSecurity reminders:")
    print("1. Never share your admin credentials")
    print("2. Use a strong, unique password")
    print("3. Keep this password secure")
    print("4. Delete create_admin.py after use if it's a modified version")

if __name__ == '__main__':
    create_admin_user()
