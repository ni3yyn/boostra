import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const apiDirectory = resolve('src/app/api');
const excludedApiDirectory = resolve('.api-firebase-excluded');

if (existsSync(excludedApiDirectory)) {
  rmSync(excludedApiDirectory, { recursive: true, force: true });
}

const apiWasMoved = existsSync(apiDirectory);

if (apiWasMoved) {
  renameSync(apiDirectory, excludedApiDirectory);
}

try {
  const nextCommand = resolve('node_modules/next/dist/bin/next');
  const result = spawnSync(process.execPath, [nextCommand, 'build', '--webpack'], {
    stdio: 'inherit',
    env: { ...process.env, FIREBASE_BUILD: '1' },
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  if (existsSync(apiDirectory)) {
    rmSync(apiDirectory, { recursive: true, force: true });
  }
  if (apiWasMoved && existsSync(excludedApiDirectory)) {
    renameSync(excludedApiDirectory, apiDirectory);
  }
}
