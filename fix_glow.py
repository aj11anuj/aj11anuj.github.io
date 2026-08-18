import re

with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add glow to exp-role__dot
css = re.sub(
    r'\.exp-role__dot \{([^}]*?box-shadow:[^}]*?)\}',
    r'.exp-role__dot {\1; box-shadow: 0 0 0 2px var(--bg-card), 0 0 8px 1px rgba(252, 186, 40, 0.6); }',
    css
)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Added glow to dot.")
