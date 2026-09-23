<?php
/** View helpers. */

require_once __DIR__ . '/db.php';

/** Escape for HTML output. */
function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Asset URL with a cache-busting query string taken from the file's mtime,
 * so a redeploy never serves a stale CSS or JS out of the browser cache.
 */
function asset(string $path): string
{
    $path = ltrim($path, '/');
    $file = dirname(__DIR__) . '/' . $path;
    $version = is_file($file) ? filemtime($file) : time();
    return base_url() . $path . '?v=' . $version;
}

/** Base URL of the app, works in a subfolder or at a domain root. */
function base_url(): string
{
    $dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
    $dir = rtrim($dir, '/');
    return $dir . '/';
}

/** Render a partial. */
function partial(string $name, array $data = []): void
{
    extract($data, EXTR_SKIP);
    require dirname(__DIR__) . '/partials/' . $name . '.php';
}

/** Send a JSON response and stop. */
function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
