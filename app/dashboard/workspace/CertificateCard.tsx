'use client'
import { useRef } from 'react'
import { Download, Share2, Award } from 'lucide-react' // Changed Linkedin to Share2

interface CertificateProps {
  studentName: string
  courseName: string
  date: string
  awardType?: string
}

export default function CertificateCard({ studentName, courseName, date, awardType = "Certificate of Completion" }: CertificateProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // 1. DOWNLOAD AS PNG LOGIC
  const handleDownloadPNG = () => {
    if (!svgRef.current) return
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    // Scale up for high-res download
    canvas.width = 2000
    canvas.height = 1414
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const a = document.createElement('a')
        a.download = `${studentName.replace(' ', '_')}_Apex_Certificate.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // 2. ADD TO LINKEDIN LOGIC
  const handleAddToLinkedIn = () => {
    const issueDate = new Date(date)
    const issueYear = issueDate.getFullYear()
    const issueMonth = issueDate.getMonth() + 1 

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseName)}&organizationName=Apex%20Studio&issueYear=${issueYear}&issueMonth=${issueMonth}`
    
    window.open(linkedInUrl, '_blank')
  }

  return (
    <div className="flex flex-col items-center gap-6">
      
      {/* THE DYNAMIC SVG CERTIFICATE */}
      <div className="w-full max-w-4xl shadow-2xl shadow-yellow-900/20 bg-white overflow-hidden rounded">
        <svg 
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1000 707" 
          className="w-full h-auto font-serif"
          style={{ backgroundColor: '#ffffff' }}
        >
          <defs>
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600&display=swap');
                .title { font-family: 'Cinzel', serif; font-size: 42px; font-weight: 700; fill: #1e293b; text-anchor: middle; }
                .subtitle { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; fill: #d4af37; text-anchor: middle; letter-spacing: 4px; text-transform: uppercase; }
                .text { font-family: 'Playfair Display', serif; font-size: 18px; fill: #64748b; text-anchor: middle; font-style: italic; }
                .name { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; fill: #0f172a; text-anchor: middle; }
                .course { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 600; fill: #1e293b; text-anchor: middle; }
                .signature-text { font-family: 'Montserrat', sans-serif; font-size: 12px; fill: #64748b; text-anchor: middle; letter-spacing: 1px; }
              `}
            </style>
          </defs>

          {/* Outer Border */}
          <rect x="20" y="20" width="960" height="667" fill="none" stroke="#d4af37" strokeWidth="12" />
          {/* Inner Border */}
          <rect x="35" y="35" width="930" height="637" fill="none" stroke="#d4af37" strokeWidth="2" />
          {/* Subtle Corner Accents */}
          <path d="M 45 45 L 85 45 L 85 35 L 35 35 L 35 85 L 45 85 Z" fill="#1e293b" />
          <path d="M 955 45 L 915 45 L 915 35 L 965 35 L 965 85 L 955 85 Z" fill="#1e293b" />
          <path d="M 45 662 L 85 662 L 85 672 L 35 672 L 35 622 L 45 622 Z" fill="#1e293b" />
          <path d="M 955 662 L 915 662 L 915 672 L 965 672 L 965 622 L 955 622 Z" fill="#1e293b" />

          {/* Top Logo / Seal Area */}
          <g transform="translate(500, 120)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="#d4af37" strokeWidth="4" />
            <circle cx="0" cy="0" r="32" fill="#d4af37" />
            <path d="M -12 10 L 0 -15 L 12 10 Z" fill="#ffffff" />
          </g>

          {/* Main Content */}
          <text x="500" y="220" className="subtitle">{awardType}</text>
          <text x="500" y="270" className="title">CERTIFICATE OF ACHIEVEMENT</text>
          <text x="500" y="330" className="text">This is proudly presented to</text>
          
          {/* Dynamic Name */}
          <text x="500" y="420" className="name">{studentName}</text>
          
          <line x1="300" y1="440" x2="700" y2="440" stroke="#cbd5e1" strokeWidth="1" />
          
          <text x="500" y="480" className="text">for successfully completing the rigorous requirements of</text>
          
          {/* Dynamic Course */}
          <text x="500" y="530" className="course">{courseName}</text>

          {/* Signatures & Date */}
          <g transform="translate(250, 620)">
            <line x1="-80" y1="0" x2="80" y2="0" stroke="#1e293b" strokeWidth="1" />
            <text x="0" y="20" className="signature-text">DATE OF ISSUE</text>
            <text x="0" y="-10" className="course" style={{fontSize: '16px'}}>{date}</text>
          </g>

          <g transform="translate(750, 620)">
            <line x1="-80" y1="0" x2="80" y2="0" stroke="#1e293b" strokeWidth="1" />
            <text x="0" y="20" className="signature-text">LEAD INSTRUCTOR</text>
            <text x="0" y="-10" className="text" style={{fontStyle: 'normal', color: '#1e293b'}}>Apex Admin</text>
          </g>
        </svg>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleDownloadPNG}
          className="bg-white hover:bg-gray-100 text-black border border-gray-300 px-6 py-2.5 rounded shadow flex items-center gap-2 font-bold text-sm transition-all"
        >
          <Download className="w-4 h-4" /> Download High-Res PNG
        </button>
        
        <button 
          onClick={handleAddToLinkedIn}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-2.5 rounded shadow flex items-center gap-2 font-bold text-sm transition-all"
        >
          {/* Changed Linkedin icon to Share2 icon here */}
          <Share2 className="w-4 h-4" /> Add to LinkedIn Profile
        </button>
      </div>

    </div>
  )
}