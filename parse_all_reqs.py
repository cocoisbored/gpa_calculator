import sys
from PyPDF2 import PdfReader

reader = PdfReader("参考用の履修案内/2024risyu_kogakubu.pdf")
output = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        output.append(f"--- PAGE {i+1} ---\n{text}")

with open("req_all_pages.txt", "w") as f:
    f.write("\n".join(output))
print(f"Extracted {len(output)} pages to req_all_pages.txt")
