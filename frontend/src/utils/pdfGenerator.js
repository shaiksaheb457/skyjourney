// utils/pdfGenerator.js — Generate downloadable PDF e-ticket
// Uses jsPDF (already in package.json)

import jsPDF from 'jspdf'

const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '--'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : '--'
const formatDur  = (m) => m ? `${Math.floor(m/60)}h ${m%60}m` : '--'

export const generateETicketPDF = (booking) => {
  const doc  = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W    = 210
  const pad  = 15
  let   y    = 0

  // ── helpers ──────────────────────────────────────────────────
  const rect  = (x,yy,w,h,r=0,fill='#ffffff',stroke=null) => {
    doc.setFillColor(fill)
    if (stroke) doc.setDrawColor(stroke)
    doc.roundedRect(x,yy,w,h,r,r, stroke ? 'FD' : 'F')
  }
  const text  = (t,x,yy,opts={}) => {
    doc.setFontSize(opts.size||10)
    doc.setFont('helvetica', opts.style||'normal')
    doc.setTextColor(opts.color||'#1e293b')
    doc.text(String(t),x,yy,{ align: opts.align||'left', ...opts.extra })
  }
  const line  = (x1,yy,x2,col='#e2e8f0') => {
    doc.setDrawColor(col)
    doc.setLineWidth(0.3)
    doc.line(x1,yy,x2,yy)
  }

  const flight     = booking.flightId    || {}
  const user       = booking.userId      || {}
  const pricing    = booking.pricing     || {}
  const passengers = booking.passengers  || []

  // ── HEADER ───────────────────────────────────────────────────
  rect(0,0,W,38,0,'#0f2645')
  // Plane icon (circle)
  doc.setFillColor('#2563eb')
  doc.circle(pad+5, 15, 5, 'F')
  text('✈',pad+3,17,{size:8,color:'#ffffff'})
  text('SkyJourney',pad+13,14,{size:18,style:'bold',color:'#ffffff'})
  text('E-Ticket / Boarding Pass',pad+13,20,{size:8,color:'#93c5fd'})
  // Status badge
  rect(W-pad-28,8,26,10,3,'#16a34a')
  text('CONFIRMED',W-pad-25,14.5,{size:7,style:'bold',color:'#ffffff'})
  // PNR on right
  text('PNR',W-pad-28,27,{size:7,color:'#93c5fd'})
  text(booking.pnr||'--',W-pad-28,33,{size:11,style:'bold',color:'#ffffff'})
  y = 48

  // ── FLIGHT ROUTE CARD ─────────────────────────────────────────
  rect(pad,y,W-pad*2,38,4,'#f8fafc','#e2e8f0')
  // Airline
  text(flight.airline||'Airline',pad+4,y+8,{size:8,color:'#64748b'})
  text(flight.flightNumber||'--',pad+4,y+15,{size:11,style:'bold',color:'#1e3a5f'})
  text(flight.airlineCode||'',pad+4,y+21,{size:8,color:'#64748b'})
  // FROM
  text(flight.from?.airportCode||'---',pad+4,y+30,{size:22,style:'bold',color:'#0f2645'})
  text(flight.from?.city||'',pad+4,y+36,{size:8,color:'#64748b'})
  // Divider line with plane
  const midX = W/2
  line(pad+35,y+26,midX-10,'#cbd5e1')
  text('✈',midX-5,y+27.5,{size:12,color:'#2563eb'})
  line(midX+8,y+26,W-pad-35,'#cbd5e1')
  text(formatDur(flight.duration),midX,y+22,{size:7,color:'#64748b',align:'center'})
  text(flight.stops===0?'Non-stop':`${flight.stops} Stop`,midX,y+30,{size:7,color:flight.stops===0?'#16a34a':'#f59e0b',align:'center'})
  // TO
  text(flight.to?.airportCode||'---',W-pad-30,y+30,{size:22,style:'bold',color:'#0f2645',align:'right'})
  text(flight.to?.city||'',W-pad-4,y+36,{size:8,color:'#64748b',align:'right'})
  y += 46

  // ── TIMES ROW ────────────────────────────────────────────────
  rect(pad,y,W-pad*2,20,4,'#eff6ff','#bfdbfe')
  const timeItems = [
    {label:'Departure',value:formatTime(flight.departureTime)},
    {label:'Date',     value:formatDate(flight.departureTime)},
    {label:'Arrival',  value:formatTime(flight.arrivalTime)},
    {label:'Cabin',    value:(booking.cabinClass||'Economy').toUpperCase()},
  ]
  timeItems.forEach((item,i) => {
    const x = pad+4 + i*(W-pad*2-8)/4
    text(item.label, x, y+7,  {size:7,color:'#2563eb'})
    text(item.value, x, y+14, {size:9,style:'bold',color:'#0f2645'})
  })
  y += 28

  // ── PASSENGER TABLE ───────────────────────────────────────────
  text('PASSENGER DETAILS',pad,y,{size:9,style:'bold',color:'#0f2645'})
  y += 5
  rect(pad,y,W-pad*2,8,2,'#0f2645')
  const cols = ['Name','Type','Seat','Meal']
  const colW = (W-pad*2)/cols.length
  cols.forEach((c,i) => text(c,pad+4+i*colW,y+5.5,{size:7,style:'bold',color:'#ffffff'}))
  y += 8

  passengers.forEach((p,i) => {
    const bg = i%2===0 ? '#f8fafc' : '#ffffff'
    rect(pad,y,W-pad*2,8,0,bg)
    text(p.name||'--',      pad+4,         y+5.5,{size:8,color:'#1e293b'})
    text(p.type||'Adult',   pad+4+colW,    y+5.5,{size:7,color:'#64748b'})
    text(p.seatNumber||'--',pad+4+colW*2,  y+5.5,{size:8,color:'#1e293b'})
    text(p.meal||'None',    pad+4+colW*3,  y+5.5,{size:7,color:'#64748b'})
    y += 8
  })
  y += 6

  // ── PRICING TABLE ─────────────────────────────────────────────
  text('FARE DETAILS',pad,y,{size:9,style:'bold',color:'#0f2645'})
  y += 6
  const priceRows = [
    ['Base Fare',   `₹${(pricing.baseFare||0).toLocaleString()}`],
    ['Taxes & Fees',`₹${(pricing.taxes||0).toLocaleString()}`],
    ['Add-ons',     `₹${(pricing.addOnsFee||0).toLocaleString()}`],
  ]
  if ((pricing.discount||0) > 0) priceRows.push(['Discount',`-₹${pricing.discount.toLocaleString()}`])

  priceRows.forEach(([label,val],i) => {
    const bg = i%2===0 ? '#f8fafc' : '#ffffff'
    rect(pad,y,W-pad*2,7,0,bg)
    text(label, pad+4,  y+5,{size:8,color:'#64748b'})
    text(val,   W-pad-4,y+5,{size:8,color:'#1e293b',align:'right'})
    y += 7
  })
  // Total row
  rect(pad,y,W-pad*2,9,0,'#0f2645')
  text('TOTAL PAID', pad+4,  y+6,{size:9,style:'bold',color:'#ffffff'})
  text(`₹${(pricing.totalAmount||0).toLocaleString()}`,W-pad-4,y+6,{size:11,style:'bold',color:'#60a5fa',align:'right'})
  y += 15

  // ── IMPORTANT INFO ────────────────────────────────────────────
  rect(pad,y,W-pad*2,28,4,'#fffbeb','#fde68a')
  text('⚠ IMPORTANT INFORMATION',pad+4,y+7,{size:8,style:'bold',color:'#92400e'})
  const notes = [
    '• Please arrive at the airport at least 2 hours before departure.',
    '• Carry a valid photo ID (Aadhaar/Passport) along with this e-ticket.',
    '• Cabin baggage: '+( flight.baggage?.cabin||'7 kg')+' | Check-in baggage: '+(flight.baggage?.checkin||'15 kg'),
    '• Web check-in opens 48 hours before departure.',
  ]
  notes.forEach((n,i) => text(n,pad+4,y+13+i*4,{size:7,color:'#78350f'}))
  y += 34

  // ── BARCODE STRIP ─────────────────────────────────────────────
  rect(pad,y,W-pad*2,16,4,'#f1f5f9','#e2e8f0')
  // Fake barcode bars
  let bx = pad+8
  const barHeights = [10,6,10,4,8,10,5,10,7,10,4,8,10,6,10,5,8,10,4,10]
  barHeights.forEach(h => {
    doc.setFillColor('#0f2645')
    doc.rect(bx,y+3,1.2,h,'F')
    bx += 2.5
  })
  text(booking.pnr||'--',W/2,y+10,{size:8,style:'bold',color:'#0f2645',align:'center'})
  text('Scan at Airport Counter',W/2,y+14.5,{size:6,color:'#64748b',align:'center'})
  y += 22

  // ── FOOTER ───────────────────────────────────────────────────
  line(pad,y,W-pad)
  y += 5
  text('SkyJourney | support@skyjourney.com | 1800-123-4567',W/2,y,{size:7,color:'#94a3b8',align:'center'})
  text(`Generated on ${new Date().toLocaleString('en-IN')}`,W/2,y+5,{size:6,color:'#cbd5e1',align:'center'})

  // ── SAVE ─────────────────────────────────────────────────────
  doc.save(`SkyJourney_Ticket_${booking.pnr||'ticket'}.pdf`)
}
