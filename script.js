// script.js
const Default_grade = {
    'S': 4.0, 'A': 3.0, 'B': 2.0, 'C': 1.0, 'D': 0.0, 'F': 0.0,
    '秀': 4.0, '優': 3.0, '良': 2.0, '可': 1.0, '不可': 0.0
};

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const takeTeachingCheck = document.getElementById('takeTeaching');
const takeMuseumCheck = document.getElementById('takeMuseum');
const excludeFailedCheck = document.getElementById('excludeFailed');
const enrollmentYearSelect = document.getElementById('enrollmentYear');
const departmentSelect = document.getElementById('department');
const courseSelect = document.getElementById('courseSelect');
const resultsSection = document.getElementById('resultsSection');
const requirementsSection = document.getElementById('requirementsSection');

let currentFileText = null;

// Event Listeners for Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// 再計算トリガー
takeTeachingCheck.addEventListener('change', reCalculate);
takeMuseumCheck.addEventListener('change', reCalculate);
excludeFailedCheck.addEventListener('change', reCalculate);
enrollmentYearSelect.addEventListener('change', reCalculate);
departmentSelect.addEventListener('change', reCalculate);
courseSelect.addEventListener('change', reCalculate);

function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert("CSVファイルを選択してください。");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        currentFileText = e.target.result;
        processCSV(currentFileText);
    };
    reader.readAsText(file, 'utf-8');
}

function reCalculate() {
    if (currentFileText) {
        processCSV(currentFileText);
    }
}

// 簡易CSVパーサー（カンマ区切り、クオートの基本的な対応）
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
    const studentInfo = {};
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
    const excludeFailed = excludeFailedCheck.checked;

    data.forEach(row => {
        if (!row || row.length === 0) return;

        // メタデータ抽出
        if (row.includes("[学生氏名]")) studentInfo.name = row[row.indexOf("[学生氏名]") + 1] || '不明';
        if (row.includes("[学籍番号 ]")) studentInfo.id = row[row.indexOf("[学籍番号 ]") + 1] || '不明';
        if (row.includes("[学籍番号]")) studentInfo.id = row[row.indexOf("[学籍番号]") + 1] || '不明';
        if (row.includes("[学生所属]")) studentInfo.affiliation = row[row.indexOf("[学生所属]") + 1] || '不明';
        if (row.includes("[学年]")) studentInfo.grade = row[row.indexOf("[学年]") + 1] || '不明';
        if (row.includes("[学年 ]")) studentInfo.grade = row[row.indexOf("[学年 ]") + 1] || '不明';

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

                let targetGroupStats = groupStats;

                if (isTeaching) {
                    if (!takeTeaching) return;
                    targetGroupStats = teachingStats;
                    if (gp > 0) teachingTotalCredits += credits;
                } else if (isMuseum) {
                    if (!takeMuseum) return;
                    targetGroupStats = museumStats;
                    if (gp > 0) museumTotalCredits += credits;
                }

                // 科目群の初期化
                if (!targetGroupStats[groupName]) {
                    targetGroupStats[groupName] = { totalGpt: 0, creditsEarned: 0, creditsAttempted: 0, gradeCounts: { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 }, subjects: [] };
                }

                const group = targetGroupStats[groupName];
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

                // 卒業要件としての集計（教職・博物館以外）
                if (!isTeaching && !isMuseum) {
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
    renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits);
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
        <div class="grade-counts" style="margin-top: 15px; grid-column: 1 / -1; display: flex; justify-content: space-around; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
            <div style="text-align:center;"><span style="font-size:0.8rem; color:#aaa;">S</span><br><strong style="font-size:1.1rem;">${overallGradeCounts['S']}</strong></div>
            <div style="text-align:center;"><span style="font-size:0.8rem; color:#aaa;">A</span><br><strong style="font-size:1.1rem;">${overallGradeCounts['A']}</strong></div>
            <div style="text-align:center;"><span style="font-size:0.8rem; color:#aaa;">B</span><br><strong style="font-size:1.1rem;">${overallGradeCounts['B']}</strong></div>
            <div style="text-align:center;"><span style="font-size:0.8rem; color:#aaa;">C</span><br><strong style="font-size:1.1rem;">${overallGradeCounts['C']}</strong></div>
            <div style="text-align:center;"><span style="font-size:0.8rem; color:#aaa;">D</span><br><strong style="font-size:1.1rem;">${overallGradeCounts['D']}</strong></div>
        </div>
    `;
    document.getElementById('overallStats').innerHTML += gradeCountsHtml;

    // 科目群別を統合して表示 (UI上は全ての群をカードで並べる)
    const combinedStats = { ...groupStats, ...teachingStats, ...museumStats };
    const groupGrid = document.getElementById('groupGrid');
    groupGrid.innerHTML = ''; // クリア

    const sortedGroups = Object.keys(combinedStats).sort();

    sortedGroups.forEach(groupName => {
        const stats = combinedStats[groupName];
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

        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <h3>${groupName}</h3>
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
            <div class="group-grade-counts" style="margin: 15px 0 10px 0; display: flex; justify-content: space-around; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; font-size: 0.9em;">
                <span style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7em; color:#aaa;">S</span><strong>${stats.gradeCounts['S']}</strong></span>
                <span style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7em; color:#aaa;">A</span><strong>${stats.gradeCounts['A']}</strong></span>
                <span style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7em; color:#aaa;">B</span><strong>${stats.gradeCounts['B']}</strong></span>
                <span style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7em; color:#aaa;">C</span><strong>${stats.gradeCounts['C']}</strong></span>
                <span style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.7em; color:#aaa;">D</span><strong>${stats.gradeCounts['D']}</strong></span>
            </div>
            <details class="subjects-details">
                <summary>科目詳細を表示</summary>
                ${subjectsHtml}
            </details>
        `;
        groupGrid.appendChild(card);
    });

    // スムーズに結果欄を表示
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------
// 進級・卒業要件の判定ロジック
// ----------------------------------------
function renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits) {
    const year = enrollmentYearSelect.value;
    const department = departmentSelect.value;
    const course = courseSelect.value;

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

        html += `<div style="display: flex; flex-direction: column; gap: 20px;">`;

        stagesToRender.forEach(ruleObj => {
            html += `
            <div style="border: 2px solid ${ruleObj.color}; border-radius: 8px; padding: 15px; background: rgba(255,255,255,0.02);">
                <h3 style="color: ${ruleObj.color}; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid ${ruleObj.color}44; padding-bottom: 5px;">${ruleObj.title}</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
            `;

            ruleObj.conditions.forEach(cond => {
                let currentVal = 0;

                // 「総単位数」の判定
                if (cond.type === 'total') {
                    currentVal = overallCreditsEarned;
                }
                // 「特定カテゴリ（科目群）」の判定
                else if (cond.type === 'category') {
                    if (groupStats[cond.target]) {
                        currentVal = groupStats[cond.target].creditsEarned;
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

                // 目標達成ステータスの計算
                let diff = cond.required - currentVal;
                let statusIcon = "";
                let statusText = "";
                let barPct = Math.min(100, Math.max(0, (currentVal / cond.required) * 100));

                if (diff <= 0) {
                    statusIcon = "✅";
                    statusText = `<span style="color: #4caf50; font-weight: bold;">達成！</span>`;
                } else {
                    statusIcon = "⚠️";
                    statusText = `<span style="color: #f44336; font-weight: bold;">あと ${diff.toFixed(1)} 単位 不足</span>`;
                }

                // バーを描画
                html += `
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 4px;">
                            <span>${cond.label}</span>
                            <span>${currentVal.toFixed(1)} / ${cond.required.toFixed(1)} 単位 (${statusIcon} ${statusText})</span>
                        </div>
                        <div style="width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                            <div style="width: ${barPct}%; height: 100%; background: ${ruleObj.color};"></div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
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
