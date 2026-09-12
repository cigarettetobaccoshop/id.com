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

      /* Final catalog cart rail: one coherent component inside each product card. */
      :global(.catalog-grid .product-card .card-actions.v11-actions){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)!important;grid-template-rows:44px 26px!important;gap:6px!important;align-items:stretch!important;box-sizing:border-box!important;padding:7px!important;border-top:1px solid rgba(12,43,92,.08)!important;background:linear-gradient(180deg,#f8fbff,#fff)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){grid-column:1!important;grid-row:1!important;display:grid!important;grid-template-columns:34px minmax(28px,1fr) 34px!important;align-items:center!important;min-width:0!important;width:100%!important;height:44px!important;min-height:44px!important;overflow:hidden!important;box-sizing:border-box!important;border:1px solid rgba(12,43,92,.14)!important;border-radius:11px!important;background:linear-gradient(180deg,#fff,#f7faff)!important;box-shadow:0 4px 14px rgba(11,43,92,.07)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button){width:34px!important;height:42px!important;min-height:42px!important;border:0!important;background:transparent!important;color:#0b2b5c!important;font:800 18px/1 system-ui,sans-serif!important;cursor:pointer!important;transition:background .18s ease,color .18s ease,transform .18s ease!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:hover:not(:disabled)),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:hover:not(:disabled)){background:#eaf2ff!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:active:not(:disabled)),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:active:not(:disabled)){transform:scale(.94)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button:disabled),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button:disabled){opacity:.35!important;cursor:not-allowed!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control output),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero output){display:grid!important;place-items:center!important;min-width:28px!important;height:42px!important;border-left:1px solid rgba(12,43,92,.08)!important;border-right:1px solid rgba(12,43,92,.08)!important;color:#0b2b5c!important;font:800 13px/1 system-ui,sans-serif!important;font-variant-numeric:tabular-nums!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){grid-column:2!important;grid-row:1!important;width:100%!important;height:44px!important;min-height:44px!important;box-sizing:border-box!important;padding:0 9px!important;border:1px solid #0b2b5c!important;border-radius:11px!important;background:linear-gradient(135deg,#0b2b5c,#164a91)!important;color:#fff!important;font:800 9px/1 system-ui,sans-serif!important;letter-spacing:.06em!important;cursor:pointer!important;white-space:nowrap!important;box-shadow:0 7px 17px rgba(11,43,92,.17)!important;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add:hover){filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 10px 21px rgba(11,43,92,.21)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add:active){transform:translateY(0) scale(.98)!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .r2-native-add){display:none!important}
      :global(.catalog-grid .product-card .card-actions.v11-actions .detail){grid-column:1 / -1!important;grid-row:2!important;width:100%!important;min-width:0!important;height:26px!important;min-height:26px!important;box-sizing:border-box!important;border-radius:7px!important;font-size:8px!important;line-height:1!important}
      :global(.src-header .src-catalog){display:none!important}
      @media(max-width:700px){
        :global(.catalog-grid .product-card .card-actions.v11-actions){grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)!important;grid-template-rows:34px 22px!important;gap:4px!important;padding:5px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){height:34px!important;min-height:34px!important;border-radius:8px!important;grid-template-columns:clamp(22px,7vw,28px) minmax(18px,1fr) clamp(22px,7vw,28px)!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button){width:auto!important;height:32px!important;min-height:32px!important;font-size:16px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control output),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero output){height:32px!important;min-width:18px!important;font-size:12px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){height:34px!important;min-height:34px!important;border-radius:8px!important;font-size:7.5px!important;padding-inline:5px!important;letter-spacing:.025em!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .detail){height:22px!important;min-height:22px!important;border-radius:7px!important;font-size:7px!important}
      }
      @media(max-width:360px){
        :global(.catalog-grid .product-card .card-actions.v11-actions){grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)!important;grid-template-rows:32px 20px!important;gap:3px!important;padding:4px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){height:32px!important;min-height:32px!important;grid-template-columns:21px minmax(15px,1fr) 21px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control button),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button){height:30px!important;min-height:30px!important;font-size:15px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control output),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero output){height:30px!important;font-size:11px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){height:32px!important;min-height:32px!important;font-size:7px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .detail){height:20px!important;min-height:20px!important;font-size:6.5px!important}
      }
      @media(prefers-reduced-motion:reduce){:global(.catalog-grid .product-card .card-actions.v11-actions button){transition:none!important}}

      /* Precision anti-overlap pass: reserve a real vertical action zone inside each card. */
      @media(max-width:700px){
        :global(.catalog-grid .product-card){display:flex!important;flex-direction:column!important;justify-content:flex-start!important;overflow:hidden!important;height:220px!important;min-height:220px!important;aspect-ratio:auto!important}
        :global(.catalog-grid .product-card .card-media){position:relative!important;z-index:1!important;flex:0 0 auto!important}
        :global(.catalog-grid .product-card .product-body){position:relative!important;z-index:1!important;flex:1 1 auto!important;min-height:64px!important;overflow:hidden!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions){position:relative!important;z-index:5!important;flex:0 0 60px!important;align-self:stretch!important;margin-top:auto!important;transform:translateY(-1px)!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero),:global(.catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){position:relative!important;z-index:6!important}
      }
      @media(max-width:360px){
        :global(.catalog-grid .product-card){height:204px!important;min-height:204px!important}
        :global(.catalog-grid .product-card .product-body){min-height:60px!important}
        :global(.catalog-grid .product-card .card-actions.v11-actions){flex-basis:55px!important;transform:translateY(-1px)!important}
      }

      /* FINAL MINI-GRID V3 — WooCommerce-style mobile product card. */
      @media(max-width:700px){
        :global(.premium-catalog .catalog-grid){grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:0 8px!important}
        :global(.premium-catalog .catalog-grid .product-card){height:232px!important;min-height:232px!important;max-height:232px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;border:1px solid rgba(7,29,73,.09)!important;border-radius:12px!important;background:#fff!important;box-shadow:0 6px 18px rgba(7,29,73,.065)!important;isolation:isolate!important}
        :global(.premium-catalog .catalog-grid .product-card .card-media){flex:0 0 60px!important;height:60px!important;padding:3px!important;overflow:visible!important;position:relative!important;z-index:1!important}
        :global(.premium-catalog .catalog-grid .product-card .product-visual){height:54px!important;max-height:54px!important;border-radius:8px!important;overflow:hidden!important}
        :global(.premium-catalog .catalog-grid .product-card .pack-art){transform:scale(.78)!important;transform-origin:center!important}
        :global(.premium-catalog .catalog-grid .product-card .visual-badges){transform:scale(.78)!important;transform-origin:top left!important}
        :global(.premium-catalog .catalog-grid .product-card .heart){transform:scale(.78)!important;transform-origin:top right!important}
        :global(.premium-catalog .catalog-grid .product-card .product-body){flex:1 1 auto!important;min-height:0!important;height:auto!important;padding:3px 7px 2px!important;overflow:hidden!important;position:relative!important;z-index:2!important}
        :global(.premium-catalog .catalog-grid .product-card .category){display:block!important;font-size:5.2px!important;line-height:1!important;letter-spacing:.075em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin:0 0 2px!important;opacity:.72!important}
        :global(.premium-catalog .catalog-grid .product-card .product-body h2){font-size:9.5px!important;line-height:1.13!important;min-height:21px!important;max-height:22px!important;margin:0 0 2px!important;font-weight:850!important;letter-spacing:-.01em!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
        :global(.premium-catalog .catalog-grid .product-card .variant){font-size:5.6px!important;line-height:1.05!important;min-height:6px!important;max-height:7px!important;margin:0 0 2px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;opacity:.74!important}
        :global(.premium-catalog .catalog-grid .product-card .tagline){font-size:5.8px!important;line-height:1.1!important;min-height:6px!important;max-height:13px!important;margin:0!important;overflow:hidden!important;opacity:.65!important}
        :global(.premium-catalog .catalog-grid .product-card .price){font-size:11px!important;line-height:1!important;margin:4px 0 0!important;font-weight:950!important;white-space:nowrap!important}
        :global(.premium-catalog .catalog-grid .product-card .stock){font-size:5.5px!important;line-height:1!important;margin:3px 0 0!important;white-space:nowrap!important;overflow:hidden!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions){height:58px!important;min-height:58px!important;flex:0 0 58px!important;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)!important;grid-template-rows:32px 20px!important;gap:3px!important;padding:3px 4px 3px!important;margin:0!important;transform:none!important;position:relative!important;z-index:8!important;border-top:1px solid rgba(7,29,73,.08)!important;background:linear-gradient(180deg,#f7faff,#fff)!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){grid-column:1!important;grid-row:1!important;width:100%!important;height:32px!important;min-height:32px!important;grid-template-columns:21px minmax(15px,1fr) 21px!important;border-radius:8px!important;z-index:10!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .quantity-control button),:global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero button){width:auto!important;height:30px!important;min-height:30px!important;font-size:15px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .quantity-control output),:global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero output){height:30px!important;min-width:15px!important;font-size:11px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){grid-column:2!important;grid-row:1!important;height:32px!important;min-height:32px!important;border-radius:8px!important;font-size:7px!important;letter-spacing:.025em!important;padding:0 4px!important;z-index:10!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .detail){grid-column:1 / -1!important;grid-row:2!important;height:20px!important;min-height:20px!important;border-radius:7px!important;font-size:6.3px!important;padding:0 4px!important}
        :global(.premium-catalog .catalog-grid .product-card .product-body .category),:global(.premium-catalog .catalog-grid .product-card .product-body .variant),:global(.premium-catalog .catalog-grid .product-card .product-body .tagline){position:relative!important;z-index:2!important}
      }
      @media(max-width:360px){
        :global(.premium-catalog .catalog-grid .product-card){height:220px!important;min-height:220px!important;max-height:220px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-media){height:55px!important;flex-basis:55px!important}
        :global(.premium-catalog .catalog-grid .product-card .product-visual){height:49px!important;max-height:49px!important}
        :global(.premium-catalog .catalog-grid .product-card .product-body){padding:3px 6px 2px!important}
        :global(.premium-catalog .catalog-grid .product-card .product-body h2){font-size:8.7px!important;min-height:20px!important;max-height:20px!important}
        :global(.premium-catalog .catalog-grid .product-card .price){font-size:10px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions){height:56px!important;min-height:56px!important;flex-basis:56px!important;grid-template-rows:31px 19px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .quantity-control),:global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-quantity-zero){height:31px!important;min-height:31px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .r2-cart-add){height:31px!important;min-height:31px!important;font-size:6.7px!important}
        :global(.premium-catalog .catalog-grid .product-card .card-actions.v11-actions .detail){height:19px!important;min-height:19px!important;font-size:6px!important}
      }
    `}</style>
  </div>
}