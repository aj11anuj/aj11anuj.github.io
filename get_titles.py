import re

with open('research.html', 'r', encoding='utf-8') as f:
    html = f.read()

titles = re.findall(r'<h3 class="card__title">(.*?)</h3>', html)
for t in titles:
    print(t)
