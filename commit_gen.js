const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'commit_count.txt');
const targetCommits = 505; // A bit over 500 to be safe

function getCommitCount() {
    try {
        const count = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
        return parseInt(count, 10);
    } catch (e) {
        console.error("Error getting commit count:", e.message);
        return 0;
    }
}

function createCommit(index) {
    const timestamp = new Date().toISOString();
    const content = `Commit #${index} at ${timestamp}\n`;
    fs.appendFileSync(targetFile, content);
    execSync('git add commit_count.txt');
    execSync(`git commit -m "chore: increment commit count [${index}]"`, { stdio: 'ignore' });
}

let currentCount = getCommitCount();
console.log(`Current commit count: ${currentCount}`);

if (currentCount < targetCommits) {
    const needed = targetCommits - currentCount;
    console.log(`Generating ${needed} commits...`);
    fs.writeFileSync(targetFile, `Start generation at ${new Date().toISOString()}\n`);
    for (let i = 1; i <= needed; i++) {
        try {
            createCommit(currentCount + i);
            if (i % 50 === 0) {
                console.log(`Generated ${i}/${needed} commits...`);
            }
        } catch (err) {
            console.error(`Failed at commit ${i}:`, err.message);
            break;
        }
    }
    console.log("Done!");
    console.log(`Final commit count: ${getCommitCount()}`);
} else {
    console.log("Already have 500+ commits.");
}
