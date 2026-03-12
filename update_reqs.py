import json

with open("subjects.json", "r", encoding="utf-8") as f:
    subs = json.load(f)

with open("REQUIREMENTS_DATA.js", "r", encoding="utf-8") as f:
    js_code = f.read()

# Define the string representation of arrays
sub_defs = "// AUTO-GENERATED SUBJECT LISTS\n"
for dept, data in subs.items():
    kiso_str = json.dumps(data["kiso"], ensure_ascii=False)
    senmon_str = json.dumps(data["senmon"], ensure_ascii=False)
    sub_defs += f"const {dept}_kiso = {kiso_str};\n"
    sub_defs += f"const {dept}_senmon = {senmon_str};\n"

if "// AUTO-GENERATED SUBJECT LISTS" not in js_code:
    js_code = js_code.replace("const REQUIREMENTS = {", sub_defs + "\nconst REQUIREMENTS = {")

import re

# Add validSubjects to existing rules
def replace_valid_subjects(match):
    dept = match.group(1)
    dept_block = match.group(0)
    
    # 専門基礎科目群
    dept_block = re.sub(
        r"(target:\s*[\"']専門基礎科目群[\"'],\s*required:\s*\d+,\s*label:\s*[\"'][^\"']+[\"'])",
        rf"\1, validSubjects: {dept}_kiso",
        dept_block
    )
    
    # 専門科目群
    dept_block = re.sub(
        r"(target:\s*[\"']専門科目群[\"'],\s*required:\s*\d+,\s*label:\s*[\"'][^\"']+[\"'])",
        rf"\1, validSubjects: {dept}_senmon",
        dept_block
    )
    return dept_block

# Using regex to find each department block and update validSubjects
departments = ["生命工学科", "生体医用システム工学科", "応用化学科", "化学物理工学科", "機械システム工学科", "知能情報システム工学科"]

for dept in departments:
    # A bit manual: Search for the department name as a key and replace inside
    pattern = rf'("{dept}":\s*{{(?:[^{{}}]*|{{(?:[^{{}}]*|{{[^}}]*}})*}})*}})'
    match = re.search(pattern, js_code)
    if match:
        new_block = match.group(1)
        new_block = re.sub(
            r"(\{ type: 'category', target: \"専門基礎科目群\", required: \d+, label: \"[^\"]+\"\s*)(})",
            rf"\1, validSubjects: {dept}_kiso \2",
            new_block
        )
        new_block = re.sub(
            r"(\{ type: 'category', target: \"専門科目群\", required: \d+, label: \"[^\"]+\"\s*)(})",
            rf"\1, validSubjects: {dept}_senmon \2",
            new_block
        )
        js_code = js_code.replace(match.group(1), new_block)

with open("REQUIREMENTS_DATA.js", "w", encoding="utf-8") as f:
    f.write(js_code)
print("Updated REQUIREMENTS_DATA.js")
