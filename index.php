<?php
/**
 * S&S Cargo Freight OS — application entry point.
 */

require __DIR__ . '/includes/auth.php';

if (config('app.debug')) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

// Redirects to login.php when auth.sql is installed and nobody is signed in.
auth_require();

$dbReady   = db_installed();
$authOn    = auth_available();
$user      = auth_user();

partial('head', ['dbReady' => $dbReady, 'authOn' => $authOn, 'user' => $user]);
?>
<body>

<?php partial('shell'); ?>

<script src="<?= e(asset('assets/js/app.js')) ?>"></script>
</body>
</html>
