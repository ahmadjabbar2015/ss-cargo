<?php
/**
 * Session authentication against the users table.
 */

require_once __DIR__ . '/helpers.php';

function auth_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        // Only send the cookie over TLS when the request arrived over TLS,
        // so this still works on plain HTTP before certbot runs.
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_name('SSCARGO');
    session_start();
}

/** True when the users table has a password_hash column (auth.sql applied). */
function auth_available(): bool
{
    $pdo = db();
    if (!$pdo) {
        return false;
    }
    try {
        $pdo->query('SELECT password_hash FROM users LIMIT 1');
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

/** Attempt a login. Returns the user row on success, null on failure. */
function auth_attempt(string $email, string $password): ?array
{
    $pdo = db();
    if (!$pdo) {
        return null;
    }

    try {
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email AND active = 1 LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
    } catch (PDOException $e) {
        return null;
    }

    // Hash a dummy value when the user does not exist so that a missing
    // account and a wrong password take roughly the same time to answer.
    $hash = $user['password_hash'] ?? '$2y$10$usesomesillystringforeverysingletimeyoucallthisfunction';
    if (!password_verify($password, $hash) || !$user) {
        return null;
    }

    if (password_needs_rehash($hash, PASSWORD_BCRYPT)) {
        $up = $pdo->prepare('UPDATE users SET password_hash = :h WHERE id = :id');
        $up->execute([':h' => password_hash($password, PASSWORD_BCRYPT), ':id' => $user['id']]);
    }

    try {
        $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = :id')
            ->execute([':id' => $user['id']]);
    } catch (PDOException $e) {
        // last_login is a convenience column; never block a login on it.
    }

    auth_start();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id'       => $user['id'],
        'name'     => $user['name'],
        'email'    => $user['email'],
        'role'     => $user['role'],
        'initials' => $user['initials'],
    ];

    return $_SESSION['user'];
}

function auth_user(): ?array
{
    auth_start();
    return $_SESSION['user'] ?? null;
}

function auth_check(): bool
{
    return auth_user() !== null;
}

function auth_logout(): void
{
    auth_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/**
 * Gate a page. Redirects to the login screen when not signed in.
 *
 * When auth.sql has not been applied there is nothing to authenticate
 * against, so the app stays open rather than locking everyone out of a
 * working deployment — api/health.php reports which mode is active.
 */
function auth_require(): void
{
    if (!auth_available() || auth_check()) {
        return;
    }
    header('Location: ' . base_url() . 'login.php');
    exit;
}

/** Gate a JSON endpoint. */
function auth_require_api(): void
{
    if (!auth_available() || auth_check()) {
        return;
    }
    json_response(['ok' => false, 'reason' => 'Not signed in.'], 401);
}

/** CSRF token for the login form. */
function csrf_token(): string
{
    auth_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_valid(?string $token): bool
{
    auth_start();
    return !empty($_SESSION['csrf']) && is_string($token)
        && hash_equals($_SESSION['csrf'], $token);
}
