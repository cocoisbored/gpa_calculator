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
const includeSpecialCheck = document.getElementById('includeSpecial');
const excludeFailedCheck = document.getElementById('excludeFailed');
const enrollmentYearSelect = document.getElementById('enrollmentYear');
const resultsSection = document.getElementById('resultsSection');
const requirementsSection = document.getElementById('requirementsSection');
const departmentSelectPanel = document.getElementById('departmentSelectPanel');
const departmentSelect = document.getElementById('departmentSelect');
const courseSelect = document.getElementById('courseSelect');

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

// 設定の保存
function saveSettings() {
    localStorage.setItem('calc_year', enrollmentYearSelect.value);
    localStorage.setItem('calc_teaching', takeTeachingCheck.checked);
    localStorage.setItem('calc_museum', takeMuseumCheck.checked);
    localStorage.setItem('calc_include_special', includeSpecialCheck.checked);
    localStorage.setItem('calc_exclude', excludeFailedCheck.checked);
}

// 設定の読み込み
function loadSettings() {
    if (localStorage.getItem('calc_year')) enrollmentYearSelect.value = localStorage.getItem('calc_year');
    if (localStorage.getItem('calc_teaching') !== null) takeTeachingCheck.checked = localStorage.getItem('calc_teaching') === 'true';
    if (localStorage.getItem('calc_museum') !== null) takeMuseumCheck.checked = localStorage.getItem('calc_museum') === 'true';
    if (localStorage.getItem('calc_include_special') !== null) includeSpecialCheck.checked = localStorage.getItem('calc_include_special') === 'true';
    if (localStorage.getItem('calc_exclude') !== null) excludeFailedCheck.checked = localStorage.getItem('calc_exclude') === 'true';
}

// 初期化時に保存された設定を適用
loadSettings();

// 再計算および設定保存の共通トリガー
const handleChange = () => {
    saveSettings();
    reCalculate();
};

enrollmentYearSelect.addEventListener('change', handleChange);

takeTeachingCheck.addEventListener('change', handleChange);
takeMuseumCheck.addEventListener('change', handleChange);
includeSpecialCheck.addEventListener('change', handleChange);
excludeFailedCheck.addEventListener('change', handleChange);

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
    
    // 学科選択パネルを表示
    populateDepartmentSelect(studentInfo);
    
    // 学科・コース選択パネルから実際の選択値を反映
    updateStudentInfoFromSelect(studentInfo);
    
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

// ========================================
// グループ化された要件の表示（トグル展開）
// ========================================
function renderGroupedRequirements(groupedReqs, groupStats, overallCreditsEarned, totalUsedForRequirements) {
    let html = `<div style="display: flex; flex-direction: column; gap: 15px;">`;
    let allGroupsAchieved = true;
    
    Object.keys(groupedReqs).forEach((groupName, groupIndex) => {
        const group = groupedReqs[groupName];
        const icon = group.icon || '📋';
        
        let groupEarned = 0;
        let allSubGroupsAchieved = true;
        let subGroupsHtml = '';
        
        if (groupName === "自由単位") {
            // 自由単位は全体の余剰で計算
            groupEarned = Math.max(0, overallCreditsEarned - totalUsedForRequirements);
            const isAchieved = groupEarned >= (group.totalRequired || 0);
            if (!isAchieved) allSubGroupsAchieved = false;
        } else if (group.subGroups && group.subGroups.length > 0) {
            subGroupsHtml += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
            
            group.subGroups.forEach((subGroup, subIndex) => {
                let subEarned = 0;
                
                // 集計方法の分岐
                if (!subGroup.type || subGroup.type === 'category') {
                    if (groupStats[subGroup.name]) {
                        subEarned = groupStats[subGroup.name].creditsEarned;
                    }
                } else if (subGroup.type === 'subject' && Array.isArray(subGroup.targetArray)) {
                    Object.values(groupStats).forEach(gs => {
                        gs.subjects.forEach(subj => {
                            if (subj.gp > 0 && subGroup.targetArray.some(t => subj.name.includes(t))) {
                                subEarned += subj.credits;
                            }
                        });
                    });
                } else if (subGroup.type === 'subject' && !Array.isArray(subGroup.targetArray)) {
                    Object.values(groupStats).forEach(gs => {
                        gs.subjects.forEach(subj => {
                            if (subj.gp > 0 && subj.name.includes(subGroup.name)) {
                                subEarned += subj.credits;
                            }
                        });
                    });
                }
                
                groupEarned += subEarned;
                
                const subAchieved = subEarned >= subGroup.required;
                if (!subAchieved) allSubGroupsAchieved = false;
                
                const subStatusIcon = subAchieved ? '✅' : '⚠️';
                
                subGroupsHtml += `
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid ${subAchieved ? '#4caf50' : '#f44336'}; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #f8fafc;">${subGroup.name}</div>
                            ${subGroup.mandatoryLabel ? `<div style="font-size: 0.85em; color: #f57f17; margin-top: 4px;">【${subGroup.mandatoryLabel}】</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #cbd5e1;">${subEarned.toFixed(1)} / ${subGroup.required.toFixed(1)}単位</div>
                            <span style="color: ${subAchieved ? '#4caf50' : '#f44336'}; font-weight: bold;">${subStatusIcon}</span>
                        </div>
                    </div>
                    ${subGroup.mandatory ? renderMandatorySubjects(subGroup.mandatory, groupStats[subGroup.name]) : ''}
                </div>
                `;
            });
            
            subGroupsHtml += `</div>`;
        }
        
        // グループ全体の要件を満たしているか（全サブグループ達成 ＆ 合計要件達成）
        const isOverallCreditsAchieved = groupEarned >= (group.totalRequired || 0);
        const isAchieved = isOverallCreditsAchieved && allSubGroupsAchieved;
        if (!isAchieved) allGroupsAchieved = false;
        
        const statusColor = isAchieved ? '#4caf50' : '#f44336';
        const statusIcon = isAchieved ? '✅' : '⚠️';
        
        const toggleId = `toggle_${groupName.replace(/\s+/g, '_')}_${groupIndex}`;
        
        html += `
        <div style="border: 1px solid rgba(200,200,200,0.2); border-radius: 8px; overflow: hidden;">
            <div class="requirement-group-header" style="background: rgba(${isAchieved ? '76,175,80' : '244,67,54'},0.1); padding: 15px; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;" onclick="toggleGroup('${toggleId}')">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span style="font-size: 1.3em;">${icon}</span>
                    <span style="font-weight: bold; color: #f8fafc;">${groupName}</span>
                    <span style="color: #cbd5e1; font-size: 0.9em;">
                        ${groupEarned.toFixed(1)} / ${(group.totalRequired || 0).toFixed(1)}単位
                        ${!allSubGroupsAchieved && isOverallCreditsAchieved ? '<span style="color:#f44336;font-size:0.8em;margin-left:5px;">(内訳未達)</span>' : ''}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: ${statusColor}; font-weight: bold;">${statusIcon}</span>
                    <span style="color: #cbd5e1; font-size: 1.2em;" id="toggle_icon_${toggleId}">▼</span>
                </div>
            </div>
            
            <div id="${toggleId}" class="requirement-group-content" style="display: none; padding: 15px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(200,200,200,0.2);">
                ${group.description ? `<p style="color: #94a3b8; margin-bottom: 15px; font-size: 0.9em;">${group.description}</p>` : ''}
                ${subGroupsHtml}
            </div>
        </div>
        `;
    });
    
    // 合格判定（卒業要件を満たしているか）
    if (allGroupsAchieved) {
        html = `
        <div style="background: rgba(76,175,80,0.15); border: 2px solid #4caf50; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #4caf50; margin: 0;">🎉 卒業要件をすべて満たしています！</h3>
        </div>
        ` + html;
    } else {
        html = `
        <div style="background: rgba(244,67,54,0.15); border: 2px solid #f44336; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #f44336; margin: 0;">⚠️ 卒業要件を満たしていません</h3>
            <p style="font-size: 0.9em; margin-top: 5px; color: #ffeb3b;">すべての項目の条件（内訳含む）を満たす必要があります。</p>
        </div>
        ` + html;
    }
    
    html += `</div>`;
    return html;
}

// ========================================
// 必修科目の表示
// ========================================
function renderMandatorySubjects(mandatoryList, groupStats) {
    let html = `<div style="margin-top: 8px; font-size: 0.85em; color: #94a3b8;">`;
    
    if (groupStats && groupStats.subjects) {
        mandatoryList.forEach(mandatory => {
            const taken = groupStats.subjects.some(sub => sub.name === mandatory && sub.gp > 0);
            const icon = taken ? '✓' : '✗';
            const color = taken ? '#4caf50' : '#f44336';
            html += `<div style="color: ${color};">・${icon} ${mandatory}</div>`;
        });
    }
    
    html += `</div>`;
    return html;
}

// ========================================
// グループトグル処理
// ========================================
function toggleGroup(toggleId) {
    const element = document.getElementById(toggleId);
    const icon = document.getElementById(`toggle_icon_${toggleId}`);
    
    if (element) {
        if (element.style.display === 'none' || element.style.display === '') {
            element.style.display = 'block';
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            element.style.display = 'none';
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    }
}

// ----------------------------------------
// 進級・卒業要件の判定ロジック
// ----------------------------------------
function renderRequirements(overallCreditsEarned, groupStats, teachingTotalCredits, museumTotalCredits, studentInfo) {
    const year = enrollmentYearSelect.value;
    const department = studentInfo.department;
    const course = studentInfo.course;

    requirementsSection.innerHTML = '';

    if (typeof REQUIREMENTS !== 'undefined' && REQUIREMENTS[year] && REQUIREMENTS[year][department]) {
        const reqDataBranch = REQUIREMENTS[year][department];
        let courseText = course === "base" ? "" : ` / ${course}`;
        let html = `<p style="margin-bottom: 20px;"><strong>[${year}年度入学 ${department}${courseText}]</strong> の履修案内に基づく要件判定です。</p>`;

        let graduationRules = reqDataBranch["base"]?.graduation;
        if (course !== "base" && reqDataBranch[course] && reqDataBranch[course].graduation) {
            graduationRules = reqDataBranch[course].graduation;
        }

        let totalUsedForRequirements = 0;

        // Auto-group conditions if not mechanically configured
        if (graduationRules && !graduationRules.groupedRequirements && graduationRules.conditions) {
            let artsSubList = [];
            let artsReq = 23; // Default for Liberal Arts
            let specSubList = [];
            let specReq = 0;
            let freeReq = 16;
            
            graduationRules.conditions.forEach(c => {
                 let name = c.target;
                 if (c.type === 'total') {
                     // total rule ignored
                 } else if (c.type === 'free_elective') {
                     freeReq = c.required;
                 } else if (c.type === 'category' || c.type === 'subject') {
                     if (c.type === 'subject') name = Array.isArray(c.target) ? c.target.join(', ') : c.target;
                     let subGroup = {
                         name: name,
                         required: c.required,
                         type: c.type,
                         targetArray: c.type === 'subject' && Array.isArray(c.target) ? c.target : null,
                         mandatoryLabel: c.type === 'subject' ? c.label : undefined
                     };
                     
                     if (c.type === 'category' && ['新入生', 'グローバル', 'スポーツ'].some(x => c.target.includes(x))) {
                         artsSubList.push(subGroup);
                     } else {
                         specSubList.push(subGroup);
                         if (c.type === 'category') specReq += c.required;
                     }
                 }
            });
            
            graduationRules.groupedRequirements = {
                "教養科目": {
                    totalRequired: artsReq,
                    icon: "📚",
                    subGroups: artsSubList
                },
                "学科専門": {
                    totalRequired: specReq,
                    icon: "🔧",
                    subGroups: specSubList
                },
                "自由単位": {
                    totalRequired: freeReq,
                    icon: "✨",
                    description: "その他の履修科目（他学科科目、自由選択科目など）"
                }
            };
        }

        if (graduationRules && graduationRules.groupedRequirements) {
            let reqs = graduationRules.groupedRequirements;
            ['教養科目', '学科専門'].forEach(gn => {
                if (reqs[gn] && reqs[gn].subGroups) {
                    reqs[gn].subGroups.forEach(sub => {
                        let subEarned = 0;
                        if (!sub.type || sub.type === 'category') {
                            if (groupStats[sub.name]) subEarned += groupStats[sub.name].creditsEarned;
                        } else if (sub.type === 'subject') {
                            Object.values(groupStats).forEach(gs => {
                                gs.subjects.forEach(subj => {
                                    if (subj.gp > 0 && sub.targetArray && sub.targetArray.some(t => subj.name.includes(t))) subEarned += subj.credits;
                                    else if (subj.gp > 0 && !sub.targetArray && subj.name.includes(sub.name)) subEarned += subj.credits;
                                });
                            });
                        }
                        totalUsedForRequirements += Math.min(sub.required, subEarned);
                    });
                }
            });

            html += renderGroupedRequirements(reqs, groupStats, overallCreditsEarned, totalUsedForRequirements);
        }

        requirementsSection.innerHTML = html;

    } else {
        requirementsSection.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                ⚠️ 選択された年度(${year})・学科(${department})の要件データはまだ登録されていません。
            </div>
        `;
    }
}

// 学科・コース選択パネルの処理
// ========================================

function updateStudentInfoFromSelect(studentInfo) {
    const selectedDept = departmentSelect.value || studentInfo.department;
    const selectedCourse = courseSelect.value || 'base';
    
    if (selectedDept && selectedDept !== '不明') {
        studentInfo.department = selectedDept;
        studentInfo.course = selectedCourse || 'base';
    }
}

function populateDepartmentSelect(studentInfo) {
    const year = enrollmentYearSelect.value;
    
    // 学科選択パネルを表示
    departmentSelectPanel.style.display = 'block';
    
    // REQUIREMENTS_DATAから学科リストを取得
    if (typeof REQUIREMENTS !== 'undefined' && REQUIREMENTS[year]) {
        const yearData = REQUIREMENTS[year];
        const departments = Object.keys(yearData).filter(k => k !== 'base');
        
        // 既存のオプションをクリア（最初の「学科を選択してください」は保持）
        while (departmentSelect.options.length > 1) {
            departmentSelect.remove(1);
        }
        
        // 学科リストを追加
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            
            // CSV読み込み時に検出した学科が自動選択される
            if (studentInfo.department === dept) {
                option.selected = true;
            }
            
            departmentSelect.appendChild(option);
        });
        
        // 初期学科が選択されていたら、コース選択を更新
        if (studentInfo.department !== '不明') {
            departmentSelect.value = studentInfo.department;
            updateCourseSelect();
        }
    }
}

// コース選択ドロップダウンを更新
function updateCourseSelect() {
    const year = enrollmentYearSelect.value;
    const selectedDepartment = departmentSelect.value;
    
    if (!selectedDepartment || typeof REQUIREMENTS === 'undefined' || !REQUIREMENTS[year]) {
        courseSelect.style.display = 'none';
        courseSelect.value = 'base';
        return;
    }
    
    const yearData = REQUIREMENTS[year];
    const deptData = yearData[selectedDepartment];
    
    if (!deptData) {
        courseSelect.style.display = 'none';
        courseSelect.value = 'base';
        return;
    }
    
    // 「base」を除いたコースオプションを取得
    const courses = Object.keys(deptData).filter(k => !['base', 'teaching', 'museum', 'graduation'].includes(k));
    
    // コースがある場合のみコース選択を表示
    if (courses.length > 0) {
        // 既存のオプションをクリア（最初の「指定なし」は保持）
        while (courseSelect.options.length > 1) {
            courseSelect.remove(1);
        }
        
        // コースリストを追加
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseSelect.appendChild(option);
        });
        
        courseSelect.style.display = 'block';
    } else {
        courseSelect.style.display = 'none';
        courseSelect.value = 'base';
    }
}

// 学科選択の変更イベント
departmentSelect.addEventListener('change', () => {
    updateCourseSelect();
    reCalculate();
});

// コース選択の変更イベント
courseSelect.addEventListener('change', () => {
    reCalculate();
});
