const fs = require('fs');

let src = fs.readFileSync('script.js', 'utf8');
let lines = src.split('\n');

// Find start and end indices
const startIdx = lines.findIndex(l => l.includes('// グループ化された要件の表示（トグル展開）'));
const endIdx = lines.findIndex(l => l.includes('// 学科・コース選択パネルの処理'));

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = `// グループ化された要件の表示（トグル展開）
// ========================================
function renderGroupedRequirements(groupedReqs, groupStats, overallCreditsEarned, totalUsedForRequirements) {
    let html = \`<div style="display: flex; flex-direction: column; gap: 15px;">\`;
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
            subGroupsHtml += \`<div style="display: flex; flex-direction: column; gap: 10px;">\`;
            
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
                
                subGroupsHtml += \`
                <div style="padding: 12px; background: rgba(255,255,255,0.03); border-left: 3px solid \${subAchieved ? '#4caf50' : '#f44336'}; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #f8fafc;">\${subGroup.name}</div>
                            \${subGroup.mandatoryLabel ? \`<div style="font-size: 0.85em; color: #f57f17; margin-top: 4px;">【\${subGroup.mandatoryLabel}】</div>\` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #cbd5e1;">\${subEarned.toFixed(1)} / \${subGroup.required.toFixed(1)}単位</div>
                            <span style="color: \${subAchieved ? '#4caf50' : '#f44336'}; font-weight: bold;">\${subStatusIcon}</span>
                        </div>
                    </div>
                    \${subGroup.mandatory ? renderMandatorySubjects(subGroup.mandatory, groupStats[subGroup.name]) : ''}
                </div>
                \`;
            });
            
            subGroupsHtml += \`</div>\`;
        }
        
        // グループ全体の要件を満たしているか（全サブグループ達成 ＆ 合計要件達成）
        const isOverallCreditsAchieved = groupEarned >= (group.totalRequired || 0);
        const isAchieved = isOverallCreditsAchieved && allSubGroupsAchieved;
        if (!isAchieved) allGroupsAchieved = false;
        
        const statusColor = isAchieved ? '#4caf50' : '#f44336';
        const statusIcon = isAchieved ? '✅' : '⚠️';
        
        const toggleId = \`toggle_\${groupName.replace(/\\s+/g, '_')}_\${groupIndex}\`;
        
        html += \`
        <div style="border: 1px solid rgba(200,200,200,0.2); border-radius: 8px; overflow: hidden;">
            <div class="requirement-group-header" style="background: rgba(\${isAchieved ? '76,175,80' : '244,67,54'},0.1); padding: 15px; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;" onclick="toggleGroup('\${toggleId}')">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span style="font-size: 1.3em;">\${icon}</span>
                    <span style="font-weight: bold; color: #f8fafc;">\${groupName}</span>
                    <span style="color: #cbd5e1; font-size: 0.9em;">
                        \${groupEarned.toFixed(1)} / \${(group.totalRequired || 0).toFixed(1)}単位
                        \${!allSubGroupsAchieved && isOverallCreditsAchieved ? '<span style="color:#f44336;font-size:0.8em;margin-left:5px;">(内訳未達)</span>' : ''}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: \${statusColor}; font-weight: bold;">\${statusIcon}</span>
                    <span style="color: #cbd5e1; font-size: 1.2em;" id="toggle_icon_\${toggleId}">▼</span>
                </div>
            </div>
            
            <div id="\${toggleId}" class="requirement-group-content" style="display: none; padding: 15px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(200,200,200,0.2);">
                \${group.description ? \`<p style="color: #94a3b8; margin-bottom: 15px; font-size: 0.9em;">\${group.description}</p>\` : ''}
                \${subGroupsHtml}
            </div>
        </div>
        \`;
    });
    
    // 合格判定（卒業要件を満たしているか）
    if (allGroupsAchieved) {
        html = \`
        <div style="background: rgba(76,175,80,0.15); border: 2px solid #4caf50; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #4caf50; margin: 0;">🎉 卒業要件をすべて満たしています！</h3>
        </div>
        \` + html;
    } else {
        html = \`
        <div style="background: rgba(244,67,54,0.15); border: 2px solid #f44336; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #f44336; margin: 0;">⚠️ 卒業要件を満たしていません</h3>
            <p style="font-size: 0.9em; margin-top: 5px; color: #ffeb3b;">すべての項目の条件（内訳含む）を満たす必要があります。</p>
        </div>
        \` + html;
    }
    
    html += \`</div>\`;
    return html;
}

// ========================================
// 必修科目の表示
// ========================================
function renderMandatorySubjects(mandatoryList, groupStats) {
    let html = \`<div style="margin-top: 8px; font-size: 0.85em; color: #94a3b8;">\`;
    
    if (groupStats && groupStats.subjects) {
        mandatoryList.forEach(mandatory => {
            const taken = groupStats.subjects.some(sub => sub.name === mandatory && sub.gp > 0);
            const icon = taken ? '✓' : '✗';
            const color = taken ? '#4caf50' : '#f44336';
            html += \`<div style="color: \${color};">・\${icon} \${mandatory}</div>\`;
        });
    }
    
    html += \`</div>\`;
    return html;
}

// ========================================
// グループトグル処理
// ========================================
function toggleGroup(toggleId) {
    const element = document.getElementById(toggleId);
    const icon = document.getElementById(\`toggle_icon_\${toggleId}\`);
    
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
        let courseText = course === "base" ? "" : \` / \${course}\`;
        let html = \`<p style="margin-bottom: 20px;"><strong>[\${year}年度入学 \${department}\${courseText}]</strong> の履修案内に基づく要件判定です。</p>\`;

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
        requirementsSection.innerHTML = \`
            <div style="padding: 20px; text-align: center; color: #666;">
                ⚠️ 選択された年度(\${year})・学科(\${department})の要件データはまだ登録されていません。
            </div>
        \`;
    }
}
`;

    lines.splice(startIdx, endIdx - startIdx, newContent);
    fs.writeFileSync('script.js', lines.join('\n'));
    console.log("Patched script.js");
} else {
    console.error("Indices not found");
}
