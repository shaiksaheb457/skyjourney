// components/common/Footer.jsx
import { Link } from 'react-router-dom'
import { Plane, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const links = {
    Company:  ['About Us','Careers','Press','Blog','Contact Us'],
    Support:  ['Help Center','Cancellation','Refunds','Travel Insurance','FAQs'],
    Explore:  ['Domestic Flights','International Flights','Cheap Flights','Business Class','Flight Status'],
    Legal:    ['Privacy Policy','Terms of Service','Cookie Policy','Sitemap'],
  }
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><Plane className="w-5 h-5 text-white" /></div>
              <span className="text-white text-xl font-bold">SkyJourney</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">Book flights to 500+ destinations worldwide. Best prices guaranteed with 24/7 customer support.</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm"><Mail className="w-4 h-4 text-blue-400 flex-shrink-0" /><span>support@skyjourney.com</span></div>
              <div className="flex items-center gap-2.5 text-sm"><Phone className="w-4 h-4 text-blue-400 flex-shrink-0" /><span>1800-123-4567 (Toll Free)</span></div>
              <div className="flex items-center gap-2.5 text-sm"><MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" /><span>Hyderabad, Telangana, India</span></div>
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">{items.map(item => <li key={item}><Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2025 SkyJourney. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
export default Footer
