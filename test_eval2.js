const fs = require('fs');
global.takeTeachingCheck = { checked: false };
global.takeMuseumCheck = { checked: false };
global.includeSpecialCheck = { checked: false };
global.excludeFailedCheck = { checked: false };
global.enrollmentYearSelect = { value: "2023" };
global.resultsSection = { innerHTML: '' };
global.requirementsSection = { innerHTML: '' };

const REQUIREMENTS_JS = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');
eval(REQUIREMENTS_JS);

const SCRIPT_JS = fs.readFileSync('script.js', 'utf8')
    .replace('document.getElementById', '() => ({})'); // prevent document errors
eval(SCRIPT_JS);

const dummyCSV = `
[学生氏名],山田太郎
[学籍番号],123456
[学生所属],工学部 知能情報システム工学科 数理情報工学コース
[学年],3

,,,,,
,新入生科目群,,,大学入門ゼミ,,,2,,,S
,グローバル教養科目群,,,哲学の基礎,,,2,,,A
,専門基礎科目群,,,数理統計学,,,2,,,B
,専門科目群,,,アルゴリズム序論,,,2,,,S
,機械システム工学科 専門科目,,,力学Ⅰ,,,2,,,S
`;

global.parseCSV = function(text) {
    return text.trim().split('\n').map(l => l.split(','));
};
global.Default_grade = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };

global.renderRequirements = function(credits, groupStats) {
    console.log(JSON.stringify(groupStats, null, 2));
}

handleCSV(dummyCSV);
