import React from 'react'

const allowed=new Set(['hero','featured','standard','wide'])

export default function BentoItem({children,span='standard',className=''}){
  const variant=allowed.has(span)?span:'standard'
  return <div className={`bento-item bento-item--${variant} ${className}`.trim()}>{children}</div>
}
