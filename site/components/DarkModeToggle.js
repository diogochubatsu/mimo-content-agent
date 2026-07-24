import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setDarkMode(saved === 'true')
      document.body.classList.toggle('dark-mode', saved === 'true')
    }
  }, [])

  const toggle = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', newValue)
    document.body.classList.toggle('dark-mode', newValue)
  }

  return (
    <button className="dark-mode-toggle" onClick={toggle} aria-label="Toggle dark mode">
      {darkMode ? '☀️' : '🌙'}
      
      <style jsx>{`
        .dark-mode-toggle {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .dark-mode-toggle:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </button>
  )
}
