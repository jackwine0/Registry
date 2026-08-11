import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastStack from './components/ToastStack'
import CompareTray from './components/CompareTray'
import Home from './pages/Home'
import Search from './pages/Search'
import CharacterDetail from './pages/CharacterDetail'
import Villains from './pages/Villains'
import Compare from './pages/Compare'
import Favorites from './pages/Favorites'
import Teams from './pages/Teams'
import Random from './pages/Random'
import { useStore } from './store/useStore'

function Shell() {
  const location = useLocation()
  const compareCount = useStore((s) => s.compareIds.length)
  const trayVisible = compareCount > 0 && location.pathname !== '/compare'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${trayVisible ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/character/:id" element={<CharacterDetail />} />
          <Route path="/villains" element={<Villains />} />
          <Route path="/villain/:id" element={<CharacterDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/random" element={<Random />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CompareTray />
      <ToastStack />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <p className="font-display text-6xl text-hero-red mb-4">404</p>
      <p className="text-mist-400">This entry isn't in the registry.</p>
    </div>
  )
}
