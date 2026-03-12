const fs = require('fs');

// Create a dummy CSV as data
const dummyData = [
  ["", "[学生所属]", "工学部 知能情報システム工学科 数理情報工学コース"],
  ["","新入生科目", "", "", "力学Ⅰ", "", "2", "", "", "S"]
];

let studentInfo = { name: '不明', id: '不明', affiliation: '不明', grade: '不明', department: '不明', course: 'base' };

dummyData.forEach(row => {
    if (!row || row.length === 0) return;
    if (row.includes("[学生氏名]")) studentInfo.name = row[row.indexOf("[学生氏名]") + 1] || '不明';
    if (row.includes("[学籍番号 ]")) studentInfo.id = row[row.indexOf("[学籍番号 ]") + 1] || '不明';
    if (row.includes("[学籍番号]")) studentInfo.id = row[row.indexOf("[学籍番号]") + 1] || '不明';
    if (row.includes("[学生所属]")) studentInfo.affiliation = row[row.indexOf("[学生所属]") + 1] || '不明';
});
console.log("Affiliation:", studentInfo.affiliation);

if (studentInfo.affiliation && studentInfo.affiliation !== "不明") {
    const depts = ["機械システム工学科", "知能情報システム工学科", "応用化学科", "生命工学科", "生体医用システム工学科", "化学物理工学科"];
    for (let d of depts) {
        if (studentInfo.affiliation.includes(d)) {
            studentInfo.department = d;
            break;
        }
    }
}
console.log("Department:", studentInfo.department);

