import os

files = ['development.html', 'personal.html', 'research.html', 'services.html']
font_tag = '<link href="https://fonts.googleapis.com/css2?family=Oooh+Baby&display=swap" rel="stylesheet">\n  '

for f in files:
    if not os.path.exists(f): continue
    content = open(f, 'r', encoding='utf-8').read()
    if 'Oooh+Baby' not in content:
        content = content.replace('<link rel="stylesheet" href="css/style.css">', font_tag + '<link rel="stylesheet" href="css/style.css">')
        open(f, 'w', encoding='utf-8').write(content)
        print(f'Updated {f}')
