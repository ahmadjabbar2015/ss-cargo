<?php
/**
 * One-click database installer.
 *
 * Creates the database if it does not exist, then runs schema.sql and
 * seed.sql. Re-running it is safe — the schema drops every table first.
 *
 * DELETE THIS FILE after deploying to anything public.
 */

require __DIR__ . '/includes/helpers.php';

$cfg     = config('db');
$run     = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
$log     = [];
$failed  = false;

/** Split a .sql file into statements, ignoring -- comments. */
function sql_statements(string $file): array
{
    $sql = file_get_contents($file);
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    return array_values(array_filter(array_map('trim', explode(";\n", $sql)), static function ($s) {
        return $s !== '' && $s !== ';';
    }));
}

if ($run) {
    try {
        $pdo = db_server();
        $log[] = 'Connected to MySQL ' . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . ' at ' . $cfg['host'] . ':' . $cfg['port'] . '.';

        $pdo->exec(sprintf(
            'CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
            str_replace('`', '', $cfg['name'])
        ));
        $log[] = 'Database `' . $cfg['name'] . '` ready.';

        $pdo->exec('USE `' . str_replace('`', '', $cfg['name']) . '`');

        foreach (['schema.sql' => 'Schema', 'seed.sql' => 'Seed data'] as $file => $label) {
            $path = __DIR__ . '/database/' . $file;
            if (!is_file($path)) {
                throw new RuntimeException("Missing database/$file");
            }
            $statements = sql_statements($path);
            foreach ($statements as $statement) {
                $pdo->exec($statement);
            }
            $log[] = $label . ' applied (' . count($statements) . ' statements).';
        }

        $rows = [];
        foreach (['customers', 'carriers', 'trucks', 'lanes', 'quotes', 'loads', 'invoices', 'settlements', 'payments'] as $t) {
            $rows[$t] = (int) $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        }
        $log[] = 'Row counts: ' . implode(', ', array_map(
            static fn($t, $n) => "$t $n",
            array_keys($rows),
            $rows
        )) . '.';
        $log[] = 'Done. Open the app, then delete install.php.';
    } catch (Throwable $e) {
        $failed = true;
        $log[]  = 'FAILED: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Install — <?= e(config('app.name')) ?></title>
<style>
  :root{color-scheme:light dark;--bg:#0d1526;--card:#132038;--ink:#e8eefb;--ink2:#9EBEE6;--line:#23375c;--brand:#2f6fdc}
  *{box-sizing:border-box}
  body{margin:0;background:#0d1526;color:#e8eefb;font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
       display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .card{background:#132038;border:1px solid #23375c;border-radius:14px;max-width:640px;width:100%;padding:28px}
  h1{margin:0 0 4px;font-size:19px}
  p.sub{margin:0 0 20px;color:#9EBEE6;font-size:13px}
  dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:0 0 20px;font-size:13px}
  dt{color:#9EBEE6}
  dd{margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
  button{background:#2f6fdc;color:#fff;border:0;border-radius:8px;padding:11px 18px;font:inherit;font-weight:600;cursor:pointer}
  button:hover{background:#3d7ded}
  pre{background:#0b1220;border:1px solid #23375c;border-radius:8px;padding:14px;overflow:auto;
      font-size:12.5px;white-space:pre-wrap;margin:0 0 16px}
  .ok{color:#7fd6a0}.bad{color:#ff9a9a}
  a{color:#7fb0ff}
</style>
</head>
<body>
<div class="card">
  <h1>Install the demo database</h1>
  <p class="sub"><?= e(config('app.name')) ?> — creates the schema and loads the dummy data.</p>

  <dl>
    <dt>PHP</dt><dd><?= e(PHP_VERSION) ?></dd>
    <dt>pdo_mysql</dt><dd class="<?= extension_loaded('pdo_mysql') ? 'ok' : 'bad' ?>"><?= extension_loaded('pdo_mysql') ? 'loaded' : 'MISSING' ?></dd>
    <dt>Host</dt><dd><?= e($cfg['host'] . ':' . $cfg['port']) ?></dd>
    <dt>Database</dt><dd><?= e($cfg['name']) ?></dd>
    <dt>User</dt><dd><?= e($cfg['user']) ?></dd>
  </dl>

<?php if ($log): ?>
  <pre class="<?= $failed ? 'bad' : 'ok' ?>"><?= e(implode("\n", $log)) ?></pre>
<?php endif; ?>

<?php if (!$run || $failed): ?>
  <form method="post"><button type="submit">Create database and load data</button></form>
<?php else: ?>
  <p><a href="<?= e(base_url()) ?>">Open the app →</a> &nbsp;·&nbsp; <a href="<?= e(base_url()) ?>api/health.php">Health check</a></p>
<?php endif; ?>

  <p class="sub" style="margin:18px 0 0">Credentials come from <code>includes/config.php</code> or the matching
  <code>DB_*</code> environment variables. Delete this file once installed.</p>
</div>
</body>
</html>
