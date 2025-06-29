#!/bin/bash

echo "🚀 Setting up Serviplay development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    print_status "Running on WSL - using Docker Desktop or external services"
    USE_DOCKER=true
else
    USE_DOCKER=false
fi

# Create databases using SQLite as fallback for development
create_sqlite_db() {
    print_status "Setting up SQLite database as fallback..."
    
    # Install sqlite3 if not available
    if ! command -v sqlite3 &> /dev/null; then
        print_warning "SQLite3 not found. Please install it manually."
        return 1
    fi
    
    # Create database directory
    mkdir -p ./backend/data
    
    # Create SQLite database with basic schema
    sqlite3 ./backend/data/serviplay.db << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('explorador', 'as')) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Basic test data
INSERT OR IGNORE INTO usuarios (nombre, email, password_hash, tipo_usuario) 
VALUES ('Test User', 'test@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBFkK5.j3T.AOu', 'explorador');

-- Categories table
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Insert basic categories
INSERT OR IGNORE INTO categorias (nombre, descripcion) VALUES 
('Limpieza', 'Servicios de limpieza del hogar'),
('Plomería', 'Servicios de plomería y reparaciones'),
('Electricidad', 'Servicios eléctricos'),
('Jardinería', 'Cuidado de jardines y plantas');

PRAGMA user_version = 1;
EOF
    
    print_status "SQLite database created at ./backend/data/serviplay.db"
    
    # Update backend database config for SQLite
    cat > ./backend/.env.sqlite << 'EOF'
# SQLite Configuration (Development Fallback)
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/serviplay.db

# Other configurations remain the same
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
EOF
    
    return 0
}

# Check for PostgreSQL
if command -v psql &> /dev/null; then
    print_status "PostgreSQL found, setting up database..."
    
    # Try to create database
    if psql -lqt | cut -d \| -f 1 | grep -qw serviplay_db; then
        print_status "Database 'serviplay_db' already exists"
    else
        print_status "Creating PostgreSQL database..."
        createdb serviplay_db 2>/dev/null || print_warning "Could not create database (may need permissions)"
    fi
else
    print_warning "PostgreSQL not found, using SQLite fallback..."
    create_sqlite_db
fi

# Check for Redis
if command -v redis-server &> /dev/null; then
    print_status "Redis found"
    # Start Redis if not running
    if ! pgrep redis-server > /dev/null; then
        print_status "Starting Redis server..."
        redis-server --daemonize yes --port 6379
    fi
else
    print_warning "Redis not found - some features may not work"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    print_status "Backend dependencies already installed"
fi

# Run migrations if using PostgreSQL
if command -v psql &> /dev/null && psql -lqt | cut -d \| -f 1 | grep -qw serviplay_db; then
    print_status "Running database migrations..."
    npm run migrate 2>/dev/null || print_warning "Migrations failed - may need manual setup"
fi

cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --force
else
    print_status "Frontend dependencies already installed"
fi

cd ..

print_status "✅ Development environment setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📱 Open http://localhost:3000 in your browser"
echo ""

if [ "$USE_DOCKER" = true ]; then
    print_warning "You're on WSL. Consider using Docker Desktop for PostgreSQL and Redis:"
    echo "   docker run --name postgres -e POSTGRES_DB=serviplay_db -e POSTGRES_USER=serviplay_user -e POSTGRES_PASSWORD=serviplay_pass -p 5432:5432 -d postgres:13"
    echo "   docker run --name redis -p 6379:6379 -d redis:alpine"
fi