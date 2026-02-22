/**
 * CourseBackground
 * Fixed full-screen SVG that pans vertically as you scroll —
 * green + flagstick at top, fairway in the middle, tee box at bottom.
 * Uses a scroll listener to translateY the inner SVG so you "walk
 * down the hole" as you scroll through the page.
 */
import { useEffect, useRef } from 'react'

export default function CourseBackground() {
  const svgRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      if (!svgRef.current) return
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      // SVG viewBox is 3200 tall, viewport shows 900px worth
      // So we can pan up to (3200 - 900) = 2300 units
      const pan = progress * 2300
      svgRef.current.setAttribute('viewBox', `0 ${pan} 1440 900`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="course-bg" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        <defs>
          {/* Base rough */}
          <linearGradient id="roughBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#071a0e" />
            <stop offset="18%"  stopColor="#0d2e18" />
            <stop offset="45%"  stopColor="#0f3a1e" />
            <stop offset="72%"  stopColor="#0d3018" />
            <stop offset="100%" stopColor="#071a0e" />
          </linearGradient>

          {/* Putting green */}
          <radialGradient id="greenGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#3dba6a" />
            <stop offset="55%"  stopColor="#2ea055" />
            <stop offset="100%" stopColor="#1e7a3e" />
          </radialGradient>

          {/* Fairway corridor */}
          <linearGradient id="fairwayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2d9c52" stopOpacity="0.9" />
            <stop offset="50%"  stopColor="#267a43" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1e6636" stopOpacity="0.9" />
          </linearGradient>

          {/* Tee box */}
          <radialGradient id="teeGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="#3aaa60" />
            <stop offset="60%"  stopColor="#2a8a4a" />
            <stop offset="100%" stopColor="#1a6030" />
          </radialGradient>

          {/* Sand */}
          <radialGradient id="sandGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#eddba8" />
            <stop offset="70%"  stopColor="#d4bc82" />
            <stop offset="100%" stopColor="#b89a5a" />
          </radialGradient>

          {/* Water */}
          <linearGradient id="pondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0f2d4a" />
            <stop offset="50%"  stopColor="#163c5e" />
            <stop offset="100%" stopColor="#0a2035" />
          </linearGradient>

          {/* Mow stripes — vertical bands */}
          <pattern id="mowV" x="0" y="0" width="72" height="3200" patternUnits="userSpaceOnUse">
            <rect x="0"  y="0" width="36" height="3200" fill="#ffffff" fillOpacity="0.035" />
            <rect x="36" y="0" width="36" height="3200" fill="#000000" fillOpacity="0.025" />
          </pattern>

          {/* Horizontal mow stripes on putting green */}
          <pattern id="mowH" x="0" y="0" width="600" height="28" patternUnits="userSpaceOnUse">
            <rect x="0" y="0"  width="600" height="14" fill="#ffffff" fillOpacity="0.05" />
            <rect x="0" y="14" width="600" height="14" fill="#000000" fillOpacity="0.04" />
          </pattern>

          {/* Water shimmer */}
          <pattern id="waterShimmer" x="0" y="0" width="90" height="22" patternUnits="userSpaceOnUse">
            <ellipse cx="45" cy="11" rx="38" ry="2.5" fill="#ffffff" fillOpacity="0.07" />
          </pattern>

          {/* Vignette — darkens left/right edges of corridor */}
          <linearGradient id="vigL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.7" />
            <stop offset="22%"  stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vigR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="78%"  stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
          </linearGradient>

          {/* Top dark gradient for readability */}
          <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.55" />
            <stop offset="12%"  stopColor="#000" stopOpacity="0" />
          </linearGradient>

          {/* Flag shadow */}
          <filter id="flagShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
          </filter>

          {/* Soft glow behind green */}
          <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#2dff80" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2dff80" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ══════════════════════════════════════════
            BASE — full rough background
        ══════════════════════════════════════════ */}
        <rect width="1440" height="3200" fill="url(#roughBg)" />

        {/* Tree masses — left and right edges throughout */}
        <rect x="0"    y="0" width="160" height="3200" fill="#040e07" fillOpacity="0.85" />
        <rect x="1280" y="0" width="160" height="3200" fill="#040e07" fillOpacity="0.85" />
        <rect x="0"    y="0" width="80"  height="3200" fill="#020704" fillOpacity="0.6" />
        <rect x="1360" y="0" width="80"  height="3200" fill="#020704" fillOpacity="0.6" />

        {/* Tree silhouettes left */}
        {[80,180,280,380,480,580,680,780,880,980,1080,1180,1280,1380,1480,1580,1680,1780,1880,1980,2080,2180,2280,2380,2480,2580,2680,2780,2880,2980,3080,3180].map((y, i) => (
          <ellipse key={`tL${i}`} cx={50 + (i % 3) * 22} cy={y} rx={38 + (i%2)*14} ry={55 + (i%3)*18} fill="#020b05" fillOpacity="0.7" />
        ))}
        {/* Tree silhouettes right */}
        {[120,230,340,440,540,640,740,840,940,1040,1140,1240,1340,1440,1540,1640,1740,1840,1940,2040,2140,2240,2340,2440,2540,2640,2740,2840,2940,3040,3140].map((y, i) => (
          <ellipse key={`tR${i}`} cx={1390 - (i % 3) * 20} cy={y} rx={36 + (i%2)*12} ry={52 + (i%3)*16} fill="#020b05" fillOpacity="0.7" />
        ))}

        {/* ══════════════════════════════════════════
            SECTION 1 — PUTTING GREEN (top, y 0–600)
        ══════════════════════════════════════════ */}

        {/* Green glow halo */}
        <ellipse cx="720" cy="320" rx="520" ry="340" fill="url(#greenGlow)" />

        {/* Fringe ring */}
        <ellipse cx="720" cy="310" rx="310" ry="210" fill="#217a3c" fillOpacity="0.9" />

        {/* Putting green surface */}
        <ellipse cx="720" cy="300" rx="270" ry="185" fill="url(#greenGrad)" />

        {/* Mow stripe overlay on green */}
        <ellipse cx="720" cy="300" rx="270" ry="185" fill="url(#mowH)" fillOpacity="0.9" />

        {/* Green highlight */}
        <ellipse cx="680" cy="255" rx="130" ry="75" fill="#4ecb7a" fillOpacity="0.13" />

        {/* ── Flagstick ── */}
        {/* Cup */}
        <ellipse cx="780" cy="308" rx="13" ry="8" fill="#0a1a0e" />
        <ellipse cx="780" cy="306" rx="10" ry="6" fill="#111" />
        {/* Pin */}
        <line x1="780" y1="308" x2="780" y2="118" stroke="#e8e8e8" strokeWidth="3.5" filter="url(#flagShadow)" />
        {/* Flag */}
        <path d="M780 118 L840 136 L780 154 Z" fill="#c0392b" filter="url(#flagShadow)" />
        <path d="M780 118 L840 136 L780 154 Z" fill="#e74c3c" fillOpacity="0.6" />

        {/* Yardage circle on green */}
        <circle cx="650" cy="340" r="22" fill="#0a1a0e" fillOpacity="0.7" />
        <text x="650" y="346" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">PIN</text>

        {/* Fringe collar path */}
        <path d="M450 310 Q560 200 720 200 Q880 200 990 310 Q1050 370 990 430 Q880 520 720 510 Q560 520 450 430 Q390 370 450 310Z"
          fill="none" stroke="#1a6030" strokeWidth="6" strokeOpacity="0.5" />

        {/* Distance markers near green */}
        <circle cx="720" cy="520" r="16" fill="#fff" fillOpacity="0.15" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.4" />
        <text x="720" y="526" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="sans-serif" fillOpacity="0.8">100</text>

        {/* ══════════════════════════════════════════
            SECTION 2 — UPPER FAIRWAY (y 500–1300)
            Corridor narrows slightly from green
        ══════════════════════════════════════════ */}

        {/* Fairway corridor — gentle dogleg right */}
        <path
          d="M 480 500
             C 460 620, 450 750, 470 900
             C 490 1050, 530 1150, 560 1280
             L 960 1280
             C 980 1150, 1010 1050, 1000 900
             C 990 750, 970 620, 960 500
             Z"
          fill="url(#fairwayGrad)"
          fillOpacity="0.82"
        />

        {/* Mow stripes on upper fairway */}
        <path
          d="M 480 500 C 460 620,450 750,470 900 C 490 1050,530 1150,560 1280
             L 960 1280 C 980 1150,1010 1050,1000 900 C 990 750,970 620,960 500 Z"
          fill="url(#mowV)"
        />

        {/* 150-yard marker (white posts) */}
        <rect x="462" y="820" width="8" height="32" rx="3" fill="#ffffff" fillOpacity="0.85" />
        <rect x="994" y="820" width="8" height="32" rx="3" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="466" cy="818" r="5" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="998" cy="818" r="5" fill="#ffffff" fillOpacity="0.9" />
        <text x="720" y="845" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="sans-serif" fillOpacity="0.7">150 yds</text>

        {/* Upper fairway bunker — left side */}
        <ellipse cx="420" cy="670" rx="70" ry="38" fill="#8a6820" fillOpacity="0.3" />
        <ellipse cx="416" cy="665" rx="74" ry="41" fill="url(#sandGrad)" fillOpacity="0.88" />
        <ellipse cx="414" cy="660" rx="56" ry="30" fill="#eddba8" fillOpacity="0.55" />

        {/* Upper fairway bunker — right side */}
        <ellipse cx="1040" cy="1050" rx="80" ry="44" fill="#8a6820" fillOpacity="0.28" />
        <ellipse cx="1036" cy="1045" rx="84" ry="47" fill="url(#sandGrad)" fillOpacity="0.85" />
        <ellipse cx="1034" cy="1040" rx="64" ry="34" fill="#eddba8" fillOpacity="0.5" />

        {/* ══════════════════════════════════════════
            SECTION 3 — DOGLEG / MID FAIRWAY (y 1200–2100)
            Bends left — the elbow of the hole
        ══════════════════════════════════════════ */}

        {/* Elbow corridor — swings left */}
        <path
          d="M 560 1280
             C 540 1380, 480 1480, 400 1560
             C 320 1640, 260 1720, 280 1840
             C 300 1960, 400 2020, 520 2060
             L 680 2060
             C 700 1980, 700 1880, 660 1800
             C 620 1720, 620 1640, 660 1560
             C 720 1460, 800 1380, 840 1280
             Z"
          fill="url(#fairwayGrad)"
          fillOpacity="0.78"
        />
        <path
          d="M 560 1280 C 540 1380,480 1480,400 1560 C 320 1640,260 1720,280 1840
             C 300 1960,400 2020,520 2060 L 680 2060
             C 700 1980,700 1880,660 1800 C 620 1720,620 1640,660 1560
             C 720 1460,800 1380,840 1280 Z"
          fill="url(#mowV)"
        />

        {/* Water hazard — left of dogleg elbow */}
        <ellipse cx="210" cy="1650" rx="155" ry="90" fill="#0a1e30" fillOpacity="0.3" />
        <ellipse cx="205" cy="1645" rx="160" ry="95" fill="url(#pondGrad)" fillOpacity="0.92" />
        <ellipse cx="205" cy="1645" rx="160" ry="95" fill="url(#waterShimmer)" fillOpacity="0.85" />
        {/* Pond glare */}
        <ellipse cx="175" cy="1615" rx="70" ry="35" fill="#ffffff" fillOpacity="0.08" />
        {/* Shoreline */}
        <ellipse cx="205" cy="1645" rx="162" ry="97" fill="none" stroke="#1a5c2a" strokeWidth="6" strokeOpacity="0.5" />
        {/* Hazard stake */}
        <line x1="350" y1="1580" x2="350" y2="1630" stroke="#e8c93c" strokeWidth="3" />
        <rect x="345" y="1578" width="10" height="6" rx="1" fill="#e8c93c" />
        {/* Water text */}
        <text x="205" y="1650" textAnchor="middle" fill="#4a9edd" fontSize="14" fontFamily="sans-serif" fillOpacity="0.6">WATER</text>

        {/* Dogleg elbow bunker — inside corner */}
        <ellipse cx="700" cy="1430" rx="65" ry="36" fill="#8a6820" fillOpacity="0.3" />
        <ellipse cx="696" cy="1425" rx="68" ry="39" fill="url(#sandGrad)" fillOpacity="0.88" />
        <ellipse cx="694" cy="1420" rx="52" ry="28" fill="#eddba8" fillOpacity="0.55" />

        {/* Dogleg elbow bunker — outside corner */}
        <ellipse cx="230" cy="1820" rx="72" ry="40" fill="#8a6820" fillOpacity="0.28" />
        <ellipse cx="226" cy="1815" rx="75" ry="43" fill="url(#sandGrad)" fillOpacity="0.85" />
        <ellipse cx="224" cy="1810" rx="58" ry="32" fill="#eddba8" fillOpacity="0.5" />

        {/* 200-yard marker */}
        <circle cx="580" cy="1650" r="18" fill="#fff" fillOpacity="0.12" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.35" />
        <text x="580" y="1656" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="sans-serif" fillOpacity="0.7">200</text>

        {/* ══════════════════════════════════════════
            SECTION 4 — LOWER FAIRWAY (y 2000–2700)
            Corridor widens back toward tee
        ══════════════════════════════════════════ */}

        <path
          d="M 520 2060
             C 490 2180, 470 2300, 460 2440
             C 450 2580, 460 2680, 480 2760
             L 960 2760
             C 980 2680, 990 2580, 980 2440
             C 970 2300, 950 2180, 920 2060
             Z"
          fill="url(#fairwayGrad)"
          fillOpacity="0.80"
        />
        <path
          d="M 520 2060 C 490 2180,470 2300,460 2440 C 450 2580,460 2680,480 2760
             L 960 2760 C 980 2680,990 2580,980 2440 C 970 2300,950 2180,920 2060 Z"
          fill="url(#mowV)"
        />

        {/* 250-yard marker */}
        <rect x="453" y="2270" width="8" height="28" rx="3" fill="#ffdd44" fillOpacity="0.8" />
        <rect x="979" y="2270" width="8" height="28" rx="3" fill="#ffdd44" fillOpacity="0.8" />
        <text x="720" y="2295" textAnchor="middle" fill="#ffdd44" fontSize="12" fontFamily="sans-serif" fillOpacity="0.75">250 yds</text>

        {/* Mid fairway bunker */}
        <ellipse cx="980" cy="2200" rx="75" ry="42" fill="#8a6820" fillOpacity="0.28" />
        <ellipse cx="976" cy="2195" rx="78" ry="45" fill="url(#sandGrad)" fillOpacity="0.85" />
        <ellipse cx="974" cy="2190" rx="60" ry="34" fill="#eddba8" fillOpacity="0.5" />

        {/* Second water hazard — right side lower fairway */}
        <ellipse cx="1250" cy="2400" rx="140" ry="80" fill="#0a1e30" fillOpacity="0.28" />
        <ellipse cx="1246" cy="2396" rx="145" ry="84" fill="url(#pondGrad)" fillOpacity="0.9" />
        <ellipse cx="1246" cy="2396" rx="145" ry="84" fill="url(#waterShimmer)" fillOpacity="0.8" />
        <ellipse cx="1220" cy="2370" rx="60" ry="28" fill="#ffffff" fillOpacity="0.07" />
        <text x="1246" y="2400" textAnchor="middle" fill="#4a9edd" fontSize="13" fontFamily="sans-serif" fillOpacity="0.6">WATER</text>

        {/* ══════════════════════════════════════════
            SECTION 5 — TEE BOX (bottom, y 2700–3200)
        ══════════════════════════════════════════ */}

        {/* Tee box surface */}
        <rect x="580" y="2820" width="280" height="160" rx="18" fill="url(#teeGrad)" />
        <rect x="580" y="2820" width="280" height="160" rx="18" fill="url(#mowH)" fillOpacity="0.8" />

        {/* Tee box border */}
        <rect x="580" y="2820" width="280" height="160" rx="18" fill="none" stroke="#1a7a38" strokeWidth="4" strokeOpacity="0.6" />

        {/* Tee markers */}
        {/* Blue tees */}
        <circle cx="660" cy="2848" r="9" fill="#1a56db" stroke="#fff" strokeWidth="2" />
        <text x="660" y="2875" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="sans-serif">BLUE</text>
        {/* White tees */}
        <circle cx="720" cy="2848" r="9" fill="#e5e7eb" stroke="#fff" strokeWidth="2" />
        <text x="720" y="2875" textAnchor="middle" fill="#e5e7eb" fontSize="10" fontFamily="sans-serif">WHITE</text>
        {/* Red tees */}
        <circle cx="780" cy="2848" r="9" fill="#dc2626" stroke="#fff" strokeWidth="2" />
        <text x="780" y="2875" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="sans-serif">RED</text>

        {/* Tee label */}
        <text x="720" y="2970" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fillOpacity="0.5" letterSpacing="6">TEE BOX</text>

        {/* Direction arrow pointing up the fairway */}
        <path d="M720 2810 L700 2840 L710 2840 L710 2870 L730 2870 L730 2840 L740 2840 Z"
          fill="#ffffff" fillOpacity="0.25" />

        {/* Tee box bunker — left */}
        <ellipse cx="460" cy="2900" rx="90" ry="48" fill="#8a6820" fillOpacity="0.25" />
        <ellipse cx="456" cy="2895" rx="94" ry="52" fill="url(#sandGrad)" fillOpacity="0.82" />
        <ellipse cx="454" cy="2890" rx="72" ry="38" fill="#eddba8" fillOpacity="0.48" />

        {/* Tee box bunker — right */}
        <ellipse cx="980" cy="2900" rx="90" ry="48" fill="#8a6820" fillOpacity="0.25" />
        <ellipse cx="976" cy="2895" rx="94" ry="52" fill="url(#sandGrad)" fillOpacity="0.82" />
        <ellipse cx="974" cy="2890" rx="72" ry="38" fill="#eddba8" fillOpacity="0.48" />

        {/* ══════════════════════════════════════════
            OVERLAYS — vignette, readability film
        ══════════════════════════════════════════ */}

        {/* Left tree shadow */}
        <rect x="0" y="0" width="1440" height="3200" fill="url(#vigL)" />
        {/* Right tree shadow */}
        <rect x="0" y="0" width="1440" height="3200" fill="url(#vigR)" />
        {/* Top fade for nav readability */}
        <rect x="0" y="0" width="1440" height="400" fill="url(#topFade)" />
        {/* Overall dark film for text legibility */}
        <rect x="0" y="0" width="1440" height="3200" fill="#000" fillOpacity="0.28" />
      </svg>
    </div>
  )
}
