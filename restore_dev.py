import re

# 1. Restore the timeline HTML in development.html
try:
    with open('temp_dev.html', 'r', encoding='utf-16') as f:
        orig_html = f.read()
except:
    with open('temp_dev.html', 'r', encoding='utf-8') as f:
        orig_html = f.read()

with open('development.html', 'r', encoding='utf-8') as f:
    curr_html = f.read()

# Extract the original timeline from orig_html
m_orig = re.search(r'(<!-- CNCF — Grouped experience -->.*?</div>\s*</div>\s*</div>\s*</div>)', orig_html, re.DOTALL)
orig_timeline = m_orig.group(1) if m_orig else None

# Replace the current cards-grid--1 back to the original timeline
m_curr = re.search(r'(<!-- CNCF — Grouped experience -->.*?</div>\s*</div>\s*</div>)', curr_html, re.DOTALL)
if m_curr and orig_timeline:
    curr_html = curr_html[:m_curr.start(1)] + orig_timeline + curr_html[m_curr.end(1):]
    with open('development.html', 'w', encoding='utf-8') as f:
        f.write(curr_html)
    print("Restored original timeline HTML.")

# 2. Restore the original timeline CSS in style.css
try:
    with open('temp_style.css', 'r', encoding='utf-16') as f:
        orig_css = f.read()
except:
    with open('temp_style.css', 'r', encoding='utf-8') as f:
        orig_css = f.read()

with open('css/style.css', 'r', encoding='utf-8') as f:
    curr_css = f.read()

m_css = re.search(r'(\/\* ===== Experience Timeline ===== \*\/.*?\.exp-role__list li a \{\s*font-weight: 500;\s*\})', orig_css, re.DOTALL)
orig_timeline_css = m_css.group(1) if m_css else None

if orig_timeline_css:
    curr_css = curr_css.replace('/* ===== Featured Section (Homepage) ===== */', orig_timeline_css + '\n\n/* ===== Featured Section (Homepage) ===== */')
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(curr_css)
    print("Restored original timeline CSS.")
