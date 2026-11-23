import re,sys,subprocess,os
H=open('shell.html').read()
H=H.replace('<div class="flex space-x-4 items-center cursor-pointer">','<div class="flex space-x-4 items-center cursor-pointer" data-act="logo" id="logo-home" title="Home">',1)  # logo = reset to home
body=H[H.find('<body'):H.rfind('</body>')]
body=body.replace('<!--SCREENS-->',open('screens.html').read())
defs=open('defs.svg').read()+'''<defs>
<symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 22h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></symbol>
<symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 3 5 6.3 5c2 0 3.2 1.1 3.9 2.2h3.6C14.5 6.1 15.7 5 17.7 5 21 5 22.7 8.5 21.2 11.4 19 15.6 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="3" width="12" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 7v12a2 2 0 0 0 2 2h9M11 8h6M11 12h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
<symbol id="i-scan" viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="11.5" cy="11.5" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 14l2.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-zoomin" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4-4M8 11h6M11 8v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-zoomout" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4-4M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-download" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="18.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-folderplus" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10.5v5M9.5 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="i-sort" viewBox="0 0 24 24"><path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-filter" viewBox="0 0 24 24"><path d="M3.5 5h17l-6.5 8v6l-4-2v-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><path d="M4 21V9l5-3v15M9 21V4h6v17M15 21V10l5 2v9M3 21h18M11.5 8h1M11.5 12h1M11.5 16h1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-branch" viewBox="0 0 24 24"><circle cx="6" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="19" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="7" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 7.2v9.6M18 9.2c0 5-12 3-12 7.6" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
<symbol id="i-wrench" viewBox="0 0 24 24"><path d="M14.5 6.5a4.5 4.5 0 0 0 5.8 5.8L13 19.6a2.1 2.1 0 0 1-3-3l7.3-7.3M14.5 6.5L17.5 3.5a4.5 4.5 0 0 0-5.8 5.8L4.4 16.6a2.1 2.1 0 0 0 3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>'''
over=defs+'''
<button class="chat-fab" data-act="chatmax" title="Open AskMod.AI"><img src="assets/askmod-icon.svg" alt=""></button>
<div class="modal-bg" id="modal-bg"><div class="modal" id="modal"></div></div>
<div class="toast" id="toast"><i><svg><use href="#i-check"/></svg></i><span id="toast-t"></span></div>
<svg id="cursor" viewBox="0 0 26 26"><path d="M4 2l16 10.5-7 1.6 4.2 7.6-3 1.6-4.2-7.7L4 20z" fill="#0E1A33" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
<div id="hud"><span class="tt">Guided demo</span><button id="b-prev" title="Previous step (←)">◀</button><span class="lbl" id="lbl">1 / 14</span><button id="b-next" title="Next step (→)">▶</button><button id="b-play" title="Play the whole review (Space)">Play</button></div>'''
body=body.replace('<!--OVERLAYS-->',over)
open('withscreens.html','w').write('<html><head></head>'+body+'</body></html>')
css=open('shell.css').read()
css=css.replace('b, strong { font-weight: bolder; }\n','b, strong { font-weight: bolder; }\nsmall { font-size: 80%; }\n',1)  # kept by hand in the live page
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
<style>{open('legal.css').read()}</style>
<style>{open('analysis.css').read()}</style>
</head>
{body}
<script>{open('data.js').read()}
{open('legal.js').read()}
{open('analysis.js').read()}
{open('app.js').read()}</script>
</body></html>'''
out=sys.argv[1] if len(sys.argv)>1 else 'out/index.html'
open(out,'w').write(page); print(out,len(page))
