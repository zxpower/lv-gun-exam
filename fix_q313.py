import json

with open('questions.json') as f:
    qs = json.load(f)

for q in qs:
    if q['id'] == 313:
        # fix option key 'a' (visas atbildes ir pareizas) to 'd' and mark correct
        if 'a' in q['options'] and 'visas atbildes' in q['options']['a']['text']:
            q['options']['d'] = {'text': q['options']['a']['text'], 'correct': True}
            del q['options']['a']

with open('questions.json', 'w') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

print("Fixed question 313.")
