#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const [action, file] = process.argv.slice(2);
if (!['backup', 'restore'].includes(action) || !file || !process.env.DATABASE_URL) {
  console.error('Usage: DATABASE_URL=local-postgres-url node src/scripts/cms-backup.mjs <backup|restore> <file.dump>');
  console.error('Media is stored beside the dump as <file.dump>.media/. Only loopback PostgreSQL URLs are accepted.');
  process.exit(2);
}

let connection;
try { connection = new URL(process.env.DATABASE_URL); } catch { console.error('DATABASE_URL is invalid.'); process.exit(2); }
if (connection.protocol !== 'postgresql:' && connection.protocol !== 'postgres:') { console.error('DATABASE_URL must use PostgreSQL.'); process.exit(2); }
if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(connection.hostname)) { console.error('Refusing a non-local database host.'); process.exit(2); }
if (action === 'restore' && !existsSync(file)) { console.error('Backup file does not exist.'); process.exit(2); }

const dbName = decodeURIComponent(connection.pathname.slice(1));
if (!dbName || !connection.username) { console.error('DATABASE_URL must include a database and username.'); process.exit(2); }
const mediaDirectory = path.resolve('uploads/content');
const mediaBackupDirectory = path.resolve(`${file}.media`);
if (action === 'restore' && (!existsSync(file) || !existsSync(mediaBackupDirectory))) { console.error('Database dump and its media directory are both required for restore.'); process.exit(2); }
const commonArgs = ['--host', connection.hostname.replace(/^\[|\]$/g, ''), '--port', connection.port || '5432', '--username', decodeURIComponent(connection.username), '--no-password'];
const tables = ['content_pages', 'content_revisions', 'content_slug_redirects', 'content_audit_log'];
const args = action === 'backup'
  ? [...commonArgs, '--dbname', dbName, '--format=custom', '--no-owner', '--no-acl', '--file', file, ...tables.flatMap((table) => ['--table', table])]
  : [...commonArgs, '--dbname', dbName, '--clean', '--if-exists', '--no-owner', '--no-acl', '--exit-on-error', '--single-transaction', file];
if (action === 'backup') process.umask(0o077);
const result = spawnSync(action === 'backup' ? 'pg_dump' : 'pg_restore', args, { stdio: 'inherit', env: { ...process.env, PGPASSWORD: decodeURIComponent(connection.password), PGSSLMODE: 'disable' } });
if (result.error) { console.error(`${action === 'backup' ? 'pg_dump' : 'pg_restore'} is unavailable.`); process.exit(1); }
if (result.status !== 0) process.exit(result.status ?? 1);
if (action === 'backup') {
  chmodSync(file, 0o600);
  await mkdir(mediaBackupDirectory, { recursive: true, mode: 0o700 });
  for (const name of await readdir(mediaBackupDirectory)) if (/^[a-f0-9]{36}\.(?:png|jpg)$/.test(name)) await unlink(path.join(mediaBackupDirectory, name));
  if (existsSync(mediaDirectory)) {
    for (const name of await readdir(mediaDirectory)) {
      if (/^[a-f0-9]{36}\.(?:png|jpg)$/.test(name)) await copyFile(path.join(mediaDirectory, name), path.join(mediaBackupDirectory, name));
    }
  }
  for (const name of await readdir(mediaBackupDirectory)) chmodSync(path.join(mediaBackupDirectory, name), 0o600);
} else {
  await mkdir(mediaDirectory, { recursive: true, mode: 0o700 });
  for (const name of await readdir(mediaDirectory)) if (/^[a-f0-9]{36}\.(?:png|jpg)$/.test(name)) await unlink(path.join(mediaDirectory, name));
  for (const name of await readdir(mediaBackupDirectory)) {
    if (!/^[a-f0-9]{36}\.(?:png|jpg)$/.test(name)) continue;
    await copyFile(path.join(mediaBackupDirectory, name), path.join(mediaDirectory, name));
    chmodSync(path.join(mediaDirectory, name), 0o600);
  }
}
console.info(`CMS ${action} completed: ${file}`);
