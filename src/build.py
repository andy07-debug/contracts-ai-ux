# Build the Contracts AI demo on the real AppMod.AI (creative workspace) shell.
# shell = captured live DOM (in/*.html) + purged CSS; app layer = app.css + app.js + screens.html
import re, os, sys, json, shutil, subprocess
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out')
os.makedirs(OUT + '/assets', exist_ok=True)
S = lambda n: BeautifulSoup(open(f'{HERE}/in/{n}.html').read(), 'lxml')

home = S('home')
root = home.select_one('#root')

# ---------- images -> local assets ----------
IMG = {'Techolution Logo': 'assets/techolution-logo.svg', 'Creative Workspace Logo': 'assets/cw-logo.svg', 'Assistant Logo': 'assets/askmod-icon.svg'}
for img in root.find_all('img'):
    a = img.get('alt', '')
    if a in IMG: img['src'] = IMG[a]

# ---------- header ----------
lab = root.select_one('.custom-header-dropdown .p-dropdown-label')
lab.string = 'Contracts AI Mode'
dd = root.select_one('.custom-header-dropdown'); dd['data-act'] = 'dd-modes'; dd['id'] = 'mode-dd'
fb = root.select_one('.cw-header-feedback-card'); fb['id'] = 'feedback'
usage = fb.find_next_sibling('div'); usage['data-act'] = 'usage'; usage['id'] = 'usage'
hb = usage.parent.find_next_sibling('button'); hb['data-act'] = 'hamb'; hb['id'] = 'hamb-btn'
for i, st in enumerate(fb.select('svg')): pass

# ---------- chat column ----------
sb = root.select_one('#sidebar'); sb['id'] = 'sidebar'
sb.find('button', attrs={'data-testid': 'headerProjectsButton'})['data-act'] = 'projects'
sb.find('button', attrs={'aria-label': 'Filter Settings'})['data-act'] = 'filter'
sb.find('button', attrs={'aria-label': 'Start New Chat'})['data-act'] = 'newchat'
sb.find('button', attrs={'aria-label': 'Expand to right'})['data-act'] = 'chatmin'
tools = sb.find('button', attrs={'aria-label': 'Chat tools'}); tools['data-act'] = 'menu'; tools['id'] = 'menu-btn'
tools_wrap = tools.find_parent('div', class_='inline-block'); tools_wrap['id'] = 'menu-wrap'

dm = root.select_one('div.delayed-messages')
scroller = dm.find_parent(class_='overflow-y-auto'); scroller['id'] = 'msgscroll'
for c in scroller.find_all(recursive=False):
    if 'center-message-animation' in ' '.join(c.get('class', [])): c.decompose()
# keep three real messages as clone templates (bot with pills, user, "What I did")
kids = dm.find_all(recursive=False)
tpl_bot = next(k for k in kids if 'Suggested Actions' in k.get_text())
tpl_user = next(k for k in kids if 'items-end' in ' '.join(k.get('class', [])))
tpl_work = next(k for k in kids if 'What I did' in k.get_text())
dm.clear(); dm['id'] = 'msgs'

ta = sb.find('textarea'); ta['id'] = 'cin'
sb.find('button', attrs={'data-testid': 'ChatTextSendButton'})['data-act'] = 'send'
sb.find('button', attrs={'data-testid': 'ChatTextSendButton'})['id'] = 'send'
for t, a in [('Open guideline cart', 'guide'), ('Context Cart', 'cart'), ('Add', 'add')]:
    b = sb.find('button', attrs={'title': t}); b['data-act'] = a
clip = sb.find('button', attrs={'aria-controls': 'overlay_panel'}); clip['data-act'] = 'attach'
sp = sb.find('button', attrs={'data-testid': 'chatspeakerButton'}); sp['data-act'] = 'speaker'; sp['id'] = 'spk'
mi = sb.find('button', attrs={'data-testid': 'chatmicrophoneButton'}); mi['data-act'] = 'mic'; mi['id'] = 'mic'
down = sb.find('button', attrs={'data-testid': 'ChatScrollToBottomButton'})
if down: down.parent.decompose() if down.parent.name == 'div' and len(down.parent.find_all(recursive=False)) == 1 else down.decompose()

# ---------- right panel ----------
welcome = root.select_one('div.h-full.w-full.bg-white.p-8.overflow-y-auto')
welcome['id'] = 'scr-home'; welcome['class'] = welcome['class'] + ['scr', 'on']
holder = welcome.parent; holder['id'] = 'screens'
h1 = welcome.find('h1'); h1.string = 'Welcome to Contracts AI Mode'
FEAT = {'Contract Corpus Search': 'corpus', 'Contract & Clause Search': 'search', 'AI Assisted Redlining': 'redline', 'Compare Contracts': 'compare', 'Contract Compliance': 'compliance', 'Generate A Contract': 'generate'}
for h3 in welcome.find_all('h3'):
    k = FEAT.get(h3.get_text(strip=True))
    if k:
        card = h3.find_parent('div', class_='cursor-pointer') or h3.find_parent('div', class_='rounded-lg')
        card['data-act'] = 'feat'; card['data-f'] = k; card['id'] = 'feat-' + k
        if card.get('style') and 'gradient' in card['style']: del card['style']
fs = root.find('button', attrs={'title': 'Toggle Fullscreen'})
if fs: fs['data-act'] = 'fullscreen'
holder.append(BeautifulSoup('<!--SCREENS-->', 'html.parser'))

# ---------- overlays ----------
menu = S('menu').find(string=re.compile('Minimize Chat')).find_parent('div', class_='absolute')
menu['id'] = 'ov-menu'; menu['style'] = (menu.get('style', '') + ';display:none')
for b in menu.find_all('button'):
    t = b.get_text(' ', strip=True)
    b['data-act'] = 'mi'; b['data-m'] = t
tools_wrap.append(menu)

body = home.body
for el in list(body.find_all(recursive=False)):
    if el.get('id') != 'root': el.decompose()
dlg = S('filter').select_one('.p-dialog-mask'); dlg['id'] = 'ov-filter'; dlg['style'] = (dlg.get('style', '') + ';display:none')
for b in dlg.select('.p-dialog-header-close'): b['data-act'] = 'close-ov'
for b in dlg.find_all('button'):
    if b.get_text(strip=True) == 'Apply': b['data-act'] = 'filter-apply'
orgdd = dlg.select_one('.p-multiselect')
if orgdd: orgdd['data-act'] = 'org-dd'; orgdd['id'] = 'org-dd'
body.append(dlg)

modes = S('modes').select_one('.p-dropdown-panel'); modes['id'] = 'ov-modes'
modes['style'] = 'display:none;z-index:2102;position:absolute;min-width:520px;transform-origin:center top'
KEEP = ['AI Governance', 'Appmod.AI Mode', 'Cognitive AI Chat', 'Contract Intelligence Mode', 'Meeting Mode', 'Prompt Mode', 'Requirement AI', 'Transcription Mode', 'BrainStorm Mode']
for li in modes.select('li'):
    name = li.get_text('|', strip=True).split('|')[0]
    if name not in KEEP: li.decompose(); continue
    li['data-act'] = 'mode'; li['data-mode'] = name
    if name == 'Contract Intelligence Mode':
        li['data-mode'] = 'Contracts AI Mode'
        for s in li.find_all(string=re.compile('^Contract Intelligence Mode$')): s.replace_with('Contracts AI Mode')
modes_in = modes.find('input')
if modes_in: modes_in['id'] = 'mode-search'
body.append(modes)

hm = S('hamb').select_one('.p-sidebar-mask'); hm['id'] = 'ov-hamb'; hm['style'] = (hm.get('style', '') + ';display:none')
for b in hm.find_all('button'):
    if b.get('title') == 'Click to close sidebar': b['data-act'] = 'close-ov'
    if b.get('aria-label') == 'New Conversation': b['data-act'] = 'newchat'
for el in hm.find_all(string=re.compile('^(Settings|Sign out)$')):
    p = el.find_parent(['button', 'div', 'a']); p['data-act'] = 'hm-' + el.strip().split()[0].lower()
hin = hm.find('input')
if hin: hin['id'] = 'hist-search'
body.append(hm)

tpl = BeautifulSoup('<div id="tpl" style="display:none"></div>', 'html.parser').div
for n, el in [('bot', tpl_bot), ('user', tpl_user), ('work', tpl_work)]:
    el['data-tpl'] = n; tpl.append(el)
body.append(tpl)
body.append(BeautifulSoup('<!--OVERLAYS-->', 'html.parser'))

# strip personal text left anywhere
html = str(home)
html = re.sub(r'Kumar Aniket', 'there', html)
open(f'{HERE}/shell.html', 'w').write(html)

# ---------- CSS: union of all captures + the micro-frontend sheets ----------
parts = [open(f'{HERE}/in/{n}.css').read() for n in ['home', 'filter', 'modes', 'hamb', 'menu']]
parts += [open(f'{HERE}/assets/{f}').read() for f in ['96.d361e646a875c34d288d.css', '905.89e521346058e23bfd60.css']]
parts = [re.sub(r'@import[^;]*;', '', p) for p in parts]
css = json.dumps(parts)
open(f'{HERE}/all.css', 'w').write(css)
print('shell', len(html), 'css', len(css))
