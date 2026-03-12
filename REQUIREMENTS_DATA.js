// REQUIREMENTS_DATA.js
// 履修案内の設定値（年度・学科・コース別）
// 実際の履修案内に沿って各群の必要単位数を編集してください。

// 'total' = 指定した実績値（卒業要件の合計など）
// 'category' = 大区分の中の特定の小区分（科目群）の単位
// 'specific' = 特定の必須科目などの判定（今回は単位数ベースの判定として実装）

// AUTO-GENERATED SUBJECT LISTS
const 生命工学科_kiso = [];
const 生命工学科_senmon = [];
const 生体医用システム工学科_kiso = [];
const 生体医用システム工学科_senmon = [];
const 応用化学科_kiso = [];
const 応用化学科_senmon = [];
const 化学物理工学科_kiso = [];
const 化学物理工学科_senmon = [];
const 機械システム工学科_kiso = [];
const 機械システム工学科_senmon = [];
const 知能情報システム工学科_kiso = [];
const 知能情報システム工学科_senmon = ["インターンシップ", "VLSI設", "先端電子デバイス", "学を含めて、", "電子物性工学", "データベース", "情報セキュリティ", "人工知能", "ヒューマンインタフェース", "すること基礎情報数学", "工学部特別講義Ⅱ（", "オペレーティングシステム", "知能情報システム工学特別講義（自然言語処理）", "ソフトウェア工学", "量子力学概論", "１－４．そ", "（1）授", "限り、所定の期日（前期および後期の履修登録期間内）までに、", "パワーエレクトロニクス", "電子デバイスⅡ", "電磁波工学", "古宮", "論文", "数理最適化", "先進知能情報システム工学実験Ⅰ", "知能情報システム工学特別講義（", "知能情報システム工学実験１A", "コンピュータグラフィックス", "知能情報システム工学実験２A", "（2）", "村田", "並木", "計算機ネットワーク", "ガイダンスの", "言語処理系", "関数プログラミング", "ムを創り出すための研究開発能力を育成します。", "履修願」などの書類を教務係に提出してください。出願受付期間は次のとおりです。", "通信工学", "研究室体験配属", "清水", "先端電子情報数学", "先進知能情報システム工学実験Ⅲ", "卒業論文", "オブジェクト指向プログラミング", "先進知能情報システム工学演習Ⅱ", "先進知能情報システム工学実験Ⅱ", "知能情報システム工学特別講義（データ分析の数理）", "電子情報工学コース", "サステイナブルエネルギー工学", "アルゴリズム論", "岩崎", "きる。工学部特別講義Ⅰ（環境科学Ⅰ）", "派遣学生は、本学の授業料を納入しなければなりません（国立大学法人東京農工大学における学生の派遣、留学及び受入れに関する規程、第９条）", "出願希望者に対して、１月中旬頃に", "数理情報工学・電子情報工学", "先進知能情報システム工学実験Ⅳ", "画像工学", "知能情報システム工学実験１B", "工学部特別講義Ⅰ（", "熱統計力学", "メディア伝送工学", "教育分野", "回路理論", "（1）１～３年次４学期までの通算ＧＰＡが３．", "履修上必要な施設・設備（附属図書館、食堂等）を利用することができます。", "マイクロプロセッサ", "先端数理情報数学", "パターン認識と機械学習", "ディジタル電子回路", "ロニクス、電気エネルギー変換工学、電子機能集積工学、環境エネルギー工学、通信システム工学、知能システム工学、電磁波工学、医用情報工学、画像情報工学、音響工学などです。有馬"];

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
                        { type: 'category', target: "専門科目群", required: 64, label: "専門科目群 (基本)", validSubjects: 機械システム工学科_senmon },
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
                        { type: 'category', target: "専門科目群", required: 70, label: "専門科目群 (航空宇宙コース指定)" },
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
                        { type: 'category', target: "専門科目群", required: 70, label: "専門科目群 (ロボティクスコース指定)" },
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
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)", validSubjects: 知能情報システム工学科_kiso },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)", validSubjects: 知能情報システム工学科_senmon }
                    ]
                }
            },
            "数理情報工学コース": {
                graduation: {
                    title: "卒業要件 (数理情報工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位 (溢れた単位など)" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" },
                        { type: 'subject', target: ['線形代数学Ⅰ', '線形代数学Ⅱ', '微分積分学Ⅰ', '微分積分学Ⅱ'], required: 10, label: "専門基礎 (工学共通数学 必修)" },
                        { type: 'subject', target: ['微分方程式', '数理統計学'], required: 4, label: "専門基礎 (数理・統計 必修等)" },
                        { type: 'subject', target: ['知能情報システム工学概論', 'プログラミングⅠ', 'プログラミングⅡ', 'コンピュータ基礎', '基礎電気回路', '論理回路', '情報理論', '線形システム', '情報化社会と職業'], required: 18, label: "専門基礎 (知能情報 必修)" },
                        { type: 'subject', target: ['離散数学', 'アルゴリズム序論', '計算機アーキテクチャ'], required: 6, label: "専門科目 (数理情報コース必修)" },
                    ]
                }
            },
            "電子情報工学コース": {
                graduation: {
                    title: "卒業要件 (電子情報工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位 (溢れた単位など)" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" },
                        { type: 'subject', target: ['電磁気学Ⅰ', '電磁気学Ⅱ', '基礎電子回路', '電子デバイスⅠ'], required: 8, label: "専門科目 (電子情報コース必修)" },
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
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" }
                    ]
                }
            },
            "生体機能工学コース": {
                graduation: {
                    title: "卒業要件 (生体機能工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" }
                    ]
                }
            },
            "応用生物コース": {
                graduation: {
                    title: "卒業要件 (応用生物コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" }
                    ]
                }
            }
        },
        "生体医用システム工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (生体医用システム工学科)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" }
                    ]
                }
            }
        },
        "応用化学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (応用化学科)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 42, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 45, label: "専門科目 (最低)" }
                    ]
                }
            }
        },
        "化学物理工学科": {
            "base": {
                graduation: {
                    title: "卒業要件 (化学物理工学科 共通)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 32, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 55, label: "専門科目 (最低)" }
                    ]
                }
            },
            "化学工学コース": {
                graduation: {
                    title: "卒業要件 (化学工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 32, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 55, label: "専門科目 (最低)" },
                        { type: 'subject', target: ['化学工学実験'], required: 3, label: "化学工学コース必修" }
                    ]
                }
            },
            "物理工学コース": {
                graduation: {
                    title: "卒業要件 (物理工学コース)",
                    conditions: [
                        { type: 'total', required: 124, label: "卒業要件 総合計" },
                        { type: 'free_elective', target: null, required: 16, label: "自由選択単位" },
                        { type: 'category', target: "新入生科目群", required: 3, label: "新入生科目群" },
                        { type: 'category', target: "グローバル教養科目群", required: 8, label: "グローバル教養科目群" },
                        { type: 'category', target: "グローバル言語文化科目群", required: 7, label: "グローバル言語文化科目群" },
                        { type: 'category', target: "グローバル展開科目群", required: 2, label: "グローバル展開科目群" },
                        { type: 'category', target: "スポーツ健康科学科目群", required: 1, label: "スポーツ健康科学科目群" },
                        { type: 'category', target: "専門基礎科目群", required: 32, label: "専門基礎科目 (最低)" },
                        { type: 'category', target: "専門科目群", required: 55, label: "専門科目 (最低)" },
                        { type: 'subject', target: ['物理工学実験'], required: 3, label: "物理工学コース必修" }
                    ]
                }
            }
        }
    }
};

// 2024年度の要件を他の年度にも適用（大幅なカリキュラム変更がない限り共通）
REQUIREMENTS["2022"] = REQUIREMENTS["2024"];
REQUIREMENTS["2023"] = REQUIREMENTS["2024"];
REQUIREMENTS["2025"] = REQUIREMENTS["2024"];