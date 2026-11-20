import re,sys,subprocess,os
H=open('shell.html').read()
body=H[H.find('<body'):H.rfind('</body>')]
body=body.replace('<!--SCREENS-->',open('screens.html').read())
defs=open('../cux/defs.svg').read()+'''<defs>
<symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 22h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></symbol>
</defs></svg>'''
over=defs+'''
<button class="chat-fab" data-act="chatmax" title="Open AskMod.AI"><img src="assets/askmod-icon.svg" alt=""></button>
<div class="modal-bg" id="modal-bg"><div class="modal" id="modal"></div></div>
<div class="toast" id="toast"><i><svg><use href="#i-check"/></svg></i><span id="toast-t"></span></div>
<svg id="cursor" viewBox="0 0 26 26"><path d="M4 2l16 10.5-7 1.6 4.2 7.6-3 1.6-4.2-7.7L4 20z" fill="#0E1A33" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
<div id="hud"><span class="tt">Guided demo</span><button id="b-prev" title="Previous step (←)">◀</button><span class="lbl" id="lbl">1 / 14</span><button id="b-next" title="Next step (→)">▶</button><button id="b-play" title="Play the whole review (Space)">Play</button></div>
<div class="demo-badge">Demo · sample data, not a real agency or contract</div>'''
body=body.replace('<!--OVERLAYS-->',over)
open('withscreens.html','w').write('<html><head></head>'+body+'</body></html>')
css=open('shell.css').read()
page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contracts AI Mode · CW | Techolution</title>
<script>(function(){{var q=parseFloat(new URLSearchParams(location.search).get('zoom'));var z=q>0?q:Math.min(1,Math.max(.75,innerWidth/1680));document.documentElement.style.zoom=z;document.documentElement.style.setProperty('--z',z);}})();</script>
<meta name="description" content="Interactive demo of Contracts AI in the Techolution creative workspace (AppMod.AI). Sample data only.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>{css}</style>
<style>{open('legacy.css').read()}</style>
<style>{open('app.css').read()}</style>
</head>
{body}
<script>{open('data.js').read()}
{open('app.js').read()}</script>
</body></html>'''
out=sys.argv[1] if len(sys.argv)>1 else 'out/index.html'
open(out,'w').write(page); print(out,len(page))
