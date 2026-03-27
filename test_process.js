const fs = require('fs');

const reqText = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');
eval(reqText);

const scriptText = fs.readFileSync('script.js', 'utf8')
    // mock DOM dependencies
    .replace(/document\.getElementById.*?;/g, '({ checked: false, value: "2024", classList: {add:()=>{}, remove:()=>{}}, innerHTML: "", style: {}, scrollIntoView: ()=>{} });')
    .replace('document.createElement', '() => ({ className: "", classList: {add:()=>{}, remove:()=>{}}, innerHTML: "", appendChild: ()=>{} })');

eval(scriptText);

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

// Wrap renderRequirements to inspect its args
const originalRenderReq = renderRequirements;
renderRequirements = function (credits, groupStats, t, m, s) {
    console.log("studentInfo:", s);
    console.log("Groups found:", Object.keys(groupStats));
    for (let k in groupStats) {
        console.log(`  ${k}: ${groupStats[k].creditsEarned} credits`);
    }
    // Call original to ensure no error
    // originalRenderReq(credits, groupStats, t, m, s);
};

processCSV(dummyCSV);
// Wait, the DOM mocking might fail inside processCSV if it tries to set resultsSection.innerHTML etc.
