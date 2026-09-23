<?php
require __DIR__ . '/includes/auth.php';
auth_logout();
header('Location: ' . base_url() . 'login.php');
exit;
