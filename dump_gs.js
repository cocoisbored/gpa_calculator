const fs = require('fs');
let s = fs.readFileSync('test_sim4.js', 'utf8');
s = s.replace(`function renderRequirements() {}`, `function renderRequirements(credits, gStats) { console.log(Object.keys(gStats)); }`);
fs.writeFileSync('test_sim5.js', s);
