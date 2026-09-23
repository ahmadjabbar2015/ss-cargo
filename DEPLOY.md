# Deploying S&S Cargo Freight OS

Target: **http://ss-cargo.9to5dev.com/** on the same Ubuntu box that runs
`impact.9to5dev.com` (nginx + PHP 8.3-FPM + MySQL/MariaDB).

Requirements: PHP 8.2+ with `pdo_mysql`, and MySQL 5.7+ / MariaDB 10.3+.
The app degrades gracefully — if the database is unreachable it falls back to
its built-in sample data rather than erroring, so a DB problem never gives you
a blank page.

---

## 1. DNS

Point an A record at the server before requesting a certificate:

```
ss-cargo.9to5dev.com.   A   <your server IP>
```

Check it has propagated:

```bash
dig +short ss-cargo.9to5dev.com
```

---

## 2. Upload the files

```bash
sudo mkdir -p /var/www/ss-cargo
sudo chown -R $USER:$USER /var/www/ss-cargo
```

From your Windows machine (run in the project folder):

```bash
rsync -avz --delete \
  --exclude '.git' --exclude '*.bak' --exclude 'node_modules' \
  ./ ubuntu@<server>:/var/www/ss-cargo/
```

No rsync? `scp -r ./* ubuntu@<server>:/var/www/ss-cargo/` works, or zip it and
upload. There is no build step and no Composer dependency — what you see is
what runs.

Then set ownership for PHP-FPM:

```bash
sudo chown -R www-data:www-data /var/www/ss-cargo
sudo find /var/www/ss-cargo -type d -exec chmod 755 {} \;
sudo find /var/www/ss-cargo -type f -exec chmod 644 {} \;
```

Expected layout on the server:

```
/var/www/ss-cargo/
├── index.php            entry point
├── install.php          one-click DB installer — DELETE after step 4
├── .htaccess            Apache only; nginx ignores it (see step 5)
├── api/
│   ├── data.php         JSON master data from MySQL
│   └── health.php       deployment health check
├── assets/css/app.css
├── assets/js/app.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── includes/            config.php, db.php, helpers.php
└── partials/            head.php, shell.php
```

---

## 3. Create the database and user

```bash
sudo mysql
```

```sql
CREATE DATABASE sscargo_freight_os
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'sscargo'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON sscargo_freight_os.* TO 'sscargo'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then put those credentials in `includes/config.php`:

```php
'db' => [
    'enabled' => true,
    'host'    => '127.0.0.1',
    'port'    => 3306,
    'name'    => 'sscargo_freight_os',
    'user'    => 'sscargo',
    'pass'    => 'CHANGE_THIS_PASSWORD',
    'charset' => 'utf8mb4',
],
```

Keep that file out of the repo if you version this:

```bash
sudo chmod 640 /var/www/ss-cargo/includes/config.php
sudo chown www-data:www-data /var/www/ss-cargo/includes/config.php
```

> Prefer environment variables? Every `db` value reads `DB_HOST`, `DB_PORT`,
> `DB_NAME`, `DB_USER`, `DB_PASS` first and falls back to the literals above.
> Set them with `fastcgi_param DB_PASS "…";` in the nginx PHP block, or in a
> PHP-FPM pool file with `env[DB_PASS] = …`.

---

## 4. Load the schema and dummy data

Import from the command line — this is the recommended path:

```bash
cd /var/www/ss-cargo
mysql -u sscargo -p sscargo_freight_os < database/schema.sql
mysql -u sscargo -p sscargo_freight_os < database/seed.sql
```

> **The browser installer is blocked by design.** `install.php` still works,
> but the nginx config in step 5 denies `/install.php` outright, so opening it
> in a browser returns 403. That is deliberate — the installer drops and
> recreates every table, and it must not be reachable on a public host. If you
> specifically want to use it, comment out the `location = /install.php` block,
> reload nginx, run it, then restore the block *and* delete the file.

You should end up with:

```
customers 8 · carriers 9 · trucks 8 · lanes 14 · quotes 8
loads 20 · invoices 16 · settlements 14 · payments 13
```

**Then delete the installer** — it will drop and recreate every table if anyone
else loads it:

```bash
sudo rm /var/www/ss-cargo/install.php
```

Re-running `schema.sql` is destructive by design (it drops each table first),
which is exactly why the installer must not stay on a public host.

---

## 5. nginx server block

`.htaccess` does nothing on nginx, so the protections it provides are
reproduced in a ready-made config file:

**[`ss-cargo.9to5dev.com.conf`](ss-cargo.9to5dev.com.conf)**

Install it:

```bash
cd /var/www/ss-cargo
sudo cp ss-cargo.9to5dev.com.conf \
        /etc/nginx/sites-available/ss-cargo.9to5dev.com
sudo ln -s /etc/nginx/sites-available/ss-cargo.9to5dev.com \
           /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` must print `syntax is ok` / `test is successful` before you reload.
If it fails, **do not reload** — a bad config takes down every site on the box,
`impact.9to5dev.com` included. Fix it first; the running nginx keeps serving
the last good config until you reload.

What the file does, and why:

| Block | Purpose |
|---|---|
| `location ~ ^/(includes\|database\|partials)/` | Blocks the DB password in `config.php` and the raw `.sql` dumps |
| `location ~* \.(sql\|bak\|md\|log\|ini\|txt)$` | Blocks `DEPLOY.md`, `index.html.bak`, `README.txt` if they get uploaded |
| `location ~ /\.(?!well-known)` | Blocks `.git` and `.htaccess`, while letting certbot renew |
| `location = /install.php` | Keeps the destructive installer unreachable |
| `location ~ \.php$` | PHP 8.3-FPM, same socket as your `impact` site |
| `location ~* \.(js\|css\|…)$` | 30-day cache — safe because `index.php` appends `?v=<mtime>` |

Two ordering details that matter, both called out in the file's comments:

- **The deny blocks must stay above `location ~ \.php$`.** nginx tries regex
  locations in written order and stops at the first match. Move the PHP block
  up and `includes/config.php` gets *executed* and `database/seed.sql` gets
  served as plain text.
- **`location = /robots.txt` still works** despite the `txt` deny rule, because
  nginx resolves exact (`=`) matches before any regex.

I have not been able to run `nginx -t` against this file locally — there is no
nginx, Docker daemon, or WSL distro on this machine — so treat the server-side
`nginx -t` in the commands above as the real check, not a formality.

---

## 6. HTTPS

The app ships `<meta name="robots" content="noindex, nofollow">`, but it is
still a login screen on the public internet — serve it over TLS:

```bash
sudo certbot --nginx -d ss-cargo.9to5dev.com
```

Certbot rewrites the block above to listen on 443 and adds the port-80
redirect, exactly as it did for `impact.9to5dev.com`. Re-run `sudo nginx -t`
afterwards.

---

## 7. Verify

```bash
curl -s https://ss-cargo.9to5dev.com/api/health.php
```

A healthy deployment returns:

```json
{
  "ok": true,
  "php": "8.3.x",
  "pdo_mysql": true,
  "db": {
    "connected": true,
    "installed": true,
    "rows": { "customers": 8, "carriers": 9, "loads": 20, "...": "..." }
  }
}
```

Then confirm the hardening actually bites — each of these should return
**403**, not the file:

```bash
for p in includes/config.php database/seed.sql install.php .htaccess; do
  printf '%-24s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://ss-cargo.9to5dev.com/$p)"
done
```

Finally open the site, pick a role, and check the Dashboard renders with
numbers. View source: `window.FREIGHT_OS` should show `"dbConnected": true`.

---

## How the pieces fit

The front end is a single-page app that keeps its working state in the
browser's `localStorage` — that is unchanged from the original prototype, and
it is why "Reset demo data" still works and why two visitors do not see each
other's edits.

What PHP and MySQL add is where the **master data** comes from. On boot,
`index.php` injects `window.FREIGHT_OS`; if `hydrate` is true the app fetches
`api/data.php` and replaces its customers, carriers, trucks, lanes and quotes
with the rows from MySQL *before* deriving loads, invoices and settlements.
Edit a customer's credit limit in the `customers` table and it shows up in the
app on the next hard refresh.

Loads, invoices, settlements and payments are seeded into MySQL too and the
schema models them fully, but the running app still derives those from the
master data in JavaScript rather than reading them back per action. Making
every in-app action write through to MySQL is the natural next step, and the
schema in `database/schema.sql` is already shaped for it — that work would sit
in `api/`, not in the front end.

If `api/data.php` fails for any reason — DB down, wrong password, schema not
installed — the fetch is swallowed and the app boots on its built-in sample
data. The site stays up; only `api/health.php` will tell you something is wrong.

---

## Redeploying

```bash
rsync -avz --delete --exclude '*.bak' --exclude 'includes/config.php' \
  ./ ubuntu@<server>:/var/www/ss-cargo/
sudo chown -R www-data:www-data /var/www/ss-cargo
```

Excluding `includes/config.php` keeps the server's credentials from being
overwritten by your local ones. CSS and JS are cache-busted by file mtime, so
no cache purge is needed.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Blank page, 500 in the error log | PHP error | `sudo tail -50 /var/log/nginx/ss-cargo.9to5dev.com.error.log`; set `'debug' => true` in `includes/config.php` temporarily |
| Page loads, styling missing | assets 404 | Check `root` is `/var/www/ss-cargo` and that `assets/` uploaded |
| `"pdo_mysql": false` | extension missing | `sudo apt install php8.3-mysql && sudo systemctl restart php8.3-fpm` |
| `"connected": false`, "Access denied" | wrong credentials | Re-check the user/password in `includes/config.php` |
| `"connected": false`, "Unknown database" | DB not created | Re-run step 3 |
| `"installed": false` | tables missing | Re-run step 4 |
| `.php` downloads instead of running | FPM not wired | Confirm the socket path: `ls /run/php/` |
| 404 on `/api/health.php` | nested location typo | `sudo nginx -t`, then re-check the `^~ /api/` block |

---

## Notes on what this is

This is a working prototype, not production software. There is **no
authentication** — the login screen is a role picker with no password, so
anyone who reaches the URL is "signed in". If it needs to be non-public, put
HTTP basic auth in front of it:

```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-sscargo yourname
```

and inside the `location / { … }` block:

```nginx
auth_basic "S&S Cargo";
auth_basic_user_file /etc/nginx/.htpasswd-sscargo;
```

All companies, MC/DOT numbers, rates, invoices and payment details in the seed
data are invented. No real payment rails are touched and no card or bank
credentials are stored — the "last four" values are decorative sample strings.
