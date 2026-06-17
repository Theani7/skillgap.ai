#!/bin/bash
set -e

echo "Setting up SkillGap.ai..."

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
cd frontend && npm install && cd ..

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cat > .env << 'EOF'
GEMINI_API_KEY=
JWT_SECRET_KEY=dev-secret-key-change-in-production-min-32-chars!!
DB_FILE=api/cv.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENV=development
EOF
    echo "Created .env - add your GEMINI_API_KEY if you have one"
fi

echo ""
echo "Setup complete! Run 'npm run dev' to start the application."
