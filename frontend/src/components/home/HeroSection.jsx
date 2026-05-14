// components/home/HeroSection.jsx
import SearchWidget from './SearchWidget'

const HeroSection = () => (
  <section className="relative min-h-[580px] flex items-center overflow-hidden" style={{background:'linear-gradient(135deg,#0f2645 0%,#1a3a6e 40%,#1565c0 70%,#1976d2 100%)'}}>
    {/* Background decoration */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full" style={{background:'rgba(255,255,255,0.04)'}} />
      <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full" style={{background:'rgba(255,255,255,0.04)'}} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full" style={{background:'rgba(255,255,255,0.02)'}} />
      {/* Airplane silhouette */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/5 text-[200px] select-none hidden xl:block">✈</div>
    </div>

    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Heading */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-5">
          <span className="text-yellow-400 text-sm">✦</span>
          <span className="text-white/90 text-sm font-medium">Best flight deals — guaranteed</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          Fly Anywhere,<br />
          <span className="text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(90deg,#60a5fa,#a78bfa)'}}>
            Any Time ✈️
          </span>
        </h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Compare prices across 500+ airlines. Book smarter with SkyJourney.
        </p>
      </div>

      {/* Search widget */}
      <div className="max-w-5xl mx-auto">
        <SearchWidget variant="hero" />
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
        {[
          { emoji: '🛡️', text: 'Secure Payments' },
          { emoji: '💰', text: 'Best Price Guarantee' },
          { emoji: '🎧', text: '24/7 Support' },
          { emoji: '✅', text: 'Instant Confirmation' },
        ].map(b => (
          <div key={b.text} className="flex items-center gap-2">
            <span className="text-base">{b.emoji}</span>
            <span className="text-white/80 text-sm font-medium">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default HeroSection
