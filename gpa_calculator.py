import csv
import argparse
from collections import defaultdict
from typing import Dict

# デフォルトの成績
Default_grade: Dict[str,float] = {"S":4.0, "A":3.0, "B":2.0, "C":1.0, "D":0}

def analyze_score_csv(csv_filepath, include_special_subjects=True, exclude_failed=False):
    student_info = {}
    
    # 科目群（大区分）ごとの成績を集計するための辞書
    group_stats = defaultdict(lambda: {
        'total_gpt': 0.0,
        'credits_earned': 0.0,
        'credits_attempted': 0.0,
        'subjects': []
    })
    
    overall_total_gpt = 0.0
    overall_credits_earned = 0.0
    overall_credits_attempted = 0.0
    
    # データの読み込み
    with open(csv_filepath, mode='r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        
        for row in reader:
            if not row:
                continue
            
            # 生徒情報の抽出 (1行目〜3行目あたりにあるメタデータ)
            if "[学生氏名]" in row:
                try:
                    name_idx = row.index("[学生氏名]") + 1
                    student_info['name'] = row[name_idx].strip()
                except ValueError:
                    pass
            if "[学籍番号 ]" in row or "[学籍番号]" in row: # スペースが入っている可能性考慮
                for key in ["[学籍番号 ]", "[学籍番号]"]:
                    if key in row:
                        try:
                            id_idx = row.index(key) + 1
                            student_info['id'] = row[id_idx].strip()
                        except ValueError:
                            pass
            if "[学生所属]" in row:
                try:
                    aff_idx = row.index("[学生所属]") + 1
                    student_info['affiliation'] = row[aff_idx].strip()
                except ValueError:
                    pass
            if "[学年]" in row or "[学年 ]" in row:
                for key in ["[学年]", "[学年 ]"]:
                    if key in row:
                        try:
                            grade_idx = row.index(key) + 1
                            student_info['grade'] = row[grade_idx].strip()
                        except ValueError:
                            pass

            # 成績データの行かどうかの判定 ("単位数" が数値に変換できるか)
            if len(row) >= 11:
                # 決め打ちのフォーマット:
                # 4列目(index 4): 科目
                # 6列目(index 6): 単位数
                # 9列目(index 9): 評語（評価）
                # 1列目(index 1): 科目大区分（科目群）
                subject_name = row[4].strip()
                group_name = row[1].strip()
                grade = row[9].strip().upper()
                
                try:
                    credits = float(row[6].strip())
                except ValueError:
                    # ヘッダー行や数値でない行はスキップ
                    continue
                
                if grade in Default_grade:
                    gp = Default_grade[grade]
                    gpt = credits * gp
                    
                    is_special = group_name in ["博物館科目", "教職科目"]
                    # GPが0の場合（Dなど）を不合格として扱う
                    is_failed = (gp == 0.0)
                    
                    if exclude_failed and is_failed:
                        # 不合格科目を除外する場合、GPA対象単位に加えない
                        attempted_credits_to_add = 0.0
                    else:
                        attempted_credits_to_add = credits

                    # 科目群ごとの集計
                    group = group_stats[group_name]
                    group['total_gpt'] += gpt
                    group['credits_attempted'] += attempted_credits_to_add
                    if gp > 0:
                        group['credits_earned'] += credits
                        
                    # 全体の集計
                    if include_special_subjects or not is_special:
                        overall_total_gpt += gpt
                        overall_credits_attempted += attempted_credits_to_add
                        if gp > 0:
                            overall_credits_earned += credits
                            
                    group['subjects'].append({
                        'name': subject_name,
                        'credits': credits,
                        'grade': grade,
                        'gp': gp
                    })

    # GPA計算メソッド
    def calc_gpa(gpt, attempted):
        return gpt / attempted if attempted > 0 else 0.0

    overall_gpa = calc_gpa(overall_total_gpt, overall_credits_attempted)
    
    # 結果の表示
    print("=" * 50)
    print("🎓 学生情報")
    print("=" * 50)
    print(f"氏名:     {student_info.get('name', '不明')}")
    print(f"学籍番号: {student_info.get('id', '不明')}")
    print(f"所属:     {student_info.get('affiliation', '不明')}")
    print(f"学年:     {student_info.get('grade', '不明')}")
    print("\n" + "=" * 50)
    print(f"🌟 全体の成績 (総合)")
    print("=" * 50)
    print(f"取得単位数:       {overall_credits_earned}")
    print(f"GPA対象単位数:    {overall_credits_attempted}")
    print(f"GPT(総ポイント):   {overall_total_gpt:.2f}")
    print(f"総合 GPA:         {overall_gpa:.3f}")
    
    print("\n" + "=" * 50)
    print("📊 科目群別 成績")
    print("=" * 50)
    for group_name, stats in sorted(group_stats.items()):
        if not group_name:
            group_name = "その他/未分類"
        gpa = calc_gpa(stats['total_gpt'], stats['credits_attempted'])
        print(f"📁 【{group_name}】")
        print(f"  取得単位数: {stats['credits_earned']} / GPA対象: {stats['credits_attempted']}")
        print(f"  GPT: {stats['total_gpt']:.2f}")
        print(f"  GPA: {gpa:.3f}")
        print("-" * 30)

def main():
    parser = argparse.ArgumentParser(description='成績CSVからGPAおよび科目群別の成績を計算します。')
    parser.add_argument('csv_file', help='成績データが入ったCSVファイルのパス (例: score.csv)')
    args = parser.parse_args()
    
    print("【GPA計算の設定】")
    ans1 = input("1. 博物館科目と教職科目を全体のGPA計算に含めますか？ (y/n) [y]: ").strip().lower()
    include_special = False if ans1 == 'n' else True
    
    ans2 = input("2. 不合格科目(D評価など)をGPA対象単位から除外しますか？ (y/n) [n]: ").strip().lower()
    exclude_failed = True if ans2 == 'y' else False
    
    print("\n計算中...\n")
    analyze_score_csv(args.csv_file, include_special, exclude_failed)

if __name__ == '__main__':
    main()
