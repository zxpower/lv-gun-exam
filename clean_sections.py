import json

with open('questions.json') as f:
    qs = json.load(f)

for q in qs:
    sec = q['section']
    # Clean up section formatting
    if sec.startswith('IV.'):
        q['section'] = 'IV. Šaujamieroču, to būtisko sastāvdaļu un munīcijas un speciālo līdzekļu glabāšana un nēsāšana'
    elif sec.startswith('V.'):
        q['section'] = 'V. Šaujamieroču, to maināmo būtisko sastāvdaļu un munīcijas un lielas enerģijas pneimatisko ieroču realizācija, iegādāšan realizācija, iegādāšanās, reģistrācija un pārvietošana'
    elif sec.startswith('IX.'):
        q['section'] = 'IX. Šaujamieroča un lielas enerģijas pneimatiskā ieroča uzbūve, darbības principi, darbības traucējumi un to novēršanas veidi'

with open('questions.json', 'w') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

print("Cleaned up section names.")
