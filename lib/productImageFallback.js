export const PRODUCT_IMAGE_FALLBACK={
  generic:'https://commons.wikimedia.org/wiki/Special:FilePath/Cigaret%20tobacco.JPG',
  filter:'https://commons.wikimedia.org/wiki/Special:FilePath/Cigaret%20tobacco.JPG',
  kretek:'https://commons.wikimedia.org/wiki/Special:FilePath/Cigaret%20tobacco.JPG',
  mild:'https://commons.wikimedia.org/wiki/Special:FilePath/Feuille%20tabac.jpg',
  premium:'https://commons.wikimedia.org/wiki/Special:FilePath/Feuille%20tabac.jpg',
  international:'https://commons.wikimedia.org/wiki/Special:FilePath/Belgian%20cigarette%20pack%20%28generic%29.jpg',
  resmi:'https://commons.wikimedia.org/wiki/Special:FilePath/Belgian%20cigarette%20pack%20%28generic%29.jpg',
  r2:'https://commons.wikimedia.org/wiki/Special:FilePath/Cigaret%20tobacco.JPG'
}

export const GENERIC_IMAGE=PRODUCT_IMAGE_FALLBACK.generic

export const firstDefinedImage=p=>{
  const candidates=[p?.image,p?.Image,p?.image_url,p?.imageUrl,p?.featured_image,p?.featuredImage]
  return candidates.find(v=>typeof v==='string'&&/^https?:\/\//i.test(v.trim()))||null
}

export const visualCategory=p=>{
  const text=`${p?.Type||''} ${p?.Tags||''}`.toLowerCase()
  if(/international/.test(text))return 'international'
  if(/premium/.test(text))return 'premium'
  if(/mild/.test(text))return 'mild'
  if(/kretek|skt/.test(text))return 'kretek'
  if(/filter/.test(text))return 'filter'
  return p?.category==='resmi'?'resmi':'r2'
}

export const resolveProductImage=p=>firstDefinedImage(p)||PRODUCT_IMAGE_FALLBACK[visualCategory(p)]||GENERIC_IMAGE
