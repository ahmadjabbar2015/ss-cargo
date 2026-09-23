<?php
/**
 * S&S Cargo Freight OS — application configuration.
 * Everything a deployment needs to change lives in this one file.
 */

return [
    'app' => [
        'name'        => 'S&S Cargo Freight OS',
        'title'       => 'S&S Cargo Freight OS',
        'description' => 'S&S Cargo Freight OS — freight brokerage and dispatch operations app (prototype).',
        'env'         => getenv('APP_ENV') ?: 'production',
        'debug'       => filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOLEAN),
    ],

    /**
     * MySQL. Defaults match a stock WAMP64 install (root, no password).
     * On a shared host, fill these in from the control panel.
     * Environment variables win, so the same code deploys anywhere.
     */
    'db' => [
        'enabled'  => filter_var(getenv('DB_ENABLED') ?: 'true', FILTER_VALIDATE_BOOLEAN),
        'host'     => getenv('DB_HOST') ?: '127.0.0.1',
        'port'     => (int) (getenv('DB_PORT') ?: 3306),
        'name'     => getenv('DB_NAME') ?: 'sscargo_freight_os',
        'user'     => getenv('DB_USER') ?: 'sscargo',
        'pass'     => getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'StrongPasswordHere123$',
        'charset'  => 'utf8mb4',
    ],

    /**
     * When true, the front end hydrates its master data (customers, carriers,
     * trucks, quotes) from MySQL via api/data.php. When the database is
     * unreachable the app silently falls back to its built-in sample data,
     * so a broken DB never produces a blank page.
     */
    'hydrate_from_db' => true,
];
