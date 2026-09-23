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

Either import directly:

```bash
cd /var/www/ss-cargo
mysql -u sscargo -p sscargo_freight_os < database/schema.sql
mysql -u sscargo -p sscargo_freight_os < database/seed.sql
```

…or, once nginx is up (step 5), open `http://ss-cargo.9to5dev.com/install.php`
and click the button — it creates the database, applies both files and prints
the row counts.

Either way you should end up with:

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
reproduced below. Create `/etc/nginx/sites-available/ss-cargo.9to5dev.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ss-cargo.9to5dev.com;

    root /var/www/ss-cargo;
    index index.php;

    access_log /var/log/nginx/ss-cargo.9to5dev.com.access.log;
    error_log  /var/log/nginx/ss-cargo.9to5dev.com.error.log;

    client_max_body_size 16M;

    # --- Security hardening ---
    # These regex blocks MUST stay above the `~ \.php$` block below: nginx
    # tries regex locations in the order they appear and stops at the first
    # match, so if the PHP block came first these would never be reached.

    # Never expose app internals or raw SQL over HTTP.
    location ~ ^/(includes|database|partials)/ { deny all; }
    location ~* \.(sql|bak|md|log|ini)$        { deny all; }

    # Hidden files (.htaccess, .git, …) except ACME challenges.
    location ~ /\.(?!well-known) { deny all; }

    # Belt and braces: keep the installer unreachable even if it is still
    # on disk. Remove this line only if you deliberately need to re-run it.
    location = /install.php { deny all; }

    # --- Application ---
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # The app fingerprints its own CSS/JS with ?v=<mtime>, so a long cache is
    # safe — a redeploy changes the query string and busts it automatically.
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Never cache the JSON API.
    location ^~ /api/ {
        add_header Cache-Control "no-store";
        try_files $uri =404;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    location = /favicon.ico { log_not_found off; access_log off; }
    location = /robots.txt  { log_not_found off; access_log off; allow all; }

    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1024;
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/ss-cargo.9to5dev.com \
           /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` must print `syntax is ok` / `test is successful` before you reload.

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
