// Homepage rendering is owned by pages/_app.js -> HomepageExperience.
// Keep this route component intentionally side-effect free so the legacy
// homepage implementation cannot execute an obsolete Supabase query.
export default function LegacyHomeRoute() {
  return null
}
