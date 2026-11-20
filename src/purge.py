import asyncio, re, sys
from playwright.async_api import async_playwright
H=open('shell.html').read()
body=H[H.find('<body'):H.rfind('</html>')]
import json
css=json.loads(open('all.css').read())
extra=sys.argv[1] if len(sys.argv)>1 else ''
if extra: body=body.replace('<!--SCREENS-->',open(extra).read())
JS=r"""
(parts)=>{
 const strip=s=>s.replace(/(?<!\\)::?[a-zA-Z-]+(\((?:[^()]|\([^()]*\))*\))?/g,'').trim();
 const ok=sel=>sel.split(/(?<!\\),/).some(p=>{let s=strip(p); if(!s||/[>+~]$/.test(s)) s=s.replace(/[>+~]\s*$/,'').trim()||'*'; try{return !!document.querySelector(s);}catch(e){return true;}});
 const SEEN=new Set();
 const walk=(rules,ctx='')=>{let out='';for(const r of rules){
   if(r instanceof CSSStyleRule){ const k=ctx+r.cssText; if(!SEEN.has(k)&&ok(r.selectorText)){ SEEN.add(k); out+=r.cssText+'\n'; } }
   else if(r.cssRules&&!(r instanceof CSSKeyframesRule)){ const head0=r.cssText.slice(0,r.cssText.indexOf('{')); const inner=walk(r.cssRules,ctx+head0); if(inner){ const head=r.cssText.slice(0,r.cssText.indexOf('{')); out+=head+'{\n'+inner+'}\n'; } }
   else if(r instanceof CSSFontFaceRule){ if(/Inter var|primeicons/.test(r.style.fontFamily)&&!SEEN.has(r.cssText)){ SEEN.add(r.cssText); out+=r.cssText+'\n'; } }
   else if(!SEEN.has(ctx+r.cssText)){ SEEN.add(ctx+r.cssText); out+=r.cssText+'\n'; } }
  return out;};
 const seen=new Set(); let all='';
 for(const css of parts){ const sh=new CSSStyleSheet(); sh.replaceSync(css); for(const chunk of walk(sh.cssRules).split('\n')){ /* keep order, drop exact duplicate top-level lines only when they are whole rules */ all+=chunk+'\n'; } }
 return all;
}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.set_content('<!doctype html><html><head></head>'+body+'</html>')
        out=await pg.evaluate(JS,css)
        await b.close()
    out=out.replace('url("/a0e477f2f1f9d2376fde.woff2")','url("assets/inter-var.woff2")').replace('url("/e295f70fe3e2df296c7b.woff2")','url("assets/inter-var-italic.woff2")')
    out=re.sub(r'src: url\("/024b32cc7bf399b1a847\.woff2"\)[^;]*;','src: url("assets/primeicons.woff2") format("woff2");',out)
    out=re.sub(r'@font-face\s*\{[^}]*\}',lambda m: m.group(0) if 'assets/' in m.group(0) else '',out)
    open('shell.css','w').write(out); print('purged css',len(out))
asyncio.run(main())
