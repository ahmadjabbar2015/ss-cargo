<?php
/**
 * S&S Cargo Freight OS — application entry point.
 *
 * Drop this folder on any PHP 8.2+ host and it runs. MySQL is optional:
 * when the database is reachable and installed, the app hydrates its
 * master data from it; otherwise it falls back to built-in sample data.
 */

require __DIR__ . '/includes/helpers.php';

if (config('app.debug')) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

$dbReady = db_installed();

partial('head', ['dbReady' => $dbReady]);
?>
<body>

<?php partial('shell'); ?>

<?php if (!$dbReady && config('app.debug')): ?>
<div style="position:fixed;bottom:12px;left:12px;z-index:9999;background:#7a1f1f;color:#fff;font:12px system-ui;padding:8px 12px;border-radius:6px">
  MySQL not connected — running on built-in sample data.
  <a href="<?= e(base_url()) ?>install.php" style="color:#ffd7d7">Run installer</a>
</div>
<?php endif; ?>

<script src="<?= e(asset('assets/js/app.js')) ?>"></script>
</body>
</html>
