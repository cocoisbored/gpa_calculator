const fs = require('fs');
let code = fs.readFileSync('REQUIREMENTS_DATA.js', 'utf8');

// Replace conditions into groupedRequirements dynamically for all departments that don't have it
Object.keys(REQUIREMENTS).forEach(year => {
    Object.keys(REQUIREMENTS[year]).forEach(dept => {
        if (dept === "teaching" || dept === "museum") return;
        Object.keys(REQUIREMENTS[year][dept]).forEach(course => {
            let data = REQUIREMENTS[year][dept][course].graduation;
            if (data && data.conditions) {
                let arts = []; let artsR = 23; // default assumption for Liberal Arts
                let spec = []; let specR = 0;
                let freeR = 16;
                let totalR = 124;
                
                data.conditions.forEach(c => {
                     let n = c.label || c.target;
                     let r = c.required;
                     if (c.type === 'total') totalR = r;
                     else if (c.type === 'free_elective') freeR = r;
                     else if (['新入生', 'グローバル', 'スポーツ'].some(x => String(n).includes(x))) {
                         arts.push({name: c.target, required: r, conditions: [c]});
                     } else if (String(n).includes('専門')) {
                         spec.push({
                             name: c.target instanceof Array ? c.label : c.target,
                             required: r,
                             conditions: [c],
                             mandatory: c.type === 'subject' && Array.isArray(c.target) ? c.target : undefined,
                             mandatoryLabel: c.type === 'subject' ? c.label : undefined
                         });
                         specR += r; // Add up specs
                     }
                });
                
                // For Mech: 23 Arts, 64 Spec (base).
                // Actually we can sum spec.
                data.groupedRequirements = {
                    "教養科目": {
                        totalRequired: artsR,
                        icon: "📚",
                        subGroups: arts
                    },
                    "学科専門": {
                        totalRequired: specR,
                        icon: "🔧",
                        subGroups: spec
                    },
                    "自由単位": {
                        totalRequired: freeR,
                        icon: "✨",
                        description: "その他の履修科目（他学科科目、自由選択科目など）"
                    }
                };
            }
        });
    });
});
console.log(JSON.stringify(REQUIREMENTS, null, 2));
