const { execSync } = require('child_process');
const fs = require('fs');
try {
    const count = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    fs.writeFileSync('git_count_test.txt', count);
} catch (e) {
    fs.writeFileSync('git_count_test.txt', 'error: ' + e.message);
}
