-- =====================================================================
--  S&S CARGO - FREIGHT OS
--  Adds real authentication to the users table.
--  Run AFTER schema.sql + seed.sql:
--    mysql -u sscargo -p sscargo_freight_os < database/auth.sql
--  Safe to re-run.
-- =====================================================================

-- ADD COLUMN IF NOT EXISTS is MariaDB-only, so add the columns through
-- information_schema instead. This works on MySQL 5.7/8/9 and MariaDB,
-- and is a no-op when the column already exists.

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'password_hash') > 0,
  'SELECT "password_hash already present"',
  'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER email'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'last_login') > 0,
  'SELECT "last_login already present"',
  'ALTER TABLE users ADD COLUMN last_login DATETIME NULL AFTER active'
));
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ---------------------------------------------------------------------
--  Admin user.
--  Email:    admin@sscargo.example
--  Password: Admin123!
--  CHANGE THIS IMMEDIATELY - see "Creating a user" below.
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, initials, active)
VALUES (
  'U-00',
  'Admin',
  'admin@sscargo.example',
  '$2y$10$qXPZSvPAXsKXcFBYEYkKnOgzcDHBR0pkgDFaku4omDFdcqUIBN3gC',
  'Operations manager',
  'AD',
  1
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  active        = 1;

-- Give the five seeded demo users the same starting password so you can
-- test the different roles. Delete this statement if you do not want them
-- to be able to sign in at all.
UPDATE users
   SET password_hash = '$2y$10$qXPZSvPAXsKXcFBYEYkKnOgzcDHBR0pkgDFaku4omDFdcqUIBN3gC'
 WHERE password_hash IS NULL;

-- =====================================================================
--  CREATING A USER
--
--  Never write a plaintext password into this table. Generate a hash
--  first, then paste it into the INSERT.
--
--  1. Generate the hash on the server:
--
--       php -r 'echo password_hash("YourNewPassword", PASSWORD_BCRYPT), "\n";'
--
--  2. Insert the user with that hash:
--
--       INSERT INTO users (id, name, email, password_hash, role, initials, active)
--       VALUES ('U-06', 'Jane Doe', 'jane@sscargo.example',
--               '<paste the $2y$... hash here>',
--               'Dispatcher', 'JD', 1);
--
--  Or do both in one step with the helper script:
--
--       php bin/make-user.php jane@sscargo.example "Jane Doe" Dispatcher
--
--  CHANGING A PASSWORD
--
--       UPDATE users SET password_hash = '<new hash>'
--        WHERE email = 'admin@sscargo.example';
--
--  Roles that exist in the app: Operations manager, Dispatcher, Billing,
--  Carrier sales, Accounting. "Operations manager" sees every module.
-- =====================================================================
