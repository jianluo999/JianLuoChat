-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('ROLE_USER', 'Default user role'),
('ROLE_ADMIN', 'Administrator role'),
('ROLE_MODERATOR', 'Moderator role')
ON CONFLICT (name) DO NOTHING;
