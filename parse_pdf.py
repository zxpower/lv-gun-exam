import pymupdf
import json
import re

doc = pymupdf.open('docs/Ierocu_eksamena_jautajumi_un_atbildes_2026.pdf')

lines_data = []
current_section = "Ieroču un munīcijas klasifikācija"

for page_idx, page in enumerate(doc):
    page_num = page_idx + 1
    page_text = page.get_text("text")
    for line in page_text.split('\n'):
        line_s = line.strip()
        if re.match(r'^[I|V|X]+\.\s+', line_s) and len(line_s) < 100:
            current_section = line_s

    blocks = page.get_text("dict", flags=pymupdf.TEXT_PRESERVE_WHITESPACE)["blocks"]
    for b in blocks:
        if "lines" in b:
            for l in b["lines"]:
                full_text = "".join(s["text"] for s in l["spans"])
                has_red = any(s["color"] == 16711680 and s["text"].strip() for s in l["spans"])
                if full_text.strip():
                    lines_data.append({
                        "section": current_section,
                        "text": full_text,
                        "is_red": has_red
                    })

questions = []
curr_q_num = None
curr_q_text = []
curr_section = "Ieroču un munīcijas klasifikācija"
curr_options = {}
curr_correct = {}
curr_opt = None

expected_num = 1

for item in lines_data:
    text = item["text"]
    section = item["section"]
    is_red = item["is_red"]
    
    if re.match(r'^[I|V|X]+\.\s+', text.strip()) and len(text.strip()) < 100:
        curr_section = text.strip()
        continue

    m_q = re.match(r'^([0-9]+)\.\s*(.*)', text)
    if m_q and int(m_q.group(1)) == expected_num:
        if curr_q_num is not None:
            questions.append({
                "id": curr_q_num,
                "section": curr_section,
                "question": " ".join(" ".join(curr_q_text).split()),
                "options": {
                    k: {"text": " ".join(curr_options[k].split()), "correct": curr_correct[k]}
                    for k in curr_options if curr_options[k].strip()
                }
            })
        
        curr_q_num = int(m_q.group(1))
        expected_num += 1
        curr_q_text = [m_q.group(2)]
        curr_options = {}
        curr_correct = {}
        curr_opt = None
        continue

    # Option pattern (a, b, c, d, e, f, g, h, etc.)
    m_opt = re.match(r'^([a-z])\.\s*(.*)', text)
    if m_opt and curr_q_num is not None:
        curr_opt = m_opt.group(1)
        curr_options[curr_opt] = m_opt.group(2)
        curr_correct[curr_opt] = is_red
        continue

    if curr_opt is not None and curr_opt in curr_options:
        curr_options[curr_opt] += " " + text
        if is_red:
            curr_correct[curr_opt] = True
    elif curr_q_num is not None:
        curr_q_text.append(text)

if curr_q_num is not None:
    questions.append({
        "id": curr_q_num,
        "section": curr_section,
        "question": " ".join(" ".join(curr_q_text).split()),
        "options": {
            k: {"text": " ".join(curr_options[k].split()), "correct": curr_correct[k]}
            for k in curr_options if curr_options[k].strip()
        }
    })

print(f"Parsed {len(questions)} questions.")
with open("questions.json", "w") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
