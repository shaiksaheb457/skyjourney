// pages/NotFoundPage.jsx — 404 Not Found page
import { useNavigate } from 'react-router-dom'
import { Plane, Home, Search, ArrowLeft } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">

          {/* Animated plane illustration */}
          <div className="relative mb-8">
            <div className="text-8xl font-black text-gray-100 select-none leading-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                <Plane className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            This page went off-route
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Looks like the page you were looking for has taken off without you.
            Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-sm w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              Search Flights
            </button>
          </div>

          {/* Decorative dots */}
          <div className="flex items-center justify-center gap-2 mt-12">
            {['bg-blue-200','bg-blue-400','bg-blue-600','bg-blue-400','bg-blue-200'].map((c, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default NotFoundPage
