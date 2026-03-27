const fs = require('fs');
const code = fs.readFileSync('script.js', 'utf8');

const parseCSVStr = code.match(/function parseCSV[\s\S]*?\n\}/)[0];
eval(parseCSVStr);

const dummyCSV = `
[学生氏名],山田太郎,,,,,,,,,
[学籍番号],123456,,,,,,,,,
[学生所属],工学部 知能情報システム工学科 数理情報工学コース,,,,,,,,,
[学年],3,,,,,,,,,
,,,,,,,,,,
,新入生科目群,,,大学入門ゼミ,,,2,,,S
`;

console.log(parseCSV(dummyCSV.trim()));
