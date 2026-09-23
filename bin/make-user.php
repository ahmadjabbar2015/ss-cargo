<?php
/**
 * Create or update an app user from the command line.
 *
 *   php bin/make-user.php <email> "<name>" "<role>" [password]
 *
 * Prints the generated password when you do not supply one.
 */

require __DIR__ . '/../includes/helpers.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$email = $argv[1] ?? null;
$name  = $argv[2] ?? null;
$role  = $argv[3] ?? 'Dispatcher';
$pass  = $argv[4] ?? null;

if (!$email || !$name) {
    fwrite(STDERR, "Usage: php bin/make-user.php <email> \"<name>\" \"<role>\" [password]\n");
    fwrite(STDERR, "Roles: Operations manager, Dispatcher, Billing, Carrier sales, Accounting\n");
    exit(1);
}

$pdo = db();
if (!$pdo) {
    fwrite(STDERR, "Cannot connect to the database: " . (db_error() ?? 'unknown') . "\n");
    exit(1);
}

try {
    $pdo->query('SELECT password_hash FROM users LIMIT 1');
} catch (PDOException $e) {
    fwrite(STDERR, "The users table has no password_hash column. Run database/auth.sql first.\n");
    exit(1);
}

$generated = false;
if (!$pass) {
    $pass = bin2hex(random_bytes(6));
    $generated = true;
}

$parts    = preg_split('/\s+/', trim($name));
$initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));

$max = (int) $pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(id, 3) AS UNSIGNED)), 0) FROM users WHERE id LIKE 'U-%'")->fetchColumn();
$id  = sprintf('U-%02d', $max + 1);

$stmt = $pdo->prepare(
    'INSERT INTO users (id, name, email, password_hash, role, initials, active)
     VALUES (:id, :name, :email, :hash, :role, :initials, 1)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), password_hash = VALUES(password_hash),
       role = VALUES(role), initials = VALUES(initials), active = 1'
);
$stmt->execute([
    ':id'       => $id,
    ':name'     => $name,
    ':email'    => $email,
    ':hash'     => password_hash($pass, PASSWORD_BCRYPT),
    ':role'     => $role,
    ':initials' => $initials,
]);

echo "User ready.\n";
echo "  email:    $email\n";
echo "  role:     $role\n";
if ($generated) {
    echo "  password: $pass   <-- save this, it is not recoverable\n";
} else {
    echo "  password: (as supplied)\n";
}
