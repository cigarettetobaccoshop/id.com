import { Inter, Manrope } from 'next/font/google'

export const headingFont = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--r2-font-heading',
  fallback: ['Arial', 'sans-serif'],
})

export const bodyFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--r2-font-body',
  fallback: ['Arial', 'sans-serif'],
})
