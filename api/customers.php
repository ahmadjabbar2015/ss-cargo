<?php
/**
 * POST api/customers.php — create a customer in MySQL.
 *
 * Body (JSON): { name, contact, email, phone, terms, credit, method, last4 }
 * Returns the stored row, including the generated id.
 *
 * The front end calls this after adding the customer to its own state, so a
 * database failure degrades to a session-only customer rather than losing the
 * user's input.
 */

require __DIR__ . '/../includes/auth.php';

auth_require_api();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response(['ok' => false, 'reason' => 'POST required.'], 405);
}

$pdo = db();
if (!$pdo || !db_installed()) {
    json_response(['ok' => false, 'reason' => db_error() ?? 'Database unavailable.']);
}

$input = json_decode(file_get_contents('php://input') ?: '[]', true);
if (!is_array($input)) {
    json_response(['ok' => false, 'reason' => 'Malformed JSON.'], 400);
}

$name = trim((string) ($input['name'] ?? ''));
if ($name === '') {
    json_response(['ok' => false, 'reason' => 'Customer name is required.'], 422);
}

$terms  = (int) ($input['terms'] ?? 30);
$credit = (float) ($input['credit'] ?? 0);
$method = (string) ($input['method'] ?? 'ACH');
$last4  = preg_replace('/\D/', '', (string) ($input['last4'] ?? ''));

if (!in_array($method, ['ACH', 'Wire', 'Check', 'Card', 'Cash'], true)) {
    $method = 'ACH';
}
if ($terms < 0 || $terms > 180) {
    $terms = 30;
}
if ($credit < 0) {
    $credit = 0;
}

try {
    // Ids follow the seeded C-1xx sequence; take the next one above the max.
    $max = (int) $pdo->query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(id, 3) AS UNSIGNED)), 100) FROM customers WHERE id LIKE 'C-%'"
    )->fetchColumn();
    $id = 'C-' . ($max + 1);

    $stmt = $pdo->prepare(
        'INSERT INTO customers
            (id, name, contact, email, phone, terms_days, credit_limit,
             pay_method, pay_last4, customer_since)
         VALUES
            (:id, :name, :contact, :email, :phone, :terms, :credit,
             :method, :last4, :since)'
    );
    $stmt->execute([
        ':id'      => $id,
        ':name'    => $name,
        ':contact' => trim((string) ($input['contact'] ?? '')) ?: null,
        ':email'   => trim((string) ($input['email'] ?? '')) ?: null,
        ':phone'   => trim((string) ($input['phone'] ?? '')) ?: null,
        ':terms'   => $terms,
        ':credit'  => $credit,
        ':method'  => $method,
        ':last4'   => $last4 !== '' ? substr($last4, -4) : null,
        ':since'   => date('Y'),
    ]);

    json_response([
        'ok'       => true,
        'customer' => [
            'id'      => $id,
            'name'    => $name,
            'contact' => $input['contact'] ?? '',
            'email'   => $input['email'] ?? '',
            'phone'   => $input['phone'] ?? '',
            'terms'   => $terms,
            'credit'  => $credit,
            'method'  => ['type' => $method, 'last4' => $last4 !== '' ? substr($last4, -4) : '—'],
            'since'   => date('Y'),
        ],
    ]);
} catch (PDOException $e) {
    json_response([
        'ok'     => false,
        'reason' => config('app.debug') ? $e->getMessage() : 'Insert failed.',
    ]);
}
