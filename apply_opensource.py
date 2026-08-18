import re

# 1. Update CSS
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the current .exp-role__desc block
old_desc = r'\.exp-role__desc \{\s*font-size: 0\.85rem;\s*color: var\(--text-secondary\);\s*line-height: 1\.7;\s*\}'
new_desc = """.exp-role__desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.7;
  background: var(--bg-card);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 0.75rem;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}

.exp-role__desc:hover {
  border-color: rgba(252, 186, 40, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.repo-tag {
  display: inline-block;
  background: rgba(252, 186, 40, 0.1);
  color: var(--accent);
  border: 1px solid rgba(252, 186, 40, 0.3);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
  margin-bottom: 0.5rem;
}

.gh-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  vertical-align: middle;
  background: rgba(255,255,255,0.05);
}

.gh-badge:hover {
  background: rgba(255,255,255,0.1);
}

.gh-badge svg {
  width: 12px;
  height: 12px;
}

.gh-badge--pr { color: #a371f7; border-color: rgba(163, 113, 247, 0.3); background: rgba(163, 113, 247, 0.05); }
.gh-badge--pr:hover { background: rgba(163, 113, 247, 0.15); border-color: rgba(163, 113, 247, 0.5); }

.gh-badge--issue { color: #3fb950; border-color: rgba(63, 185, 80, 0.3); background: rgba(63, 185, 80, 0.05); }
.gh-badge--issue:hover { background: rgba(63, 185, 80, 0.15); border-color: rgba(63, 185, 80, 0.5); }

.gh-badge--review { color: #58a6ff; border-color: rgba(88, 166, 255, 0.3); background: rgba(88, 166, 255, 0.05); }
.gh-badge--review:hover { background: rgba(88, 166, 255, 0.15); border-color: rgba(88, 166, 255, 0.5); }
"""

css = re.sub(old_desc, new_desc, css)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update HTML
with open('development.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Icons
icon_pr = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"></path></svg>'
icon_issue = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"></path></svg>'
icon_review = '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 0110.535-5.096l.877-.877a.25.25 0 01.427.177v3.546a.25.25 0 01-.25.25H9.543a.25.25 0 01-.177-.427l1.01-1.01A5.002 5.002 0 1013 8a.75.75 0 011.5 0 6.5 6.5 0 11-13 0z"></path></svg>'

# First, replace the links in the html.
# Notable Contributions List 1:
# <li>Localize the kubernetes page documentation | <a href="https://github.com/cncf/glossary/pull/1615" target="_blank">[View]</a></li>
html = html.replace(
    '<li>Localize the kubernetes page documentation | <a\n                        href="https://github.com/cncf/glossary/pull/1615" target="_blank">[View]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">cncf/glossary</span></div>Localize the kubernetes page documentation <a href="https://github.com/cncf/glossary/pull/1615" target="_blank" class="gh-badge gh-badge--pr">{icon_pr} Merged</a></li>'
)

html = html.replace(
    '<li>Localize Edge Computing page documentation | <a\n                        href="https://github.com/cncf/glossary/pull/2773" target="_blank">[View]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">cncf/glossary</span></div>Localize Edge Computing page documentation <a href="https://github.com/cncf/glossary/pull/2773" target="_blank" class="gh-badge gh-badge--pr">{icon_pr} Merged</a></li>'
)

html = html.replace(
    '<li>Update main branch with Hindi localization branch | <a\n                        href="https://github.com/cncf/glossary/pull/2625" target="_blank">[View]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">cncf/glossary</span></div>Update main branch with Hindi localization branch <a href="https://github.com/cncf/glossary/pull/2625" target="_blank" class="gh-badge gh-badge--pr">{icon_pr} Merged</a></li>'
)

# Notable Contributions List 2:
# <li>PowerShell Script needs to be written to launch a container on Windows | <a href="https://github.com/kubernetes/website/issues/42861" target="_blank">[View Issue]</a></li>
html = html.replace(
    '<li>PowerShell Script needs to be written to launch a container on Windows | <a\n                        href="https://github.com/kubernetes/website/issues/42861" target="_blank">[View Issue]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>PowerShell Script needs to be written to launch a container on Windows <a href="https://github.com/kubernetes/website/issues/42861" target="_blank" class="gh-badge gh-badge--issue">{icon_issue} Issue</a></li>'
)

html = html.replace(
    '<li>Text-image overlapping issue at App Direct page for smaller viewports | <a\n                        href="https://github.com/kubernetes/website/issues/43019" target="_blank">[View Issue]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>Text-image overlapping issue at App Direct page for smaller viewports <a href="https://github.com/kubernetes/website/issues/43019" target="_blank" class="gh-badge gh-badge--issue">{icon_issue} Issue</a></li>'
)

html = html.replace(
    '<li>Localize glossary documentation for workload page|\n                      <a href="https://github.com/kubernetes/website/pull/42549" target="_blank">[View PR]</a>\n                    </li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>Localize glossary documentation for workload page <a href="https://github.com/kubernetes/website/pull/42549" target="_blank" class="gh-badge gh-badge--pr">{icon_pr} Merged</a></li>'
)

html = html.replace(
    '<li>Updated cmds to deploy and test the site locally |\n                      <a href="https://github.com/kubernetes/website/pull/43044" target="_blank">[View PR]</a>\n                    </li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>Updated cmds to deploy and test the site locally <a href="https://github.com/kubernetes/website/pull/43044" target="_blank" class="gh-badge gh-badge--pr">{icon_pr} Merged</a></li>'
)

html = html.replace(
    '<li>Improve Kubernetes tutorial for explaining Services |\n                      <a href="https://github.com/kubernetes/website/pull/43503" target="_blank">[View Review]</a>\n                    </li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>Improve Kubernetes tutorial for explaining Services <a href="https://github.com/kubernetes/website/pull/43503" target="_blank" class="gh-badge gh-badge--review">{icon_review} Reviewed</a></li>'
)

html = html.replace(
    '<li>Add Spotlight Blog for Release Team Subproject | <a\n                        href="https://github.com/kubernetes/website/pull/42797" target="_blank">[View Review]</a></li>',
    f'<li><div style="margin-bottom:0.25rem"><span class="repo-tag">kubernetes/website</span></div>Add Spotlight Blog for Release Team Subproject <a href="https://github.com/kubernetes/website/pull/42797" target="_blank" class="gh-badge gh-badge--review">{icon_review} Reviewed</a></li>'
)

# Add spacing between list items for the badges to breathe
html = html.replace('.exp-role__list {\n                    <li>', '.exp-role__list" style="display:flex;flex-direction:column;gap:0.75rem">\n                    <li>')
html = html.replace('<ul class="exp-role__list">', '<ul class="exp-role__list" style="display:flex;flex-direction:column;gap:0.75rem">')

with open('development.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Applied HTML & CSS updates.")
