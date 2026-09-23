<?php
require __DIR__ . '/includes/auth.php';

auth_start();

if (auth_check()) {
    header('Location: ' . base_url());
    exit;
}

$error = null;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    if (!csrf_valid($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Try again.';
    } elseif (!auth_available()) {
        $error = 'Authentication is not installed. Run database/auth.sql.';
    } else {
        $user = auth_attempt(trim((string) ($_POST['email'] ?? '')), (string) ($_POST['password'] ?? ''));
        if ($user) {
            header('Location: ' . base_url());
            exit;
        }
        $error = 'Wrong email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in — <?= e(config('app.name')) ?></title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
       background:linear-gradient(160deg,#0b1220,#132038 60%,#16305a);
       color:#e8eefb;font:14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .box{width:100%;max-width:380px;background:#101b30;border:1px solid #23375c;border-radius:14px;
       padding:30px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
  h1{margin:0 0 4px;font-size:19px}
  p.sub{margin:0 0 22px;color:#9EBEE6;font-size:13px}
  label{display:block;margin:0 0 6px;font-size:12.5px;color:#9EBEE6}
  input{width:100%;padding:10px 12px;margin-bottom:16px;border-radius:8px;
        border:1px solid #2b4370;background:#0b1424;color:#e8eefb;font:inherit}
  input:focus{outline:none;border-color:#3d7ded;box-shadow:0 0 0 3px rgba(61,125,237,.25)}
  button{width:100%;padding:11px;border:0;border-radius:8px;background:#2f6fdc;color:#fff;
         font:inherit;font-weight:600;cursor:pointer}
  button:hover{background:#3d7ded}
  .err{background:#3a1520;border:1px solid #7a2436;color:#ffc2cd;
       padding:10px 12px;border-radius:8px;margin-bottom:16px;font-size:13px}
  .foot{margin-top:18px;font-size:11.5px;color:#6f8cb5;text-align:center}
</style>
</head>
<body>
  <form class="box" method="post" autocomplete="on">
    <h1>Sign in to Freight OS</h1>
    <p class="sub"><?= e(config('app.name')) ?></p>

    <?php if ($error): ?>
      <div class="err"><?= e($error) ?></div>
    <?php endif; ?>

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autofocus
           autocomplete="username"
           value="<?= e($_POST['email'] ?? '') ?>">

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required
           autocomplete="current-password">

    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <button type="submit">Sign in</button>

    <div class="foot">Authorised users only.</div>
  </form>
</body>
</html>
