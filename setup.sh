#!/bin/bash
set -e

echo "Setting up SkillPath..."

# Create Python virtual environment if it doesn't exist
if [ ! -d "venvapp" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venvapp
fi

# Activate venv and install Python dependencies
echo "Installing Python dependencies..."
source venvapp/bin/activate
pip install -r api/requirements.txt -q

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && bun install && cd ..

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cat > .env << 'EOF'
GEMINI_API_KEY=
JWT_SECRET_KEY=dev-secret-key-change-in-production-min-32-chars!!
DB_FILE=api/cv.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
    echo "Created .env - set ADMIN_USERNAME and ADMIN_PASSWORD for your admin account"
fi

echo ""
echo "Setup complete! Run 'npm run dev' to start the application."
