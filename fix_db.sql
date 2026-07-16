DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dostuser') THEN
        CREATE ROLE dostuser LOGIN PASSWORD 'dostpass';
    ELSE
        ALTER ROLE dostuser LOGIN PASSWORD 'dostpass';
    END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER %I', 'dostdb', 'dostuser')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dostdb');
\gexec
