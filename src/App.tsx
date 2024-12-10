import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import FamilyTree from './pages/FamilyTree'

function App() {
  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Link to="/">Strona Główna</Link>
        <Link to="/tree">Drzewo Genealogiczne</Link>
      </nav>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tree" element={<FamilyTree />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
