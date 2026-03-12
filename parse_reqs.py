import sys
from PyPDF2 import PdfReader

reader = PdfReader("参考用の履修案内/2024risyu_kogakubu.pdf")
output = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text and ("卒業要件" in text or "単位数" in text or "必修" in text):
        if "知能情報" in text or "機械システム" in text or "生命工学" in text or "応用化学" in text or "化学物理" in text or "生体医用" in text:
            output.append(f"--- PAGE {i+1} ---\n{text}")

with open("req_pages.txt", "w") as f:
    f.write("\n".join(output))
print(f"Extracted {len(output)} pages.")
