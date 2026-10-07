const fs=require('fs')
const path=require('path')
const root=process.cwd()
const stylesRoot=path.join(root,'styles')

function walk(dir,out=[]){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(['node_modules','.next','.git'].includes(e.name)) continue
    const p=path.join(dir,e.name)
    if(e.isDirectory()) walk(p,out)
    else if(e.name.endsWith('.css')) out.push(p)
  }
  return out
}
function stripComments(s){return s.replace(/\/\*[\s\S]*?\*\//g,'')}
function parse(css,file){
  const s=stripComments(css), out=[], stack=[], ruleStarts=[]
  let depth=0,last=0
  for(let i=0;i<s.length;i++){
    const c=s[i]
    if(c==='{'){
      const pre=s.slice(last,i).trim()
      depth++
      ruleStarts.push({pre,depth})
      last=i+1
    }else if(c==='}'){
      const frame=ruleStarts.pop()
      if(!frame){last=i+1;continue}
      const body=s.slice(last,i).trim()
      if(frame.pre.startsWith('@')){
        if(frame.pre.startsWith('@media')||frame.pre.startsWith('@supports')||frame.pre.startsWith('@container')||frame.pre.startsWith('@layer')||frame.pre.startsWith('@scope')) stack.push(frame.pre)
      }else if(body){
        const context=stack.join(' && ')
        const selectors=frame.pre.split(',').map(x=>x.trim()).filter(Boolean)
        for(const selector of selectors){
          if(selector.includes('@')||selector.startsWith('--')) continue
          for(const d of body.split(';').map(x=>x.trim()).filter(Boolean)){
            const idx=d.indexOf(':')
            if(idx<1) continue
            const prop=d.slice(0,idx).trim()
            const val=d.slice(idx+1).replace(/\s+/g,' ').trim()
            out.push({file:path.relative(root,file),selector,prop,val,context})
          }
        }
      }
      if(frame.pre.startsWith('@media')||frame.pre.startsWith('@supports')||frame.pre.startsWith('@container')||frame.pre.startsWith('@layer')||frame.pre.startsWith('@scope')) stack.pop()
      depth--
      last=i+1
    }
  }
  return out
}
function key(x){return JSON.stringify([x.selector,x.prop,x.val,x.context])}
const entries=walk(stylesRoot).flatMap(f=>parse(fs.readFileSync(f,'utf8'),f))
const groups=new Map()
for(const e of entries){const k=key(e);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e.file)}
const candidates=[...groups.entries()]
 .filter(([,files])=>new Set(files).size>1)
 .map(([k,files])=>({key:JSON.parse(k),files:[...new Set(files)]}))
 .filter(x=>x.files.length>1)
console.log(JSON.stringify({
  cssFiles:walk(stylesRoot).length,
  declarations:entries.length,
  duplicateDeclarationGroups:candidates.length,
  candidates:candidates.slice(0,300),
  policy:'Only exact selector+property+value matches within the same at-rule context are candidates. Do not delete when selector semantics, nesting, imports or cascade context differ.'
},null,2))
