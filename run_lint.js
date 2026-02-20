const { execSync } = require('child_process');
const fs = require('fs');
let out = '';
try {
    out = execSync('npx eslint app/vendedor --format=json').toString();
} catch (e) {
    out = e.stdout ? e.stdout.toString() : e.message;
}
fs.writeFileSync('lint_result.json', out, 'utf8');
