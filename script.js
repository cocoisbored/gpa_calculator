// script.js
const Default_grade = {
    'S': 4.0, 'A': 3.0, 'B': 2.0, 'C': 1.0, 'D': 0.0, 'F': 0.0,
    '秀': 4.0, '優': 3.0, '良': 2.0, '可': 1.0, '不可': 0.0
};

// UI Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const includeSpecialCheck = document.getElementById('includeSpecial');
const excludeFailedCheck = document.getElementById('excludeFailed');
const resultsSection = document.getElementById('resultsSection');

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
includeSpecialCheck.addEventListener('change', reCalculate);
excludeFailedCheck.addEventListener('change', reCalculate);

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
    const groupStats = {};
    let overallTotalGpt = 0.0;
    let overallCreditsEarned = 0.0;
    let overallCreditsAttempted = 0.0;

    const includeSpecial = includeSpecialCheck.checked;
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

                const isSpecial = (groupName === "博物館科目" || groupName === "教職科目");
                const isFailed = (gp === 0.0);

                let attemptedCreditsToAdd = credits;
                if (excludeFailed && isFailed) {
                    attemptedCreditsToAdd = 0.0;
                }

                // 科目群の初期化
                if (!groupStats[groupName]) {
                    groupStats[groupName] = { totalGpt: 0, creditsEarned: 0, creditsAttempted: 0, subjects: [] };
                }

                const group = groupStats[groupName];
                group.totalGpt += gpt;
                group.creditsAttempted += attemptedCreditsToAdd;
                if (gp > 0) group.creditsEarned += credits;

                group.subjects.push({
                    name: subjectName,
                    credits: credits,
                    grade: grade,
                    gp: gp
                });

                // 全体の集計
                if (includeSpecial || !isSpecial) {
                    overallTotalGpt += gpt;
                    overallCreditsAttempted += attemptedCreditsToAdd;
                    if (gp > 0) {
                        overallCreditsEarned += credits;
                    }
                }
            }
        }
    });

    renderResults(studentInfo, overallTotalGpt, overallCreditsEarned, overallCreditsAttempted, groupStats);
}

function calcGpa(gpt, attempted) {
    return attempted > 0 ? (gpt / attempted) : 0.0;
}

function renderResults(studentInfo, totalGpt, creditsEarned, creditsAttempted, groupStats) {
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

    // 科目群別
    const groupGrid = document.getElementById('groupGrid');
    groupGrid.innerHTML = ''; // クリア

    const sortedGroups = Object.keys(groupStats).sort();

    sortedGroups.forEach(groupName => {
        const stats = groupStats[groupName];
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
