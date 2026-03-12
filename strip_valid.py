import re

with open("REQUIREMENTS_DATA.js", "r") as f:
    text = f.read()

# remove validSubjects: xxx
text = re.sub(r',\s*validSubjects:\s*[^ }]+', '', text)

# remove AUTO-GENERATED SUBJECT LISTS block
text = re.sub(r'// AUTO-GENERATED SUBJECT LISTS.*?(?=const REQUIREMENTS = {)', '', text, flags=re.DOTALL)

with open("REQUIREMENTS_DATA.js", "w") as f:
    f.write(text)

