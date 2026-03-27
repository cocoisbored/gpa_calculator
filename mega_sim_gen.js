const fs = require('fs');
let SCRIPT = fs.readFileSync('script.js', 'utf8');

SCRIPT = SCRIPT.replace(/document\.getElementById.*?;/g, "null;");
SCRIPT = SCRIPT.replace(/const dropZone = null;/g, "const dropZone = {addEventListener: ()=>{}, classList: {add: ()=>{}, remove:()=>{}}};");
SCRIPT = SCRIPT.replace(/const fileInput = null;/g, "const fileInput = {addEventListener: ()=>{}};");

const prefix = `
let includeSpecialCheck = {checked: false, addEventListener:()=>{}};
let excludeFailedCheck = {checked: false, addEventListener:()=>{}};
let takeTeachingCheck = {checked: false, addEventListener:()=>{}};
let takeMuseumCheck = {checked: false, addEventListener:()=>{}};
let enrollmentYearSelect = {value: "2024", addEventListener:()=>{}};
let resultsSection = {innerHTML: '', classList: {remove:()=>{}}, scrollIntoView: ()=>{}};
let requirementsSection = {innerHTML: '', classList: {remove:()=>{}}, scrollIntoView: ()=>{}};
let groupGrid = {innerHTML: ''};

function renderResults() {}
const document = {getElementById: ()=>( {innerHTML: '', appendChild: ()=>{}} ), createElement: ()=>( {className:'', classList:{add: ()=>{}}, appendChild: ()=>{}, innerHTML:''} )};
const localStorage = {getItem:()=>null, setItem:()=>{}};
`;

const reqs = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');

SCRIPT = SCRIPT.replace(/const takeTeachingCheck = null;/g, "");
SCRIPT = SCRIPT.replace(/const takeMuseumCheck = null;/g, "");
SCRIPT = SCRIPT.replace(/const includeSpecialCheck = null;/g, "");
SCRIPT = SCRIPT.replace(/const excludeFailedCheck = null;/g, "");
SCRIPT = SCRIPT.replace(/const enrollmentYearSelect = null;/g, "");
SCRIPT = SCRIPT.replace(/const resultsSection = null;/g, "");
SCRIPT = SCRIPT.replace(/const requirementsSection = null;/g, "");
SCRIPT = SCRIPT.replace(/const groupGrid = null;/g, "");

const run = prefix + reqs + SCRIPT + `
const csvStr = \`
[学生氏名],山田太郎,,,,,,,,,
[学籍番号],123456,,,,,,,,,
[学生所属],工学部 知能情報システム工学科 数理情報工学コース,,,,,,,,,
[学年],3,,,,,,,,,
,,,,,,,,,,
,新入生科目群,,,大学入門ゼミ,,,2,,,S
,専門基礎科目群,,,情報理論,,,2,,,A
,専門科目群,,,アルゴリズム序論,,,2,,,S
\`;

renderRequirements = function(o, g, t, m, s) {
    console.log("studentInfo:", s);
    for (let k in g) {
        console.log(k, "earned:", g[k].creditsEarned);
    }
}
processCSV(csvStr);
`;
fs.writeFileSync('mega_sim.js', run);
