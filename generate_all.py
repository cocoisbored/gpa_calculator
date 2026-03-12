import re

with open("req_all_pages.txt", "r") as f:
    full_text = f.read()

def extract_subjects_by_regex(start_regex, end_regex):
    try:
        match_start = re.search(start_regex, full_text)
        if not match_start: return []
        s_idx = match_start.end()
        match_end = re.search(end_regex, full_text[s_idx:])
        if match_end:
            e_idx = s_idx + match_end.start()
            chunk = full_text[s_idx:e_idx]
        else:
            chunk = full_text[s_idx:]
    except ValueError:
        return []
        
    lines = chunk.split('\n')
    subjects = set()
    for line in lines:
        if "--- PAGE" in line:
            continue
        parts = line.strip().split()
        if len(parts) > 1:
            subj = parts[0]
            subj = re.sub(r'^[○◯◎□◇△▲●\*]+', '', subj)
            subj = re.sub(r'\(.*?\)', '', subj)
            if subj and len(subj) > 1 and not subj.isnumeric() and not "科目" in subj and not "単位" in subj and not "備考" in subj and not "工学部" in subj and not "教養" in subj:
                subjects.add(subj)
    return list(subjects)

# 1. 生命工学科
# PAGE 69-70 is 生命工学科 専門基礎科目, PAGE 71 is 専門科目
ls_base = extract_subjects_by_regex(r"生命工学科\s*専門基礎科目", r"区\s*分\s*授\s*業\s*科\s*目")
ls_base += extract_subjects_by_regex(r"生命工学科\s*専門基礎科目.*?備\s*考.*?\n", r"専門科目")
ls_senmon = extract_subjects_by_regex(r"生命工学科\s*専門科目\s*区\s*分\s*授\s*業\s*科\s*目.*?\n", r"備考")
# 2. 生体医用システム工学科  
bm_base = extract_subjects_by_regex(r"生体医用システム工学科\s*専門基礎科目.*?備\s*考.*?\n", r"専門科目")
bm_senmon = extract_subjects_by_regex(r"生体医用システム工学科\s*専門科目.*?備\s*考.*?\n", r"備考")
# 3. 応用化学科
ac_base = extract_subjects_by_regex(r"応用化学科\s*専門基礎科目.*?備\s*考.*?\n", r"専門科目")
ac_senmon = extract_subjects_by_regex(r"応用化学科\s*専門科目.*?備\s*考.*?\n", r"備考")
# 4. 化学物理工学科
cp_base = extract_subjects_by_regex(r"化学物理工学科\s*専門基礎科目.*?備\s*考.*?\n", r"化学物理工学科\s*専門科目")
cp_senmon = extract_subjects_by_regex(r"化学物理工学科\s*専門科目.*?備\s*考.*?\n", r"備考")
# 5. 機械システム工学科
me_base = extract_subjects_by_regex(r"機械システム工学科\s*専門基礎科目.*?備\s*考.*?\n", r"機械システム工学科\s*専門科目")
me_senmon = extract_subjects_by_regex(r"機械システム工学科\s*専門科目.*?備\s*考.*?\n", r"備考")
# 6. 知能情報システム工学科
ie_base = extract_subjects_by_regex(r"知能情報システム工学科\s*専門基礎科目.*?備\s*考.*?\n", r"数理情報工学コース")

print("Life Science Kiso:", len(ls_base))
print("Biomedical Kiso:", len(bm_base))
print("App Chem Kiso:", len(ac_base))
print("Chem Phys Kiso:", len(cp_base))
print("Mech Kiso:", len(me_base))
print("Intell Info Kiso:", len(ie_base))
