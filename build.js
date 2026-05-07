// build.js — run with: node build.js
// Reads .env and writes config.js for browser consumption
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found. Copy .env.example and fill in your values.');
    process.exit(1);
}

const env = Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=').map(s => s.trim()))
);

const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = env;
if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.error('Error: YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID must be set in .env');
    process.exit(1);
}

fs.writeFileSync(
    path.join(__dirname, 'config.js'),
    `window.__CONFIG__ = ${JSON.stringify({ YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID })};\n`
);

console.log('config.js generated.');
