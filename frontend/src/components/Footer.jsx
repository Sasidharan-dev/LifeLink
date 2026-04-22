import { Link } from 'react-router-dom'
import { Github, Linkedin } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { dark } = useTheme()

  return (
    <footer
      className={`w-full border-t px-6 py-8 transition-colors ${
        dark
          ? 'border-white/10 bg-black text-gray-300'
          : 'border-gray-200 bg-white/90 text-gray-600'
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 text-sm text-center md:grid-cols-3 md:items-center">
        <div className="flex justify-center md:justify-start md:text-left">
          &copy; {currentYear} LifeLink
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/" className="transition-all duration-300 hover:scale-105 hover:text-red-500">
            Home
          </Link>
          <Link to="/donors" className="transition-all duration-300 hover:scale-105 hover:text-red-500">
            Donors
          </Link>
          <Link to="/requests" className="transition-all duration-300 hover:scale-105 hover:text-red-500">
            Requests
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 md:items-end md:text-right">
          <span>Built by Sasidharan</span>
          <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Crafting purposeful software with clarity and care.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
            <a
              href="https://www.linkedin.com/in/sasidharan-e-811a65330"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-105 hover:text-red-500 hover:shadow-[0_0_18px_rgba(239,68,68,0.22)]"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
            <a
              href="https://github.com/Sasidharan-dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-105 hover:text-red-500 hover:shadow-[0_0_18px_rgba(239,68,68,0.22)]"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
