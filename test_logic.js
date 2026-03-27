const fs = require('fs');

const testScript = `
function calcRequirements(overallCreditsEarned, groupStats, graduationRules) {
    // 1. Convert conditions to groupedRequirements
    let totalLiberalArtsRequired = 23; // user mentioned 25/23
    let freeElectiveRequired = 16;
    let totalCreditsRequired = 124;
    
    let artsSubList = [];
    let specSubList = [];
    let specRequired = 0;
    
    // Fallbacks if not specified:
    let reqTotalSum = 0;
    
    if (graduationRules.conditions) {
        graduationRules.conditions.forEach(c => {
            if (c.type === 'total') {
                totalCreditsRequired = c.required;
            } else if (c.type === 'free_elective') {
                freeElectiveRequired = c.required;
            } else if (c.type === 'category' || c.type === 'subject') {
                let name = c.target;
                if (c.type === 'subject') name = Array.isArray(c.target) ? c.target.join(', ') : c.target;
                
                let subGroup = {
                    name: name,
                    required: c.required,
                    conditions: [c],
                    type: c.type,
                    label: c.label
                };
                
                if (typeof c.target === "string" && ['新入生', 'グローバル', 'スポーツ'].some(x => c.target.includes(x))) {
                    artsSubList.push({ name: c.target, required: c.required, label: c.label, type: c.type });
                } else {
                    specSubList.push({ name: c.target, required: c.required, label: c.label, type: c.type, targetArray: Array.isArray(c.target) ? c.target : null });
                    if (c.type === 'category') specRequired += c.required; 
                    // To accurately reflect 92 or 45, the rules 'required' in 'category' must sum to it,
                    // unless a special '学科専門' condition exists.
                }
            }
        });
    }

    // Auto-groupings: "教養科目", "学科専門"
    // To match 45/92 from user prompt, if specRequired sum from conditions is X, we use it.
    let groupedReqs = {
        "教養科目": {
            totalRequired: totalLiberalArtsRequired,
            icon: "📚",
            subGroups: artsSubList
        },
        "学科専門": {
            totalRequired: specRequired,
            icon: "🔧",
            subGroups: specSubList
        }
    };

    // Calculate free electives internally
    let totalUsedForRequirements = 0;
    
    // Evaluate Groups and Build HTML
    let allGroupsAchieved = true;
    Object.keys(groupedReqs).forEach(groupName => {
        let group = groupedReqs[groupName];
        let groupEarned = 0;
        let allSubGroupsAchieved = true;
        
        group.subGroups.forEach(sub => {
            let subEarned = 0;
            if (sub.type === 'category') {
                if (groupStats[sub.name]) {
                    subEarned = groupStats[sub.name].creditsEarned;
                }
            } else if (sub.type === 'subject') {
                Object.values(groupStats).forEach(gs => {
                    gs.subjects.forEach(subj => {
                        if (subj.gp > 0 && sub.targetArray && sub.targetArray.some(t => subj.name.includes(t))) {
                            subEarned += subj.credits;
                        } else if (subj.gp > 0 && !sub.targetArray && subj.name.includes(sub.name)) {
                            subEarned += subj.credits;
                        }
                    });
                });
            }
            
            // Limit contribution to parent so we don't overcount for totalUsedForRequirements?
            // Actually in TUAT, extra spec credits overflow into free electives!
            let usableForSub = Math.min(sub.required, subEarned);
            totalUsedForRequirements += usableForSub; // Simplified
            groupEarned += subEarned;
            
            if (subEarned < sub.required) allSubGroupsAchieved = false;
        });
        
        // Excess credits in '教養科目' might also overflow to free electives depending on uni rules,
        // we'll assume groupEarned is total in that category.
        
        let isGroupAchieved = (groupEarned >= group.totalRequired) && allSubGroupsAchieved;
        if (!isGroupAchieved) allGroupsAchieved = false;
    });
    
    // "自由単位" is exactly (overallCreditsEarned - totalUsedForRequirements)
    let freeEarned = Math.max(0, overallCreditsEarned - totalUsedForRequirements);
    let freeAchieved = freeEarned >= freeElectiveRequired;
    
    groupedReqs["自由単位"] = {
        totalRequired: freeElectiveRequired,
        earned: freeEarned,
        achieved: freeAchieved,
        icon: "✨",
        description: "その他の履修科目（他学科科目、自由選択科目など）"
    };

    return groupedReqs;
}

module.exports = { calcRequirements };
`;
fs.writeFileSync('test_logic.js', testScript);
