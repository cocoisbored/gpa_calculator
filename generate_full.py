import re

def get_subjects_between(text, start, end):
    try:
        s_idx = text.index(start)
        if end:
            e_idx = text.index(end, s_idx)
            chunk = text[s_idx:e_idx]
        else:
            chunk = text[s_idx:]
    except ValueError:
        return []
        
    lines = chunk.split('\n')
    subjects = []
    inside = False
    for line in lines:
        if "--- PAGE" in line:
            continue
        parts = line.strip().split()
        if len(parts) > 1:
            subj = parts[0]
            subj = re.sub(r'^[○◯◎□◇△▲●\*]+', '', subj)
            if subj and len(subj) > 1 and not subj.isnumeric() and "科目" not in subj and "単位" not in subj:
                subjects.append(subj)
    return list(set(subjects))

with open("req_pages.txt", "r") as f:
    full_text = f.read()

# Mechanical Engineering
kiso_mech = get_subjects_between(full_text, "専門基礎科目工学部共通科目\n数学線形代数学", "両コース共通科目熱工学Ⅱ")
senmon_mech = get_subjects_between(full_text, "両コース共通科目熱工学Ⅱ", "知能情報システム工学科")

# Chemical Physics
kiso_chemphys = get_subjects_between(full_text, "専門基礎科目工学部共通科目\n数学線形代数学Ⅰ 畠中", "専門科目エネルギーエネルギープロセス")
senmon_chemphys = get_subjects_between(full_text, "専門科目エネルギーエネルギープロセス", "機械システム工学科")

print("Mech Kiso:", kiso_mech[:10])
print("Mech Senmon:", senmon_mech[:10])
print("ChemPhys Kiso:", kiso_chemphys[:10])
print("ChemPhys Senmon:", senmon_chemphys[:10])

