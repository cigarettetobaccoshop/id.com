import dynamic from 'next/dynamic'

// Render the homepage at its route boundary. Keeping the dynamic import here
// lets Next.js server-render the page once and hydrate that same tree.
const HomepageExperience = dynamic(() => import('../components/HomepageExperience'), { ssr: true })

export default function HomePage() {
  return <HomepageExperience />
}
