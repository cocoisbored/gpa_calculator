const fs = require('fs');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body><div id="dropZone"></div><input id="fileInput"/><input id="takeTeaching"/><input id="takeMuseum"/><input id="includeSpecial"/><input id="excludeFailed"/><select id="enrollmentYear"><option value="2024">2024</option></select><div id="resultsSection"></div><div id="requirementsSection"></div><div id="overallGpaDisplay"></div><div id="overallStats"></div><div id="groupGrid"></div><div id="studentDetails"></div></body></html>', {
    url: "https://example.org/",
    referrer: "https://example.com/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => { } };

global.document.getElementById('resultsSection').scrollIntoView = function () { };

const reqText = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');
eval(reqText);

const scriptText = fs.readFileSync('script.js', 'utf8').replace(/resultsSection\.scrollIntoView.*?;/g, '');
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

const origRender = renderRequirements;
renderRequirements = function (credits, groupStats, t, m, s) {
    console.log("=== renderRequirements called ===");
    console.log("studentInfo:", s);
    console.log("Groups found:", Object.keys(groupStats));
    for (let k in groupStats) {
        console.log("  " + k + ": " + groupStats[k].creditsEarned + " credits");
    }
    origRender(credits, groupStats, t, m, s);
}

processCSV(dummyCSV);
