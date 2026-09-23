<?php
/**
 * PDO connection helper.
 *
 * db() returns a PDO instance, or null if the database is disabled or
 * unreachable. Callers must handle null — the app is designed to run
 * perfectly well without MySQL.
 */

function config(?string $key = null)
{
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }
    if ($key === null) {
        return $config;
    }
    $value = $config;
    foreach (explode('.', $key) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return null;
        }
        $value = $value[$segment];
    }
    return $value;
}

function db_error(): ?string
{
    static $unused = null;
    return $GLOBALS['__db_error'] ?? null;
}

function db(): ?PDO
{
    static $pdo = null;
    static $tried = false;

    if ($tried) {
        return $pdo;
    }
    $tried = true;

    $cfg = config('db');
    if (empty($cfg['enabled'])) {
        $GLOBALS['__db_error'] = 'Database disabled in config.';
        return null;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $cfg['host'],
        $cfg['port'],
        $cfg['name'],
        $cfg['charset']
    );

    try {
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ]);
    } catch (PDOException $e) {
        $pdo = null;
        $GLOBALS['__db_error'] = $e->getMessage();
    }

    return $pdo;
}

/** Connect to the MySQL server without selecting a database (for the installer). */
function db_server(): PDO
{
    $cfg = config('db');
    $dsn = sprintf('mysql:host=%s;port=%d;charset=%s', $cfg['host'], $cfg['port'], $cfg['charset']);
    return new PDO($dsn, $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

/** True when the schema has actually been installed. */
function db_installed(): bool
{
    $pdo = db();
    if (!$pdo) {
        return false;
    }
    try {
        $pdo->query('SELECT 1 FROM customers LIMIT 1');
        return true;
    } catch (PDOException $e) {
        return false;
    }
}
