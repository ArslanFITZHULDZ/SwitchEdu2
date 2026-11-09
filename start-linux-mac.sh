#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo 'Node.js is not installed. Install Node.js 20 or newer and try again.'
  exit 1
fi
platform=$(node -p "process.platform + '-' + process.arch")
if [ ! -f "node_modules/.eduagent-$platform-ready" ]; then
  npm ci
  touch "node_modules/.eduagent-$platform-ready"
fi
npm run dev
