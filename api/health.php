<?php
/**
 * GET api/health.php — quick deployment check.
 * Confirms PHP version, extensions and the database connection.
 */

require __DIR__ . '/../includes/helpers.php';

$pdo       = db();
$installed = db_installed();
$counts    = [];

if ($installed) {
    foreach (['customers', 'carriers', 'trucks', 'lanes', 'quotes', 'loads', 'invoices', 'settlements', 'payments'] as $table) {
        $counts[$table] = (int) $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    }
}

json_response([
    'ok'         => true,
    'app'        => config('app.name'),
    'php'        => PHP_VERSION,
    'pdo_mysql'  => extension_loaded('pdo_mysql'),
    'db' => [
        'enabled'   => (bool) config('db.enabled'),
        'connected' => $pdo !== null,
        'installed' => $installed,
        'name'      => config('db.name'),
        'host'      => config('db.host'),
        'error'     => $pdo === null ? db_error() : null,
        'rows'      => $counts,
    ],
]);
