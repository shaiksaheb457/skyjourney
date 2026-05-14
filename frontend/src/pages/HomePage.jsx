// pages/HomePage.jsx
import Navbar              from '../components/common/Navbar'
import Footer              from '../components/common/Footer'
import HeroSection         from '../components/home/HeroSection'
import PopularDestinations from '../components/home/PopularDestinations'
import OffersSection       from '../components/home/OffersSection'
import WhyChooseUs         from '../components/home/WhyChooseUs'

const HomePage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <HeroSection />
      <PopularDestinations />
      <OffersSection />
      <WhyChooseUs />

      {/* Newsletter banner */}
      <section className="py-16" style={{background:'linear-gradient(135deg,#0f2645,#1565c0)'}}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Get exclusive flight deals</h2>
          <p className="text-blue-200 mb-7">Subscribe and receive the best offers directly in your inbox</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30" />
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default HomePage
