-- Setup database and user for Serviplay
CREATE DATABASE serviplay_db;
CREATE USER serviplay_user WITH ENCRYPTED PASSWORD 'serviplay_pass';
GRANT ALL PRIVILEGES ON DATABASE serviplay_db TO serviplay_user;

-- Connect to the database and grant schema privileges
\c serviplay_db;
GRANT ALL ON SCHEMA public TO serviplay_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO serviplay_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO serviplay_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";