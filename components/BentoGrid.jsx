import React from 'react'

export default function BentoGrid({children,className=''}){
  return <section className={`catalog-grid catalog-bento ${className}`.trim()}>{children}</section>
}
