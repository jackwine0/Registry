import { Link } from 'react-router-dom'
import { Fingerprint } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t-4 border-mist-100 mt-20 py-10 text-center text-mist-500 text-sm">
      <Fingerprint className="mx-auto mb-2 text-hero-red" size={22} />
      <p className="font-display text-2xl text-mist-100 mb-2">Registry Division</p>
      <p>Character data pulled live from the Comic Vine API. Not affiliated with Marvel, DC, or their publishers.</p>
      <div className="flex justify-center gap-4 mt-3 uppercase text-xs tracking-wider">
        <Link to="/" className="hover:text-mist-100 transition-colors">Home</Link>
        <Link to="/search" className="hover:text-mist-100 transition-colors">Archive</Link>
        <Link to="/teams" className="hover:text-mist-100 transition-colors">Affiliations</Link>
        <Link to="/favorites" className="hover:text-mist-100 transition-colors">My File</Link>
      </div>
    </footer>
  )
}
