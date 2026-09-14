from pathlib import Path
import re

home = Path('components/HomepageExperience.js')
s = home.read_text(encoding='utf-8')
s = s.replace(
    "ArrowRight, BadgeCheck, ChevronRight, Clock3, ExternalLink, PackageCheck, Search, ShieldCheck, ShoppingCart, Truck",
    "ArrowRight, BadgeCheck, ChevronRight, Clock3, ExternalLink, PackageCheck, Search, ShieldCheck, ShoppingCart, Truck, Activity, Table2"
)
s = s.replace("[toast,setToast]=useState('')", "[toast,setToast]=useState(''),[liveFilter,setLiveFilter]=useState('all'),[expanded,setExpanded]=useState(false),[lastSync,setLastSync]=useState(Date.now()),[syncAge,setSyncAge]=useState(0)")
s = s.replace("fetch('/api/products?limit=8'", "fetch('/api/products?limit=233'")
s = s.replace("setCount(Number(p.count)||Number(p.meta?.total)||0);setDataError(false)", "setCount(Number(p.count)||Number(p.meta?.total)||0);setLastSync(Date.now());setDataError(false)")
marker = " const filtered=useMemo(()=>"
insert = " const total=count||products.length||233\n useEffect(()=>{const t=window.setInterval(()=>setSyncAge(Math.max(0,Math.floor((Date.now()-lastSync)/1000))),1000);return()=>window.clearInterval(t)},[lastSync])\n const metrics=useMemo(()=>{const inStock=products.filter(p=>stock(p['Variant Inventory Qty'])>10).length;const low=products.filter(p=>{const s=stock(p['Variant Inventory Qty']);return s>0&&s<=10}).length;const out=products.filter(p=>stock(p['Variant Inventory Qty'])<=0).length;return{inStock,low,out}},[products])\n"
if marker not in s:
    raise SystemExit('homepage marker not found')
s = s.replace(marker, insert + marker, 1)
s = s.replace(
    "const q=query.trim().toLowerCase();if(!q)return products.slice(0,4);return products.filter(p=>[p.Title,p.Handle,p.Vendor,p.Type,p.Tags,p['Variant SKU']].filter(Boolean).join(' ').toLowerCase().includes(q)).slice(0,4)",
    "const q=query.trim().toLowerCase();return products.filter(p=>{const text=[p.Title,p.Handle,p.Vendor,p.Type,p.Tags,p['Variant SKU']].filter(Boolean).join(' ').toLowerCase();return(!q||text.includes(q))&&(liveFilter==='all'||text.includes(liveFilter))}).slice(0,4)"
)
pat = re.compile(r'<aside className="r2-hp-final-live" data-r2-reveal>.*?</aside>', re.S)
new = '''<aside className="r2-hp-final-live r2-live-enhanced" data-r2-reveal><div className="r2-live-top"><span><i/> LIVE CATALOG</span><small><Activity size={11}/> SYNC: ACTIVE · {syncAge}s AGO</small></div><strong className="r2-live-count">{loading?'—':total}<small> ACTIVE SKUs</small></strong><div className="r2-live-area"><div className="r2-live-area-line"/><div className="r2-live-area-fill"/></div><div className="r2-live-metrics"><div><b>{metrics.inStock}</b><span><i className="in"/> IN STOCK</span></div><div><b>{metrics.low}</b><span><i className="low"/> LOW</span></div><div><b>{metrics.out}</b><span><i className="out"/> OUT</span></div></div><div className="r2-live-filters">{[['all','Semua'],['kretek','Kretek'],['premium','Premium'],['tembakau','Tembakau']].map(([v,l])=><button type="button" key={v} className={liveFilter===v?'active':''} onClick={()=>setLiveFilter(v)}>{l}</button>)}</div><button className="r2-live-expand" type="button" onClick={()=>setExpanded(v=>!v)}><Table2 size={14}/>{expanded?'TUTUP DETAIL':'LIHAT DETAIL'}<ChevronRight size={14} className={expanded?'rot':''}/></button>{expanded&&<div className="r2-live-table"><div><span>SKU</span><span>STOK</span></div>{products.slice(0,6).map((p,i)=><div key={p['Variant SKU']||i}><span title={p.Title}>{p['Variant SKU']||p.Title||'—'}</span><b>{stock(p['Variant Inventory Qty'])}</b></div>)}</div>}<footer><span>CATALOG STATUS</span><b className={dataError?'bad':''}><i/> {dataError?'CHECK':'OPERATIONAL'}</b></footer></aside>'''
if not pat.search(s):
    raise SystemExit('live catalog aside not found')
s = pat.sub(new, s, count=1)
home.write_text(s, encoding='utf-8')

css = Path('styles/r2-home-precision-v42.css')
addon = r'''

/* HOMEPAGE LIVE CATALOG V43 — scoped visual/interaction layer */
.r2-live-enhanced{min-height:0!important;padding:20px!important}
.r2-live-top{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#d7e6fb!important}
.r2-live-top span,.r2-live-top small{display:flex!important;align-items:center!important;gap:4px!important}
.r2-live-top small{font-size:6px!important;color:#9fb4cd!important;white-space:nowrap!important}
.r2-live-top>span>i{display:inline-block!important;width:7px!important;height:7px!important;border-radius:50%!important;background:#63dfa0!important;box-shadow:0 0 0 5px rgba(99,223,160,.12)!important;margin-right:5px!important;animation:r2LivePulse 1.8s infinite!important}
.r2-live-count{display:flex!important;align-items:baseline!important;gap:8px!important;margin:17px 0 3px!important;font-size:46px!important;letter-spacing:-.06em!important}
.r2-live-count small{font-size:8px!important;letter-spacing:.12em!important;color:#9fb4cd!important}
.r2-live-area{height:112px!important;position:relative!important;margin:0 0 2px!important;overflow:hidden!important;border-bottom:1px solid rgba(255,255,255,.08)!important}
.r2-live-area:before{content:""!important;position:absolute!important;inset:0!important;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.045) 0,rgba(255,255,255,.045) 1px,transparent 1px,transparent 28px)!important}
.r2-live-area-line{position:absolute!important;left:-3%!important;right:-3%!important;bottom:25%!important;height:70%!important;background:linear-gradient(135deg,transparent 0 8%,#79b9ff 9% 10%,transparent 11% 19%,#79b9ff 20% 21%,transparent 22% 31%,#79b9ff 32% 33%,transparent 34% 43%,#79b9ff 44% 45%,transparent 46% 55%,#79b9ff 56% 57%,transparent 58% 68%,#79b9ff 69% 70%,transparent 71% 82%,#79b9ff 83% 84%,transparent 85%)!important;filter:drop-shadow(0 0 5px rgba(118,181,255,.3))!important;transform:skewY(-2deg)!important}
.r2-live-area-fill{position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:58%!important;background:linear-gradient(180deg,rgba(90,160,255,.24),rgba(90,160,255,0))!important;clip-path:polygon(0 75%,10% 61%,20% 68%,31% 42%,42% 55%,54% 28%,66% 39%,78% 15%,89% 27%,100% 8%,100% 100%,0 100%)!important}
.r2-live-metrics{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:7px!important;margin-top:7px!important}
.r2-live-metrics>div{padding:8px 7px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:10px!important;background:rgba(255,255,255,.045)!important}
.r2-live-metrics b{display:block!important;font-size:13px!important;color:#fff!important}.r2-live-metrics span{display:flex!important;align-items:center!important;gap:4px!important;margin-top:3px!important;color:#9fb4cd!important;font-size:5.5px!important;font-weight:900!important;letter-spacing:.06em!important}.r2-live-metrics i{width:5px!important;height:5px!important;border-radius:50%!important;display:inline-block!important}.r2-live-metrics i.in{background:#55d99a!important}.r2-live-metrics i.low{background:#e5c36f!important}.r2-live-metrics i.out{background:#ef6f78!important}
.r2-live-filters{display:flex!important;gap:5px!important;overflow:auto!important;padding:9px 0 7px!important;scrollbar-width:none!important}.r2-live-filters::-webkit-scrollbar{display:none}.r2-live-filters button{flex:0 0 auto!important;padding:6px 8px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.045)!important;color:#afc0d4!important;font-size:6.5px!important;font-weight:900!important;cursor:pointer!important}.r2-live-filters button.active{background:#e9f3ff!important;color:#1766d5!important;border-color:#e9f3ff!important}
.r2-live-expand{width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;border:0!important;border-top:1px solid rgba(255,255,255,.09)!important;padding:9px 0 7px!important;background:none!important;color:#c7d8ec!important;font-size:6.5px!important;font-weight:950!important;letter-spacing:.1em!important;cursor:pointer!important}.r2-live-expand .rot{transform:rotate(90deg)!important}
.r2-live-table{border:1px solid rgba(255,255,255,.09)!important;border-radius:10px!important;overflow:hidden!important;margin-bottom:8px!important}.r2-live-table>div{display:grid!important;grid-template-columns:1fr 48px!important;gap:8px!important;padding:7px 8px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;font-size:6.5px!important}.r2-live-table>div:last-child{border-bottom:0!important}.r2-live-table>div>span:first-child{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#b6c7da!important}.r2-live-table>div:first-child{color:#8ea5bf!important;font-weight:900!important;letter-spacing:.1em!important}.r2-live-table b{text-align:right!important;color:#fff!important}
.r2-live-enhanced footer{display:flex!important;justify-content:space-between!important;padding-top:10px!important;margin-top:3px!important;border-top:1px solid rgba(255,255,255,.1)!important;font-size:6.5px!important;letter-spacing:.12em!important;color:#8fa5bf!important}.r2-live-enhanced footer b{display:flex!important;align-items:center!important;gap:5px!important;color:#74e4a6!important}.r2-live-enhanced footer b i{width:5px!important;height:5px!important;border-radius:50%!important;background:#74e4a6!important;animation:r2LivePulse 1.8s infinite!important}.r2-live-enhanced footer b.bad{color:#efb06f!important}.r2-live-enhanced footer b.bad i{background:#efb06f!important}
@keyframes r2LivePulse{50%{box-shadow:0 0 0 8px rgba(99,223,160,0)!important;opacity:.72}}
@media(max-width:620px){.r2-live-enhanced{padding:15px!important}.r2-live-top small{font-size:5px!important}.r2-live-count{font-size:37px!important;margin:12px 0 2px!important}.r2-live-area{height:96px!important}.r2-live-metrics>div{padding:7px 5px!important}.r2-live-metrics b{font-size:11px!important}.r2-live-metrics span{font-size:5px!important}.r2-live-filters button{font-size:6px!important;padding:6px 7px!important}.r2-live-table>div{font-size:6px!important}}
@media(prefers-reduced-motion:reduce){.r2-live-top>span>i,.r2-live-enhanced footer b i{animation:none!important}}
'''
old = css.read_text(encoding='utf-8')
if 'HOMEPAGE LIVE CATALOG V43' not in old:
    css.write_text(old + addon, encoding='utf-8')
PY