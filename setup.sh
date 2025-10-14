#!/bin/bash
# Quick Setup Script for Paper Terminal Archive

echo "========================================"
echo "Paper Terminal Archive - Setup Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env configuration file..."
    cp .env.example .env
    
    # Generate a secret key
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    # Update .env with generated secret key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secret-key-here-generate-a-random-one/$SECRET_KEY/" .env
    else
        # Linux
        sed -i "s/your-secret-key-here-generate-a-random-one/$SECRET_KEY/" .env
    fi
    
    echo "✓ .env file created with generated SECRET_KEY"
else
    echo "✓ .env file already exists"
fi
echo ""

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    echo "✓ Uploads directory created"
else
    echo "✓ Uploads directory already exists"
fi
echo ""

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "import database; database.init_db()"
echo "✓ Database initialized"
echo ""

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Create an admin user:"
echo "   python3 create_admin_secure.py"
echo ""
echo "2. Run the application:"
echo "   python3 app.py"
echo ""
echo "3. Access the application at:"
echo "   http://localhost:5000"
echo ""
echo "⚠️  Security Reminders:"
echo "   - Never commit .env or *.db files"
echo "   - Use a strong admin password"
echo "   - Disable debug mode in production"
echo "   - Enable HTTPS for production deployment"
echo ""
echo "📖 For more information, see README.md"
echo ""
