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

      /* Final catalog quantity/add-to-cart presentation layer. */
      :global(.catalog-grid .product-card .card-actions.v11-actions){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 42px!important;gap:7px!important;align-items:stretch!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){display:grid!important;grid-template-columns:34px minmax(28px,1fr) 34px!important;align-items:center!important;min-width:0!important;height:44px!important;min-height:44px!important;overflow:hidden!important;border:1px solid rgba(12,43,92,.14)!important;border-radius:12px!important;background:linear-gradient(180deg,#fff,#f7faff)!important;box-shadow:0 5px 18px rgba(11,43,92,.07)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button){width:34px!important;height:42px!important;border:0!important;background:transparent!important;color:#0b2b5c!important;font:800 18px/1 system-ui,sans-serif!important;cursor:pointer!important;transition:background .18s ease,color .18s ease,transform .18s ease!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:hover:not(:disabled)),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:hover:not(:disabled)){background:#eaf2ff!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:active:not(:disabled)),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:active:not(:disabled)){transform:scale(.94)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:disabled),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:disabled){opacity:.35!important;cursor:not-allowed!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control output),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero output){display:grid!important;place-items:center!important;min-width:28px!important;height:42px!important;border-left:1px solid rgba(12,43,92,.08)!important;border-right:1px solid rgba(12,43,92,.08)!important;color:#0b2b5c!important;font:800 13px/1 system-ui,sans-serif!important;font-variant-numeric:tabular-nums!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){grid-column:2!important;grid-row:1!important;width:100%!important;height:44px!important;min-height:44px!important;padding:0 13px!important;border:1px solid #0b2b5c!important;border-radius:12px!important;background:linear-gradient(135deg,#0b2b5c,#164a91)!important;color:#fff!important;font:800 10px/1 system-ui,sans-serif!important;letter-spacing:.08em!important;cursor:pointer!important;box-shadow:0 8px 20px rgba(11,43,92,.18)!important;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add:hover){filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 11px 24px rgba(11,43,92,.22)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add:active){transform:translateY(0) scale(.98)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-native-add){display:none!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){grid-column:1!important;grid-row:1!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control){grid-column:1!important;grid-row:1!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .detail){grid-column:3!important;grid-row:1!important;min-width:42px!important;height:44px!important;border-radius:12px!important}
      /* Header already has PRODUK navigation; remove the duplicate same-destination KATALOG button. */
      :global(.src-header .src-catalog){display:none!important}
      @media(max-width:700px){
        :global(.catalog-grid .product-card .card-actions.v11-actions){grid-template-columns:minmax(0,1fr) minmax(0,1fr) 42px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){font-size:9px!important;padding-inline:9px!important}
      }
      @media(prefers-reduced-motion:reduce){:global(.catalog-grid .product-card .card-actions.v11-actions button){transition:none!important}}
    `}</style>
  </div>
}
