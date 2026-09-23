<?php
/**
 * GET api/data.php
 *
 * Returns the master data (customers, carriers, trucks, quotes, lanes) from
 * MySQL, shaped exactly like the constants the front end already uses, so the
 * app can hydrate from the database without any change to its logic.
 *
 * Responds 200 with {ok:false} rather than an error status when the database
 * is unavailable — the caller is expected to fall back to its sample data.
 */

require __DIR__ . '/../includes/helpers.php';

$pdo = db();
if (!$pdo || !db_installed()) {
    json_response([
        'ok'     => false,
        'reason' => db_error() ?? 'Schema not installed. Run install.php.',
    ]);
}

try {
    $customers = array_map(static function (array $r): array {
        return [
            'id'      => $r['id'],
            'name'    => $r['name'],
            'contact' => $r['contact'],
            'email'   => $r['email'],
            'phone'   => $r['phone'],
            'terms'   => (int) $r['terms_days'],
            'credit'  => (float) $r['credit_limit'],
            'method'  => ['type' => $r['pay_method'], 'last4' => $r['pay_last4'] ?: '—'],
            'since'   => $r['customer_since'],
        ];
    }, $pdo->query('SELECT * FROM customers ORDER BY id')->fetchAll());

    $carriers = array_map(static function (array $r): array {
        return [
            'id'        => $r['id'],
            'name'      => $r['name'],
            'mc'        => $r['mc_number'],
            'dot'       => $r['dot_number'],
            'base'      => $r['base_city'],
            'equip'     => $r['equipment'] ? explode(',', $r['equipment']) : [],
            'insExp'    => $r['insurance_exp'],
            'factoring' => $r['factoring'],
            'quickPay'  => (bool) $r['quick_pay'],
            'rating'    => (float) $r['rating'],
            'onTime'    => (float) $r['on_time_pct'],
            'hauled'    => (int) $r['loads_hauled'],
            'status'    => $r['status'],
            'note'      => $r['note'],
        ];
    }, $pdo->query('SELECT * FROM carriers ORDER BY id')->fetchAll());

    $trucks = array_map(static function (array $r): array {
        return [
            'id'      => $r['id'],
            'unit'    => $r['unit'],
            'driver'  => $r['driver'],
            'phone'   => $r['phone'],
            'carrier' => $r['carrier_id'],
            'status'  => $r['status'],
            'loc'     => $r['location'],
        ];
    }, $pdo->query('SELECT * FROM trucks ORDER BY id')->fetchAll());

    $quotes = array_map(static function (array $r): array {
        return [
            'id'     => $r['id'],
            'cust'   => $r['customer_id'],
            'orig'   => $r['origin'],
            'dest'   => $r['destination'],
            'equip'  => $r['equipment'],
            'miles'  => (int) $r['miles'],
            'weight' => (int) $r['weight_lb'],
            'ready'  => $r['ready_date'],
            'target' => (float) $r['target_rate'],
            'status' => $r['status'],
            'recv'   => $r['received'],
            'notes'  => $r['notes'],
        ];
    }, $pdo->query('SELECT * FROM quotes ORDER BY id DESC')->fetchAll());

    $lanes = array_map(static function (array $r): array {
        return [
            $r['origin'],
            $r['destination'],
            (int) $r['miles'],
            $r['equipment'],
            (int) $r['weight_lb'],
            $r['commodity'],
        ];
    }, $pdo->query('SELECT * FROM lanes ORDER BY id')->fetchAll());

    json_response([
        'ok'        => true,
        'source'    => 'mysql',
        'server'    => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
        'customers' => $customers,
        'carriers'  => $carriers,
        'trucks'    => $trucks,
        'quotes'    => $quotes,
        'lanes'     => $lanes,
    ]);
} catch (PDOException $e) {
    json_response([
        'ok'     => false,
        'reason' => config('app.debug') ? $e->getMessage() : 'Query failed.',
    ]);
}
