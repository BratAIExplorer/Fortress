-- Create a new user for a specific project
-- REPLACE 'new_project_user' and 'strong_password'
CREATE USER new_project_user WITH PASSWORD 'strong_password';

-- Create the database owned by this user
-- REPLACE 'new_project_db'
CREATE DATABASE new_project_db OWNER new_project_user;

-- Grant privileges (if needed, usually OWNER is enough)
GRANT ALL PRIVILEGES ON DATABASE new_project_db TO new_project_user;

-- REVOKE public access to ensure isolation (Optional but recommended)
REVOKE ALL ON DATABASE new_project_db FROM public;
