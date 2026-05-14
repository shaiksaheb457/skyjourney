// components/home/WhyChooseUs.jsx
import { Shield, Clock, Tag, Headphones, Smartphone, Star } from 'lucide-react'

const features = [
  { icon: Tag,         title: 'Best Price Guarantee',    desc: 'We match any lower price you find. Book with confidence.',  color: 'bg-blue-50 text-blue-600' },
  { icon: Shield,      title: 'Secure & Safe',            desc: '100% secure payments. Your data is always protected.',      color: 'bg-green-50 text-green-600' },
  { icon: Clock,       title: 'Instant Confirmation',     desc: 'Get your e-ticket immediately after booking.',              color: 'bg-purple-50 text-purple-600' },
  { icon: Headphones,  title: '24/7 Customer Support',    desc: 'Our experts are available round the clock to help you.',    color: 'bg-orange-50 text-orange-600' },
  { icon: Smartphone,  title: 'Easy Cancellation',        desc: 'Cancel anytime from the app. Hassle-free refunds.',         color: 'bg-pink-50 text-pink-600' },
  { icon: Star,        title: '2M+ Happy Travelers',      desc: 'Trusted by millions of travelers across India.',            color: 'bg-yellow-50 text-yellow-600' },
]

const WhyChooseUs = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Why SkyJourney</span>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">Travel smarter with us</h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">We make flight booking simple, fast, and affordable</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(f => (
          <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color} group-hover:scale-110 transition-transform`}>
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default WhyChooseUs
