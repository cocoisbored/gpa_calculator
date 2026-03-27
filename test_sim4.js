
const document = {
    getElementById: () => ({ innerHTML: '' }),
    createElement: () => ({ className: '', style: {}, classList: {add:()=>{}, remove:()=>{}}, innerHTML: '', appendChild: ()=>{} })
};


const Default_grade = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
let includeSpecialCheck = {checked: false};
let excludeFailedCheck = {checked: false};
let takeTeachingCheck = {checked: false};
let takeMuseumCheck = {checked: false};
let enrollmentYearSelect = {value: "2024"};
let resultsSection = {innerHTML: '', classList: {remove:()=>{}}, scrollIntoView: ()=>{}};
let requirementsSection = {innerHTML: '', classList: {remove:()=>{}}, scrollIntoView: ()=>{}};
function renderResults(s, ogpt, oce, oca, ogc, gs) {
    console.log("Earned:", oce);
    console.log("GS length:", Object.keys(gs).length);
    console.log("Stats:", JSON.stringify(gs, null, 2));
}
function renderRequirements() {}

function processCSV(text) {
    const data = parseCSV(text);

    // 状態初期化
    let studentInfo = { name: '不明', id: '不明', affiliation: '不明', grade: '不明', department: '不明', course: 'base' };
    const groupStats = {};    // 卒業要件の科目群
    const teachingStats = {}; // 教職科目群
    const museumStats = {};   // 博物館（学芸員）科目群

    let overallTotalGpt = 0.0;
    let overallCreditsEarned = 0.0;
    let overallCreditsAttempted = 0.0;
    const overallGradeCounts = { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

    let teachingTotalCredits = 0.0;
    let museumTotalCredits = 0.0;

    const takeTeaching = takeTeachingCheck.checked;
    const takeMuseum = takeMuseumCheck.checked;
    const includeSpecial = includeSpecialCheck.checked;
    const excludeFailed = excludeFailedCheck.checked;

    // パス1: メタデータ(学生情報)のみを先に抽出する
    data.forEach(row => {
        if (!row || row.length === 0) return;
        if (row.includes("[学生氏名]")) studentInfo.name = row[row.indexOf("[学生氏名]") + 1] || '不明';
        if (row.includes("[学籍番号 ]")) studentInfo.id = row[row.indexOf("[学籍番号 ]") + 1] || '不明';
        if (row.includes("[学籍番号]")) studentInfo.id = row[row.indexOf("[学籍番号]") + 1] || '不明';
        if (row.includes("[学生所属]")) studentInfo.affiliation = row[row.indexOf("[学生所属]") + 1] || '不明';
        if (row.includes("[学年]")) studentInfo.grade = row[row.indexOf("[学年]") + 1] || '不明';
        if (row.includes("[学年 ]")) studentInfo.grade = row[row.indexOf("[学年 ]") + 1] || '不明';
    });

    // 所属とコースを判定する
    if (studentInfo.affiliation && studentInfo.affiliation !== "不明") {
        const depts = ["機械システム工学科", "知能情報システム工学科", "応用化学科", "生命工学科", "生体医用システム工学科", "化学物理工学科"];
        for (let d of depts) {
            if (studentInfo.affiliation.includes(d)) {
                studentInfo.department = d;
                break;
            }
        }

        if (studentInfo.department !== "不明" && typeof REQUIREMENTS !== 'undefined') {
            const yearData = REQUIREMENTS[enrollmentYearSelect.value] || REQUIREMENTS["2024"];
            if (yearData && yearData[studentInfo.department]) {
                const courses = Object.keys(yearData[studentInfo.department]).filter(k => !['base', 'teaching', 'museum', 'graduation'].includes(k));
                for (let c of courses) {
                    if (studentInfo.affiliation.includes(c)) {
                        studentInfo.course = c;
                        break;
                    }
                }
            }
        }
    }

    // パス2: 成績データを解析する
    data.forEach(row => {
        if (!row || row.length === 0) return;

        // 行の長さが十分にある場合に成績行として解析 (Pythonスクリプトに合わせて index 4, 6, 9, 1 を参照)
        if (row.length >= 10) {
            const subjectName = (row[4] || "").trim();
            const groupNameInput = (row[1] || "").trim();
            const groupName = groupNameInput === "" ? "その他/未分類" : groupNameInput;
            const creditsStr = (row[6] || "").trim();
            const grade = (row[9] || "").trim().toUpperCase();

            const credits = parseFloat(creditsStr);
            if (isNaN(credits)) return; // 単位が数値ではない行はヘッダ等として弾く

            if (Default_grade.hasOwnProperty(grade)) {
                const gp = Default_grade[grade];
                const gpt = credits * gp;

                const isTeaching = groupName.includes("教職");
                const isMuseum = groupName.includes("博物館") || groupName.includes("学芸員");

                // 他学科の科目かどうか判定
                const allDepts = ["機械システム工学科", "知能情報システム工学科", "応用化学科", "生命工学科", "生体医用システム工学科", "化学物理工学科"];
                let isOtherDept = false;
                for (let d of allDepts) {
                    if (d !== studentInfo.department && groupNameInput.includes(d)) {
                        isOtherDept = true;
                        break;
                    }
                }

                // CSVの科目群名表記揺れを吸収して、新しい大区分名に正規化
                let normalizedGroupName = groupName;
                if (!isTeaching && !isMuseum) {
                    if (isOtherDept) normalizedGroupName = "自由選択科目群 (他学科等)";
                    else if (groupName.includes("新入生")) normalizedGroupName = "新入生科目群";
                    else if (groupName.includes("グローバル教養")) normalizedGroupName = "グローバル教養科目群";
                    else if (groupName.includes("グローバル言語") || groupName.includes("言語文化")) normalizedGroupName = "グローバル言語文化科目群";
                    else if (groupName.includes("グローバル展開")) normalizedGroupName = "グローバル展開科目群";
                    else if (groupName.includes("スポーツ") || groupName.includes("健康")) normalizedGroupName = "スポーツ健康科学科目群";
                    else if (groupName.includes("専門基礎")) normalizedGroupName = "専門基礎科目群";
                    else if (groupName.includes("専門")) normalizedGroupName = "専門科目群";
                    else normalizedGroupName = groupName + (groupName.endsWith("群") ? "" : "群");
                }

                let targetGroupStats = groupStats;
                let activeGroupName = normalizedGroupName;

                const isFailed = (gp === 0.0);
                const attemptedCreditsToAdd = (excludeFailed && isFailed) ? 0.0 : credits;

                if (isTeaching) {
                    if (!takeTeaching) return;
                    targetGroupStats = teachingStats;
                    activeGroupName = "教職科目群"; // 教職科目は常にこの名称で集計
                    if (gp > 0) teachingTotalCredits += credits;
                } else if (isMuseum) {
                    if (!takeMuseum) return;
                    targetGroupStats = museumStats;
                    if (gp > 0) museumTotalCredits += credits;
                }

                // 科目群の初期化
                if (!targetGroupStats[activeGroupName]) {
                    targetGroupStats[activeGroupName] = { totalGpt: 0, creditsEarned: 0, creditsAttempted: 0, gradeCounts: { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 }, subjects: [] };
                }

                const group = targetGroupStats[activeGroupName];
                group.totalGpt += gpt;
                group.creditsAttempted += attemptedCreditsToAdd;
                if (gp > 0) group.creditsEarned += credits;
                if (group.gradeCounts.hasOwnProperty(grade)) {
                    group.gradeCounts[grade]++;
                }

                group.subjects.push({
                    name: subjectName,
                    credits: credits,
                    grade: grade,
                    gp: gp
                });

                // 卒業要件としての集計（教職・博物館以外、あるいは「含める」設定がONの場合）
                if (includeSpecial || (!isTeaching && !isMuseum)) {
                    overallTotalGpt += gpt;
                    overallCreditsAttempted += attemptedCreditsToAdd;
                    if (gp > 0) {
                        overallCreditsEarned += credits;
                    }
                    if (overallGradeCounts.hasOwnProperty(grade)) {
                        overallGradeCounts[grade]++;
                    }
                }
            }
        }
    });

    renderResults(studentInfo, overallTotalGpt, overallCreditsEarned, overallCreditsAttempted, overallGradeCounts, groupStats, teachingStats, museumStats);
    renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits, studentInfo);
}

function calcGpa(gpt, attempted) {
    return attempted > 0 ? (gpt / attempted) : 0.0;
}


function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1];

        if (char === '"' && inQuote && nextChar === '"') {
            currentCell += '"';
            i++;
        } else if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            currentRow.push(currentCell.replace(/^"(.*)"$/, '$1').trim());
            currentCell = '';
        } else if ((char === '\n' || char === '\r') && !inQuote) {
            if (char === '\r' && nextChar === '\n') { i++; } // skip \n
            currentRow.push(currentCell.replace(/^"(.*)"$/, '$1').trim());
            if (currentRow.join('').trim() !== '') {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    // 最終行の処理
    if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell.replace(/^"(.*)"$/, '$1').trim());
        rows.push(currentRow);
    }
    return rows;
}

function processCSV(text) {
    const data = parseCSV(text);

    // 状態初期化
    let studentInfo = { name: '不明', id: '不明', affiliation: '不明', grade: '不明', department: '不明', course: 'base' };
    const groupStats = {};    // 卒業要件の科目群
    const teachingStats = {}; // 教職科目群
    const museumStats = {};   // 博物館（学芸員）科目群

    let overallTotalGpt = 0.0;
    let overallCreditsEarned = 0.0;
    let overallCreditsAttempted = 0.0;
    const overallGradeCounts = { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

    let teachingTotalCredits = 0.0;
    let museumTotalCredits = 0.0;

    const takeTeaching = takeTeachingCheck.checked;
    const takeMuseum = takeMuseumCheck.checked;
    const includeSpecial = includeSpecialCheck.checked;
    const excludeFailed = excludeFailedCheck.checked;

    // パス1: メタデータ(学生情報)のみを先に抽出する
    data.forEach(row => {
        if (!row || row.length === 0) return;
        if (row.includes("[学生氏名]")) studentInfo.name = row[row.indexOf("[学生氏名]") + 1] || '不明';
        if (row.includes("[学籍番号 ]")) studentInfo.id = row[row.indexOf("[学籍番号 ]") + 1] || '不明';
        if (row.includes("[学籍番号]")) studentInfo.id = row[row.indexOf("[学籍番号]") + 1] || '不明';
        if (row.includes("[学生所属]")) studentInfo.affiliation = row[row.indexOf("[学生所属]") + 1] || '不明';
        if (row.includes("[学年]")) studentInfo.grade = row[row.indexOf("[学年]") + 1] || '不明';
        if (row.includes("[学年 ]")) studentInfo.grade = row[row.indexOf("[学年 ]") + 1] || '不明';
    });

    // 所属とコースを判定する
    if (studentInfo.affiliation && studentInfo.affiliation !== "不明") {
        const depts = ["機械システム工学科", "知能情報システム工学科", "応用化学科", "生命工学科", "生体医用システム工学科", "化学物理工学科"];
        for (let d of depts) {
            if (studentInfo.affiliation.includes(d)) {
                studentInfo.department = d;
                break;
            }
        }

        if (studentInfo.department !== "不明" && typeof REQUIREMENTS !== 'undefined') {
            const yearData = REQUIREMENTS[enrollmentYearSelect.value] || REQUIREMENTS["2024"];
            if (yearData && yearData[studentInfo.department]) {
                const courses = Object.keys(yearData[studentInfo.department]).filter(k => !['base', 'teaching', 'museum', 'graduation'].includes(k));
                for (let c of courses) {
                    if (studentInfo.affiliation.includes(c)) {
                        studentInfo.course = c;
                        break;
                    }
                }
            }
        }
    }

    // パス2: 成績データを解析する
    data.forEach(row => {
        if (!row || row.length === 0) return;

        // 行の長さが十分にある場合に成績行として解析 (Pythonスクリプトに合わせて index 4, 6, 9, 1 を参照)
        if (row.length >= 10) {
            const subjectName = (row[4] || "").trim();
            const groupNameInput = (row[1] || "").trim();
            const groupName = groupNameInput === "" ? "その他/未分類" : groupNameInput;
            const creditsStr = (row[6] || "").trim();
            const grade = (row[9] || "").trim().toUpperCase();

            const credits = parseFloat(creditsStr);
            if (isNaN(credits)) return; // 単位が数値ではない行はヘッダ等として弾く

            if (Default_grade.hasOwnProperty(grade)) {
                const gp = Default_grade[grade];
                const gpt = credits * gp;

                const isTeaching = groupName.includes("教職");
                const isMuseum = groupName.includes("博物館") || groupName.includes("学芸員");

                // 他学科の科目かどうか判定
                const allDepts = ["機械システム工学科", "知能情報システム工学科", "応用化学科", "生命工学科", "生体医用システム工学科", "化学物理工学科"];
                let isOtherDept = false;
                for (let d of allDepts) {
                    if (d !== studentInfo.department && groupNameInput.includes(d)) {
                        isOtherDept = true;
                        break;
                    }
                }

                // CSVの科目群名表記揺れを吸収して、新しい大区分名に正規化
                let normalizedGroupName = groupName;
                if (!isTeaching && !isMuseum) {
                    if (isOtherDept) normalizedGroupName = "自由選択科目群 (他学科等)";
                    else if (groupName.includes("新入生")) normalizedGroupName = "新入生科目群";
                    else if (groupName.includes("グローバル教養")) normalizedGroupName = "グローバル教養科目群";
                    else if (groupName.includes("グローバル言語") || groupName.includes("言語文化")) normalizedGroupName = "グローバル言語文化科目群";
                    else if (groupName.includes("グローバル展開")) normalizedGroupName = "グローバル展開科目群";
                    else if (groupName.includes("スポーツ") || groupName.includes("健康")) normalizedGroupName = "スポーツ健康科学科目群";
                    else if (groupName.includes("専門基礎")) normalizedGroupName = "専門基礎科目群";
                    else if (groupName.includes("専門")) normalizedGroupName = "専門科目群";
                    else normalizedGroupName = groupName + (groupName.endsWith("群") ? "" : "群");
                }

                let targetGroupStats = groupStats;
                let activeGroupName = normalizedGroupName;

                const isFailed = (gp === 0.0);
                const attemptedCreditsToAdd = (excludeFailed && isFailed) ? 0.0 : credits;

                if (isTeaching) {
                    if (!takeTeaching) return;
                    targetGroupStats = teachingStats;
                    activeGroupName = "教職科目群"; // 教職科目は常にこの名称で集計
                    if (gp > 0) teachingTotalCredits += credits;
                } else if (isMuseum) {
                    if (!takeMuseum) return;
                    targetGroupStats = museumStats;
                    if (gp > 0) museumTotalCredits += credits;
                }

                // 科目群の初期化
                if (!targetGroupStats[activeGroupName]) {
                    targetGroupStats[activeGroupName] = { totalGpt: 0, creditsEarned: 0, creditsAttempted: 0, gradeCounts: { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 }, subjects: [] };
                }

                const group = targetGroupStats[activeGroupName];
                group.totalGpt += gpt;
                group.creditsAttempted += attemptedCreditsToAdd;
                if (gp > 0) group.creditsEarned += credits;
                if (group.gradeCounts.hasOwnProperty(grade)) {
                    group.gradeCounts[grade]++;
                }

                group.subjects.push({
                    name: subjectName,
                    credits: credits,
                    grade: grade,
                    gp: gp
                });

                // 卒業要件としての集計（教職・博物館以外、あるいは「含める」設定がONの場合）
                if (includeSpecial || (!isTeaching && !isMuseum)) {
                    overallTotalGpt += gpt;
                    overallCreditsAttempted += attemptedCreditsToAdd;
                    if (gp > 0) {
                        overallCreditsEarned += credits;
                    }
                    if (overallGradeCounts.hasOwnProperty(grade)) {
                        overallGradeCounts[grade]++;
                    }
                }
            }
        }
    });

    renderResults(studentInfo, overallTotalGpt, overallCreditsEarned, overallCreditsAttempted, overallGradeCounts, groupStats, teachingStats, museumStats);
    renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits, studentInfo);
}

function calcGpa(gpt, attempted) {
    return attempted > 0 ? (gpt / attempted) : 0.0;
}

function renderResults(studentInfo, totalGpt, creditsEarned, creditsAttempted, overallGradeCounts, groupStats, teachingStats, museumStats) {
    // 学生情報
    document.getElementById('studentDetails').innerHTML = `
        <div class="label">氏名</div><div class="val">${studentInfo.name || 'ー'}</div>
        <div class="label">学籍番号</div><div class="val">${studentInfo.id || 'ー'}</div>
        <div class="label">所属</div><div class="val">${studentInfo.affiliation || 'ー'}</div>
        <div class="label">学年</div><div class="val">${studentInfo.grade || 'ー'}</div>
    `;

    // 総合GPA
    const overallGpa = calcGpa(totalGpt, creditsAttempted);
    document.getElementById('overallGpaDisplay').textContent = overallGpa.toFixed(3);

    document.getElementById('overallStats').innerHTML = `
        <div class="stat-item">
            <span class="label">取得単位</span>
            <span class="val">${creditsEarned}</span>
        </div>
        <div class="stat-item">
            <span class="label">GPA対象</span>
            <span class="val">${creditsAttempted}</span>
        </div>
        <div class="stat-item">
            <span class="label">総GPT</span>
            <span class="val">${totalGpt.toFixed(2)}</span>
        </div>
    `;

    // 評価内訳の追加（全体の総合の下）
    const gradeCountsHtml = `
        <div class="grade-counts" style="margin-top: 15px; grid-column: 1 / -1; display: flex; justify-content: space-between; gap: 10px; background: rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 8px;">
            <div style="text-align:center; flex: 1;"><span style="font-size:0.8rem; color:#aaa;">S</span><br><strong style="font-size:1.2rem;">${overallGradeCounts['S']}</strong></div>
            <div style="text-align:center; flex: 1;"><span style="font-size:0.8rem; color:#aaa;">A</span><br><strong style="font-size:1.2rem;">${overallGradeCounts['A']}</strong></div>
            <div style="text-align:center; flex: 1;"><span style="font-size:0.8rem; color:#aaa;">B</span><br><strong style="font-size:1.2rem;">${overallGradeCounts['B']}</strong></div>
            <div style="text-align:center; flex: 1;"><span style="font-size:0.8rem; color:#aaa;">C</span><br><strong style="font-size:1.2rem;">${overallGradeCounts['C']}</strong></div>
            <div style="text-align:center; flex: 1;"><span style="font-size:0.8rem; color:#aaa;">D</span><br><strong style="font-size:1.2rem;">${overallGradeCounts['D']}</strong></div>
        </div>
    `;
    document.getElementById('overallStats').innerHTML += gradeCountsHtml;

    // 科目群別を大区分ごとに表示
    const groupGrid = document.getElementById('groupGrid');
    groupGrid.innerHTML = ''; // クリア

    // カードを生成するヘルパー関数
    const createCardsHtml = (statsObj) => {
        let html = '<div class="group-grid" style="margin-bottom: 30px;">';
        const sortedGroups = Object.keys(statsObj).sort();

        if (sortedGroups.length === 0) {
            return '<div style="color: #888; margin-bottom: 20px;">この区分の科目データはありません</div>';
        }

        sortedGroups.forEach(gName => {
            const stats = statsObj[gName];
            const gpa = calcGpa(stats.totalGpt, stats.creditsAttempted);

            let subjectsHtml = '<div class="subject-list">';
            stats.subjects.forEach(sub => {
                subjectsHtml += `
                    <div class="s-item">
                        <span class="s-name">${sub.name}</span>
                        <span class="s-meta">${sub.credits}単位 | <span class="s-grade">${sub.grade}</span></span>
                    </div>
                `;
            });
            subjectsHtml += '</div>';

            html += `
            <div class="group-card">
                <h3>${gName}</h3>
                <div class="group-stats">
                    <div class="g-stat">
                        <span class="label">取得</span>
                        <span class="val">${stats.creditsEarned}</span>
                    </div>
                    <div class="g-stat">
                        <span class="label">GPA対象</span>
                        <span class="val">${stats.creditsAttempted}</span>
                    </div>
                    <div class="g-gpa">
                        <span class="label">GPA</span>
                        <span class="val">${gpa.toFixed(3)}</span>
                    </div>
                </div>
                <div class="group-grade-counts" style="margin: 15px 0 10px 0; display: flex; justify-content: space-between; gap: 8px; background: rgba(0,0,0,0.2); padding: 12px 15px; border-radius: 6px; font-size: 0.9em;">
                    <span style="display:flex; flex-direction:column; align-items:center; flex: 1;"><span style="font-size:0.7em; color:#aaa;">S</span><strong>${stats.gradeCounts['S']}</strong></span>
                    <span style="display:flex; flex-direction:column; align-items:center; flex: 1;"><span style="font-size:0.7em; color:#aaa;">A</span><strong>${stats.gradeCounts['A']}</strong></span>
                    <span style="display:flex; flex-direction:column; align-items:center; flex: 1;"><span style="font-size:0.7em; color:#aaa;">B</span><strong>${stats.gradeCounts['B']}</strong></span>
                    <span style="display:flex; flex-direction:column; align-items:center; flex: 1;"><span style="font-size:0.7em; color:#aaa;">C</span><strong>${stats.gradeCounts['C']}</strong></span>
                    <span style="display:flex; flex-direction:column; align-items:center; flex: 1;"><span style="font-size:0.7em; color:#aaa;">D</span><strong>${stats.gradeCounts['D']}</strong></span>
                </div>
                <details class="subjects-details">
                    <summary>科目詳細を表示</summary>
                    ${subjectsHtml}
                </details>
            </div>
            `;
        });
        html += '</div>';
        return html;
    };

    // 卒業要件科目の描画
    let sectionsHtml = `
        <h3 style="color: #388e3c; border-bottom: 2px solid #388e3c; padding-bottom: 5px; margin-bottom: 15px;">📚 卒業要件科目群</h3>
        ${createCardsHtml(groupStats)}
    `;

    // 教職科目の描画
    if (document.getElementById('takeTeaching').checked) {
        sectionsHtml += `
            <h3 style="color: #f57c00; border-bottom: 2px solid #f57c00; padding-bottom: 5px; margin-bottom: 15px;">👨‍🏫 教職科目</h3>
            ${createCardsHtml(teachingStats)}
        `;
    }

    // 博物館科目の描画
    if (document.getElementById('takeMuseum').checked) {
        sectionsHtml += `
            <h3 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 5px; margin-bottom: 15px;">🏛️ 博物館（学芸員）科目</h3>
            ${createCardsHtml(museumStats)}
        `;
    }

    groupGrid.innerHTML = sectionsHtml;

    // スムーズに結果欄を表示
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------
// 進級・卒業要件の判定ロジック
// ----------------------------------------
function renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits, studentInfo) {
    const year = enrollmentYearSelect.value;
    const department = studentInfo.department;
    const course = studentInfo.course;

    requirementsSection.innerHTML = '';

    // REQUIREMENTS_DATA.js から該当の設定を探す
    if (typeof REQUIREMENTS !== 'undefined' && REQUIREMENTS[year] && REQUIREMENTS[year][department]) {
        const reqDataBranch = REQUIREMENTS[year][department];
        let courseText = course === "base" ? "" : ` / ${course}`;
        let html = `<p style="margin-bottom: 20px;"><strong>[${year}年度入学 ${department}${courseText}]</strong> の履修案内に基づく判定です。</p>`;

        // 表示する判定ステージを収集する
        let stagesToRender = [];

        let graduationRules = reqDataBranch["base"]?.graduation;
        // 指定コースがあり、固有の卒業要件が存在する場合は上書き
        if (course !== "base" && reqDataBranch[course] && reqDataBranch[course].graduation) {
            graduationRules = reqDataBranch[course].graduation;
        }

        if (graduationRules) {
            stagesToRender.push({ ...graduationRules, color: '#388e3c' }); // Green for graduation
        }

        if (takeTeachingCheck.checked && reqDataBranch.teaching) {
            stagesToRender.push({ ...reqDataBranch.teaching, color: '#f57c00' }); // Orange for teaching
        }

        if (takeMuseumCheck.checked && reqDataBranch.museum) {
            stagesToRender.push({ ...reqDataBranch.museum, color: '#10B981' }); // Teal for museum
        }

        // 自由単位計算のための第一パス (graduation要件のみ)
        let totalUsedForRequirements = 0;
        if (graduationRules && graduationRules.conditions) {
            graduationRules.conditions.forEach(c => {
                if (c.type === 'category') {
                    let cVal = 0;
                    if (groupStats[c.target]) {
                        if (c.validSubjects) {
                            groupStats[c.target].subjects.forEach(sub => {
                                if (sub.gp > 0 && c.validSubjects.some(t => sub.name.includes(t))) {
                                    cVal += sub.credits;
                                }
                            });
                        } else {
                            cVal = groupStats[c.target].creditsEarned;
                        }
                    }
                    totalUsedForRequirements += Math.min(c.required, cVal);
                }
            });
        }

        html += `<div style="display: flex; flex-direction: column; gap: 20px;">`;

        stagesToRender.forEach(ruleObj => {
            html += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: ${ruleObj.color}; margin-top: 0; margin-bottom: 10px; font-size: 1.1em; border-bottom: 1px solid ${ruleObj.color}; padding-bottom: 4px;">${ruleObj.title}</h3>
                <ul style="list-style-type: none; padding: 0; margin: 0;">
            `;

            ruleObj.conditions.forEach(cond => {
                let currentVal = 0;

                // 「総単位数」の判定
                if (cond.type === 'total') {
                    currentVal = overallCreditsEarned;
                }
                // 自由選択単位
                else if (cond.type === 'free_elective') {
                    currentVal = Math.max(0, overallCreditsEarned - totalUsedForRequirements);
                }
                // 「特定カテゴリ（科目群）」の判定
                else if (cond.type === 'category') {
                    if (groupStats[cond.target]) {
                        if (cond.validSubjects) {
                            groupStats[cond.target].subjects.forEach(sub => {
                                if (sub.gp > 0 && cond.validSubjects.some(t => sub.name.includes(t))) {
                                    currentVal += sub.credits;
                                }
                            });
                        } else {
                            currentVal = groupStats[cond.target].creditsEarned;
                        }
                    }
                }
                // 特定要件の判定 (教職 / 博物館など、別で集計した特殊単位)
                else if (cond.type === 'special_total') {
                    if (cond.target === 'teaching') {
                        currentVal = teachingTotalCredits;
                    } else if (cond.target === 'museum') {
                        currentVal = museumTotalCredits;
                    }
                }
                // 特定の科目名リストを指定した判定（必修科目や特定の小区分など）
                else if (cond.type === 'subject') {
                    let targetList = Array.isArray(cond.target) ? cond.target : [cond.target];
                    Object.values(groupStats).forEach(group => {
                        group.subjects.forEach(sub => {
                            if (sub.gp > 0 && targetList.some(t => sub.name === t || sub.name.startsWith(t) || sub.name.includes(t))) {
                                currentVal += sub.credits;
                            }
                        });
                    });
                }

                // 目標達成ステータスの計算
                let diff = cond.required - currentVal;
                let statusIcon = "";
                let statusText = "";

                if (diff <= 0) {
                    statusIcon = "✅";
                    statusText = `<span style="color: #4caf50; font-weight: bold;">達成！</span>`;
                } else {
                    statusIcon = "⚠️";
                    statusText = `<span style="color: #f44336; font-weight: bold;">あと ${diff.toFixed(1)} 単位 不足</span>`;
                }

                // リストとして描画
                html += `
                    <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(128,128,128,0.3); padding: 8px 0; font-size: 0.95em;">
                        <span>${cond.label}</span>
                        <span>${currentVal.toFixed(1)} / ${cond.required.toFixed(1)} 単位 <span style="display: inline-block; width: 120px; text-align: right; margin-left: 10px;">(${statusIcon} ${statusText})</span></span>
                    </li>
                `;
            });

            html += `</ul></div>`;
        });

        html += `</div>`;
        requirementsSection.innerHTML = html;

    } else {
        requirementsSection.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                ⚠️ 選択された年度(${year})・学科(${department})の要件データはまだ登録されていません。<br>
                <code>REQUIREMENTS_DATA.js</code> を編集して、履修案内のルールを追加してください。
            </div>
        `;
    }
}


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

processCSV(dummyCSV);
