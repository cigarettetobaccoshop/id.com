import { useEffect, useState } from 'react'

export default function BrandAssetLoader(){
  const [visible,setVisible]=useState(true)
  useEffect(()=>{
    const hide=()=>{
      setVisible(false)
      window.dispatchEvent(new CustomEvent('r2:loader-complete'))
    }
    const timer=window.setTimeout(hide,700)
    if(document.readyState==='complete') window.setTimeout(hide,180)
    else window.addEventListener('load',hide,{once:true})
    return()=>{window.clearTimeout(timer);window.removeEventListener('load',hide)}
  },[])
  useEffect(()=>{
    const enhance=()=>{
      document.querySelectorAll('.catalog-grid .product-card .card-actions.v11-actions').forEach(actions=>{
        if(actions.querySelector('.r2-cart-add')) return
        const nativeAdd=actions.querySelector('.static-add')
        const quantityControl=actions.querySelector('.quantity-control')
        const detail=actions.querySelector('.detail')
        const triggerAdd=()=>{
          const plus=actions.querySelector('.quantity-control button[aria-label="Tambah jumlah"]')
          if(plus && !plus.disabled) plus.click()
          else if(nativeAdd && !nativeAdd.disabled) nativeAdd.click()
        }
        if(nativeAdd){
          nativeAdd.classList.add('r2-native-add')
          const zero=document.createElement('div')
          zero.className='r2-quantity-zero'
          zero.setAttribute('aria-label','Jumlah produk')
          zero.innerHTML='<button type="button" class="r2-qty-minus" aria-label="Kurangi jumlah" disabled>−</button><output aria-live="polite">0</output><button type="button" class="r2-qty-plus" aria-label="Tambah jumlah">+</button>'
          zero.querySelector('.r2-qty-plus')?.addEventListener('click',e=>{e.stopPropagation();triggerAdd()})
          actions.insertBefore(zero,nativeAdd)
        }
        const add=document.createElement('button')
        add.type='button'
        add.className='r2-cart-add'
        add.textContent='ADD TO CART'
        add.setAttribute('aria-label','Tambahkan produk ke keranjang')
        add.addEventListener('click',e=>{e.stopPropagation();triggerAdd()})
        if(quantityControl) actions.insertBefore(add,detail||null)
        else if(nativeAdd) actions.insertBefore(add,detail||null)
      })
    }
    enhance()
    const observer=new MutationObserver(enhance)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[])
  if(!visible) return null
  return <div className="r2-asset-loader" role="status" aria-label="Memuat R2 NUSANTARA">
    <div className="r2-asset-loader-card">
      <img src="/assets/logo/logo.png" alt="R2 NUSANTARA" width="180" height="180" />
      <span>R2 NUSANTARA</span>
      <i aria-hidden="true" />
    </div>
    <style jsx>{` 
      .r2-asset-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:linear-gradient(135deg,rgba(250,249,246,.98),rgba(242,241,237,.98)),url('/assets/logo/loader-bg.jpg') center/cover no-repeat;animation:r2LoaderOut .28s ease .58s forwards;pointer-events:none}
      .r2-asset-loader-card{display:grid;justify-items:center;gap:10px;padding:28px 34px;border:1px solid rgba(23,23,23,.10);border-radius:22px;background:rgba(255,255,255,.86);box-shadow:0 22px 70px rgba(23,23,23,.12);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .r2-asset-loader img{width:76px;height:76px;object-fit:contain;display:block}
      .r2-asset-loader span{font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.22em;color:#171717}
      .r2-asset-loader i{width:42px;height:2px;border-radius:99px;background:#1F5EFF;transform-origin:left;animation:r2LoaderLine .65s ease-in-out infinite alternate}
      @keyframes r2LoaderLine{from{transform:scaleX(.25);opacity:.45}to{transform:scaleX(1);opacity:1}}
      @keyframes r2LoaderOut{to{opacity:0;visibility:hidden}}
      @media(max-width:700px){.r2-asset-loader-card{padding:24px 28px}.r2-asset-loader img{width:68px;height:68px}}
      @media(prefers-reduced-motion:reduce){.r2-asset-loader{animation:none}.r2-asset-loader i{animation:none}}
    `}</style>
  </div>
}
