import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, 'debug.log');

function log(msg) {
    const context = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, context);
    console.log(msg);
}

log('Starting debug mode...');

import('./server.js').then(() => {
    log('Server.js imported successfully.');
}).catch(err => {
    log(`IMPORT ERROR: ${err.message}`);
    log(err.stack);
});
