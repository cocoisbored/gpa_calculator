import re

code = """
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
"""
import sys

with open("REQUIREMENTS_DATA.js", "r") as f:
    text = f.read()

text = re.sub(r'\"生命工学科\": \{.*$', code[1:] + '    }', text, flags=re.DOTALL)
with open("REQUIREMENTS_DATA.js", "w") as f:
    f.write(text)
print("Updated other depts")
