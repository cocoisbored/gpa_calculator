const fs = require('fs');

const reqText = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');

const scriptText = fs.readFileSync('script.js', 'utf8');

const setup = `
const Default_grade = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
let includeSpecialCheck = {checked: false};
let excludeFailedCheck = {checked: false};
let takeTeachingCheck = {checked: false};
let takeMuseumCheck = {checked: false};
let enrollmentYearSelect = {value: "2024"};
let resultsSection = {innerHTML: ''};
let requirementsSection = {innerHTML: ''};
function renderResults() {}
function renderRequirements(credits, groupStats, t, m, s) {
    console.log("studentInfo:", s);
    console.log("Groups found:", Object.keys(groupStats));
    for (let k in groupStats) {
        console.log("  "+k+": "+groupStats[k].creditsEarned+" credits");
    }
}
`;

const processCSVStr = scriptText.substring(scriptText.indexOf('function processCSV'), scriptText.indexOf('function renderResults'));
const parseCSVStr = scriptText.substring(scriptText.indexOf('function parseCSV'), scriptText.lastIndexOf('}') + 1);

const dummyCSV = `
[学生氏名],山田太郎,,,,,,,,,
[学籍番号],123456,,,,,,,,,
[学生所属],工学部 知能情報システム工学科 数理情報工学コース,,,,,,,,,
[学年],3,,,,,,,,,
,,,,,,,,,,
,新入生科目群,,,大学入門ゼミ,,,2,,,S
,グローバル教養科目群,,,哲学の基礎,,,2,,,A
,専門基礎科目群,,,数理統計学,,,2,,,B
,専門科目群,,,アルゴリズム序論,,,2,,,S
,機械システム工学科 専門科目,,,力学Ⅰ,,,2,,,S
`;

const execute = setup + "\n" + reqText + "\n" + processCSVStr + "\n" + parseCSVStr + "\nprocessCSV(`" + dummyCSV + "`);\n";
fs.writeFileSync('test_wrapper.js', execute);
