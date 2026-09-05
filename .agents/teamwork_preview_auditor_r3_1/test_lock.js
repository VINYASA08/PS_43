const path = require('path');
const { Lockfile } = require('a:/Development/Antigravity/SIH26043/web/node_modules/next/dist/build/lockfile');

try {
  const lockPath = path.join('a:/Development/Antigravity/SIH26043/web/.next', 'lock');
  console.log('Testing lock on:', lockPath);
  const lock = Lockfile.tryAcquire(lockPath);
  console.log('Acquired lock:', !!lock);
  if (lock) {
    lock.unlockSync();
    console.log('Unlocked');
  }
} catch (e) {
  console.error('Error:', e);
}
