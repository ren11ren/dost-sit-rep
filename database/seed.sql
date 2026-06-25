-- DOST SIT REP PostgreSQL seed data

INSERT INTO users (name, email, office, role, status, password_hash)
SELECT 'Admin User', 'admin@dostregion1.ph', 'PSTO-La Union', 'SADMIN', 'Active', 'admin123'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@dostregion1.ph'
);

INSERT INTO settings (setting_key, setting_value)
VALUES ('active_menu', '"dashboard"'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = CURRENT_TIMESTAMP;
