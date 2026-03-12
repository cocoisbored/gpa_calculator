import re
import json

with open("req_all_pages.txt", "r") as f:
    lines = f.readlines()

def extract(dept_start, dept_end):
    inside = False
    subjects = []
    for line in lines:
        if dept_start in line:
            inside = True
            continue
        if dept_end in line and inside:
            break
        if inside:
            if "--- PAGE" in line:
                continue
            parts = line.strip().split()
            if len(parts) > 1:
                subj = parts[0]
                subj = re.sub(r'^[○◯◎□◇△▲●\*]+', '', subj)
                if len(subj) > 1 and not subj.isnumeric() and "科目" not in subj and "単位" not in subj and "備考" not in subj:
                    subjects.append(subj)
    return list(set(subjects))

# Mapping from department to start/end strings for 専門基礎 and 専門
depts = {
    "生命工学科": [
        ("生命工学科\n専門基礎科目", "生命工学科\n専門科目"),
        ("生命工学科\n専門科目", "生体医用システム工学科")
    ],
    "生体医用システム工学科": [
        ("生体医用システム工学科\n専門基礎科目", "生体医用システム工学科\n専門科目"),
        ("生体医用システム工学科\n専門科目", "応用化学科\n専門基礎科目")
    ],
    "応用化学科": [
        ("応用化学科\n専門基礎科目", "応用化学科\n専門科目"),
        ("応用化学科\n専門科目", "化学物理工学科\n専門基礎科目")
    ],
    "化学物理工学科": [
        ("化学物理工学科\n専門基礎科目", "化学物理工学科\n専門科目"),
        ("化学物理工学科\n専門科目", "機械システム工学科\n専門基礎科目")
    ],
    "機械システム工学科": [
        ("機械システム工学科\n専門基礎科目", "機械システム工学科\n専門科目"),
        ("機械システム工学科\n専門科目", "知能情報システム工学科\n専門基礎科目")
    ],
    "知能情報システム工学科": [
        ("知能情報システム工学科\n専門基礎科目", "数理情報工学コース　専門科目"),
        ("数理情報工学コース　専門科目", "教育職員免許状")
    ]
}

results = {}
for dept, ((kiso_start, kiso_end), (senmon_start, senmon_end)) in depts.items():
    kiso = extract(kiso_start, kiso_end)
    senmon = extract(senmon_start, senmon_end)
    results[dept] = {
        "kiso": kiso,
        "senmon": senmon
    }

with open("subjects.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Parsed subjects successfully.")
