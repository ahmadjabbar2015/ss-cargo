<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="<?= e(config('app.description')) ?>">
<meta name="robots" content="noindex, nofollow">
<title><?= e(config('app.title')) ?></title>
<link rel="stylesheet" href="<?= e(asset('assets/css/app.css')) ?>">
<script>
/* Server-rendered runtime config. The app reads this before booting. */
window.FREIGHT_OS = <?= json_encode([
    'name'        => config('app.name'),
    'baseUrl'     => base_url(),
    'apiUrl'      => base_url() . 'api/data.php',
    'hydrate'     => (bool) config('hydrate_from_db') && $dbReady,
    'dbConnected' => $dbReady,
    'authOn'      => $authOn,
    'user'        => $user,
    'logoutUrl'   => base_url() . 'logout.php',
], JSON_UNESCAPED_SLASHES) ?>;
</script>
</head>
