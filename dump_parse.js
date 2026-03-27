const fs = require('fs');
eval(fs.readFileSync('script.js', 'utf8').replace(/document\.getElementById.*?;/g, 'null;').replace(/window\.localStorage = .*/, ''));

const dummyCSV = `
[学生氏名],山田太郎,,,,,,,,,
[学籍番号],123456,,,,,,,,,
[学生所属],工学部 知能情報システム工学科 数理情報工学コース,,,,,,,,,
[学年],3,,,,,,,,,
,,,,,,,,,,
,新入生科目群,,,大学入門ゼミ,,,2,,,S
`;

console.log(parseCSV(dummyCSV));
