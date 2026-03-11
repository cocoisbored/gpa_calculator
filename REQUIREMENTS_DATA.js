// REQUIREMENTS_DATA.js
// 履修案内の設定値（年度・学科・コース別）
// 実際の履修案内に沿って各群の必要単位数を編集してください。

// 'total' = 指定した実績値（卒業要件の合計など）
// 'category' = 大区分の中の特定の小区分（科目群）の単位
// 'specific' = 特定の必須科目などの判定（今回は単位数ベースの判定として実装）

const REQUIREMENTS = {
    "2024": {
        "機械システム工学科": {
            // 学科共通あるいは「コース未選択」時の要件ベース
            "base": {
                graduation: {
                    title: "卒業要件 (機械システム工学科 共通)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'category', target: "新入生科目群", required: 2, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 4, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 6, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 2, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "学科専門科目群", required: 64, label: "学科専門科目群 (基本)" },
                    ]
                }
            },
            // コースごとの専用要件（上で定義したベース要件に上書き/追加されます）
            "航空宇宙・機械科学コース": {
                graduation: {
                    title: "卒業要件 (航空宇宙・機械科学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'category', target: "新入生科目群", required: 2, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 4, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 6, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 2, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "学科専門科目群", required: 70, label: "学科専門科目群 (航空宇宙コース指定)" },
                    ]
                }
            },
            "ロボティクス・知能機械デザインコース": {
                graduation: {
                    title: "卒業要件 (ロボティクスコース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'category', target: "新入生科目群", required: 2, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 4, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 6, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 2, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "学科専門科目群", required: 70, label: "学科専門科目群 (ロボティクスコース指定)" },
                    ]
                }
            },
            // 教職要件
            teaching: {
                title: "教職課程 要件",
                conditions: [
                    { type: 'special_total', target: 'teaching', required: 26, label: "教職科目 取得単位" }
                    // 具体的な必修科目判定等も拡張可能
                ]
            },
            // 博物館（学芸員）要件
            museum: {
                title: "学芸員資格 (博物館科目) 要件",
                conditions: [
                    { type: 'special_total', target: 'museum', required: 19, label: "博物館科目 取得単位" }
                ]
            }
        },
        "知能情報システム工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (知能情報システム工学科 共通)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'category', target: "新入生科目群", required: 2, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 4, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 6, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 2, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "学科専門科目群", required: 64, label: "学科専門科目群" },
                    ]
                }
            },
            // 知能情報のコース
            "数理情報工学コース": {
                graduation: {
                    title: "卒業要件 (数理情報工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" }
                    ]
                }
            },
            "電子情報工学コース": {
                graduation: {
                    title: "卒業要件 (電子情報工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" }
                    ]
                }
            },
            teaching: {
                title: "教職課程 要件",
                conditions: [
                    { type: 'special_total', target: 'teaching', required: 26, label: "教職科目 取得単位" }
                ]
            },
            museum: {
                title: "学芸員資格 (博物館科目) 要件",
                conditions: [
                    { type: 'special_total', target: 'museum', required: 19, label: "博物館科目 取得単位" }
                ]
            }
        },
        "生命工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (生命工学科 共通)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            },
            "生体機能工学コース": {
                graduation: {
                    title: "卒業要件 (生体機能工学コース)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            },
            "応用生物コース": {
                graduation: {
                    title: "卒業要件 (応用生物コース)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            }
        },
        "生体医用システム工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (生体医用システム工学科)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            }
        },
        "応用化学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (応用化学科)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            }
        },
        "化学物理工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (化学物理工学科 共通)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            },
            "化学工学コース": {
                graduation: {
                    title: "卒業要件 (化学工学コース)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            },
            "物理工学コース": {
                graduation: {
                    title: "卒業要件 (物理工学コース)",
                    conditions: [{ type: 'total', required: 124, label: "卒業要件 総合計" }]
                }
            }
        }
    }
};

// 暫定的に、2022〜2025年度すべてに「2024年度」と同じルールを適用（コピー）しておきます。
// 年度ごとにルールが違う場合は、ここを消して個別に { "2023": { ... } } と書いてください。
REQUIREMENTS["2025"] = REQUIREMENTS["2024"];
REQUIREMENTS["2023"] = REQUIREMENTS["2024"];
REQUIREMENTS["2022"] = REQUIREMENTS["2024"];
