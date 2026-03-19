// ════════════════════════════════════════════════════════════════
// ORION HUB — CONTENT DATA FILE
// ════════════════════════════════════════════════════════════════
//
// HOW TO UPDATE:
// Edit this file in any text editor (VS Code, Notepad etc.)
// Save it, then drag your orion-site folder to Netlify to redeploy
// Your changes go live in about 10 seconds
//
// ════════════════════════════════════════════════════════════════


// ── NEWS ─────────────────────────────────────────────────────────
// type options: "news" | "event" | "product"
// typeLabel: shown as the badge on the card
// img: use a URL or a relative path to an image in your site folder
// url: where the card links — use full https:// for external links
// ─────────────────────────────────────────────────────────────────
const NEWS_DATA = [
  {
    type: 'product',
    typeLabel: 'New product',
    date: 'March 2025',
    title: 'Helix Modular Sorter — now with 20,000+ parcels/hr capacity',
    excerpt: 'The latest Helix configuration supports throughput targets of over 20,000 parcels per hour — making it one of the highest-capacity modular sorters available at this price point in the UK.',
    img: 'https://www.orionmis.co.uk/front/images/product/unithandling (1).png',
    url: 'helix-product.html'
  },
  {
    type: 'news',
    typeLabel: 'Company news',
    date: 'February 2025',
    title: 'Orion MIS completes major sortation installation for leading parcel carrier',
    excerpt: 'Orion has completed a multi-Helix sortation system installation for a leading UK parcel carrier — going from order to live operation in under 30 days.',
    img: 'https://www.orionmis.co.uk/front/images/solution/solutionslider (2).png',
    url: '#'
  },
  {
    type: 'news',
    typeLabel: 'Industry',
    date: 'January 2025',
    title: 'UK e-commerce volumes hit record high — what it means for warehouse automation',
    excerpt: 'With UK online retail growing again after two years of correction, operations teams are revisiting automation investment. Orion\'s engineers share what they\'re seeing on the ground.',
    img: 'https://www.orionmis.co.uk/front/images/solution/solutionslider (13).png',
    url: 'https://www.orionmis.co.uk/blogs'
  }
];


// ── EVENTS ───────────────────────────────────────────────────────
// date: use format "YYYY-MM-DD" for correct sorting
// location: venue name and city
// time: e.g. "9:00am – 5:00pm"
// url: registration or info link (optional)
// ─────────────────────────────────────────────────────────────────
const EVENTS_DATA = [
  {
    title: 'Robotics & Automation Exhibition 2025',
    date: '2025-06-03',
    location: 'NEC Birmingham',
    time: '9:00am – 5:00pm',
    url: 'https://www.ppmashow.co.uk'
  },
  {
    title: 'Multimodal 2025',
    date: '2025-06-10',
    location: 'NEC Birmingham',
    time: '9:00am – 5:30pm',
    url: 'https://www.multimodal.org.uk'
  },
  {
    title: 'Orion Open Day — Chichester Facility',
    date: '2025-09-15',
    location: 'Orion MIS, Fontwell, Chichester',
    time: '10:00am – 3:00pm',
    url: 'contact.html'
  },
  {
    title: 'IntraLogisteX 2026',
    date: '2026-03-24',
    location: 'Ricoh Arena, Coventry',
    time: '9:00am – 4:30pm',
    url: 'https://www.intralogistex.co.uk'
  }
];


// ── DOCUMENT VAULT ────────────────────────────────────────────────
// category options: "brochure" | "datasheet" | "guide" | "drawing"
// type options: "pdf" | "doc" | "xls" | "dwg" | "zip"
// url: path to file — place files in your orion-site folder and use the filename
//      e.g. url: 'downloads/helix-brochure.pdf'
//      Or link to an external URL for hosted files
// size: e.g. "2.4 MB"
// updated: e.g. "Mar 2025"
// ─────────────────────────────────────────────────────────────────
const VAULT_DATA = [
  {
    category: 'brochure',
    type: 'pdf',
    title: 'Helix Modular Sorter — Product Brochure',
    description: 'Full product overview, specifications, and case study highlights',
    url: '#',  // Replace with: 'downloads/helix-brochure.pdf'
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'datasheet',
    type: 'pdf',
    title: 'Helix Technical Datasheet',
    description: 'Full mechanical and performance specifications',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'datasheet',
    type: 'pdf',
    title: 'ModFlex Unit Handling — Product Range',
    description: 'Powered roller, belt, curve, alignment and transfer conveyors',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'datasheet',
    type: 'pdf',
    title: 'Pallet Handling Range — Technical Sheet',
    description: 'Full pallet conveyor, transfer, turntable and chain/belt specifications',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'guide',
    type: 'pdf',
    title: 'How to Build a Business Case for Sortation Automation',
    description: 'A practical guide for operations managers — ROI models, payback periods, and finance options',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'guide',
    type: 'pdf',
    title: 'Orion Life Cycle Support — Service & Maintenance Guide',
    description: 'Support packages, response times, and what\'s included in your 24-month warranty',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'drawing',
    type: 'dwg',
    title: 'Helix System — Standard Layout DXF',
    description: 'AutoCAD-compatible layout drawing for 10-destination Helix system',
    url: '#',
    size: '–',
    updated: 'coming soon'
  },
  {
    category: 'drawing',
    type: 'pdf',
    title: 'ModFlex Roller Conveyor — Installation Drawing',
    description: 'Standard installation detail drawing — PDF format',
    url: '#',
    size: '–',
    updated: 'coming soon'
  }
];

// ════════════════════════════════════════════════════════════════
// END OF DATA FILE — do not edit below this line
// ════════════════════════════════════════════════════════════════
