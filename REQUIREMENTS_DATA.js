//REQUIREMENTS_DATA.js
// ここに履修案内の設定値を年度・学科別に入力します。
// 例として2023年度の「機械システム工学科」などのダミーデータを入れています。
// ご自身の学科や入学年度に合わせて、必要な取得単位数を書き換えてください。

const REQUIREMENTS = {
    "2023": {
        "機械システム工学科": {
            // 例: 2年から3年への進級条件
            advancement_2_to_3: {
                title: "2年次 → 3年次 進級要件",
                conditions: [
                    { type: 'total', required: 60, label: "修得総単位数" },
                    { type: 'category', target: "教養科目", required: 16, label: "教養科目群" },
                    { type: 'category', target: "専門基礎科目", required: 20, label: "専門基礎科目" }
                ]
            },
            // 例: 3年から4年（研究室配属）への進級条件
            advancement_3_to_4: {
                title: "3年次 → 4年次 進級(研究室配属)要件",
                conditions: [
                    { type: 'total', required: 96, label: "修得総単位数" },
                    { type: 'category', target: "専門科目", required: 40, label: "専門科目" }
                ]
            },
            // 例: 卒業要件
            graduation: {
                title: "卒業要件",
                conditions: [
                    { type: 'total', required: 124, label: "卒業要件 総合計" },
                    { type: 'category', target: "教養科目", required: 26, label: "教養科目" },
                    { type: 'category', target: "専門基礎科目", required: 30, label: "専門基礎科目" },
                    { type: 'category', target: "専門科目", required: 50, label: "専門科目" },
                    { type: 'category', target: "自由選択", required: 18, label: "自由選択枠" }
                ]
            }
        },
        "知能情報システム工学科": {
            advancement_2_to_3: {
                title: "2年次 → 3年次 進級要件",
                conditions: [
                    { type: 'total', required: 64, label: "修得総単位数" },
                    { type: 'category', target: "教養科目", required: 14, label: "教養科目群" }
                ]
            },
            advancement_3_to_4: {
                title: "3年次 → 4年次 進級(研究室配属)要件",
                conditions: [
                    { type: 'total', required: 100, label: "修得総単位数" },
                    { type: 'category', target: "専門科目", required: 42, label: "専門科目" }
                ]
            },
            graduation: {
                title: "卒業要件",
                conditions: [
                    { type: 'total', required: 124, label: "卒業要件 総合計" },
                    { type: 'category', target: "教養科目", required: 22, label: "教養科目" },
                    { type: 'category', target: "専門基礎科目", required: 34, label: "専門基礎科目" },
                    { type: 'category', target: "専門科目", required: 52, label: "専門科目" }
                ]
            }
        }
        // 他の学科 (応用化学科, 生命工学科, 生体医用システム工学科) や 2022, 2025なども同様に追加可能です
    }
};
