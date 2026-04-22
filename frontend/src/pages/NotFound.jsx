import { Link } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-800 flex items-center justify-center shadow-xl shadow-blood-900/50 mb-6">
        <Heart size={28} className="text-white fill-white" />
      </div>
      <div className="font-display text-8xl font-extrabold text-gradient mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-blood-700 hover:bg-blood-600 text-white font-semibold rounded-xl transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>
    </div>
  )
}
