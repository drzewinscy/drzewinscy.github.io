import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import FamilyTree from './pages/FamilyTree'

function App() {
  return (
    <div style={{
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      height: '100%',
    }}>
      <nav style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Link to="/">Strona Główna</Link>
        <Link to="/tree">Drzewo Genealogiczne</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tree" element={<FamilyTree />} />
      </Routes>
    </div>
  )
}

export default App
