import re

with open("req_pages.txt", "r") as f:
    lines = f.readlines()

def extract_subjects(start_marker, end_marker=None):
    inside = False
    subjects = []
    for line in lines:
        if "--- PAGE" in line:
            continue
        if start_marker in line:
            inside = True
            continue
        if end_marker and end_marker in line and inside:
            break
        if inside:
            # try to extract subject name: typically the first Japanese word string before a space or english
            # or just take the whole line
            # e.g., "信号処理論 田中　聡久 ◯2 2"
            parts = line.strip().split()
            if len(parts) > 1:
                subj = parts[0]
                # clean up
                subj = re.sub(r'^[○◯◎□◇△▲●\*]+', '', subj)
                if subj and len(subj) > 1 and not subj.isnumeric():
                    subjects.append(subj)
    return subjects

s_kiso = extract_subjects("専門基礎科目工学部共通数学", "知能情報システム工学科")
s_kiso += extract_subjects("専門基礎科目数学", "数理情報")
s_senmon_s = extract_subjects("数理情報工学コース　専門科目", "電子情報")
s_senmon_e = extract_subjects("電子情報工学コース　専門科目", "備考（1）")

print("KISO:", list(set(s_kiso)))
print("SENMON S:", list(set(s_senmon_s)))
print("SENMON E:", list(set(s_senmon_e)))
