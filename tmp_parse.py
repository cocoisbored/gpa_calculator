import sys
from PyPDF2 import PdfReader

reader = PdfReader("参考用の履修案内/2022risyu_kogakubu.pdf")
num_pages = len(reader.pages)
output = []
for i in range(min(50, num_pages)):
    page = reader.pages[i]
    text = page.extract_text()
    if text and ("卒業" in text or "要件" in text or "単位" in text):
        output.append(f"--- PAGE {i+1} ---\n{text[:500]}")

with open("pdf_out.txt", "w") as f:
    f.write("\n".join(output))
