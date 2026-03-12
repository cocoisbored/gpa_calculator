const SCRIPT_JS = require('fs').readFileSync('script.js', 'utf8');

const parseCSVMatch = SCRIPT_JS.match(/function parseCSV[\s\S]*?\n\}/);
console.log(parseCSVMatch[0]);

