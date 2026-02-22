/**
 * HoleMap.jsx
 * Overhead SVG illustration of each hole at Riverside Golf Course.
 * Each hole is hand-crafted with unique fairway shape, bunker placement,
 * green position, water hazards, and yardage markers.
 *
 * Usage:
 *   <HoleMap holeNum={1} par={4} yards={395} tee="white" />
 */

// ─── Shared SVG primitives ──────────────────────────────────────────────────

function Bunker({ cx, cy, rx, ry, rotate = 0 }) {
  const t = rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined
  return (
    <g transform={t}>
      <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 3} fill="#7a5e1a" fillOpacity="0.35" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#e8d49a" />
      <ellipse cx={cx - rx * 0.2} cy={cy - ry * 0.2} rx={rx * 0.55} ry={ry * 0.45} fill="#f0e0b0" fillOpacity="0.7" />
    </g>
  )
}

function Water({ points }) {
  return (
    <g>
      <polygon points={points} fill="#0f2d4a" fillOpacity="0.88" />
      <polygon points={points} fill="none" stroke="#1a4a6a" strokeWidth="2" strokeOpacity="0.6" />
      <polygon points={points} fill="#4a9edd" fillOpacity="0.07" />
    </g>
  )
}

function Green({ cx, cy, rx = 28, ry = 20, flagOffX = 8 }) {
  const fx = cx + flagOffX
  const fy = cy
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx + 8} ry={ry + 6} fill="#217a3c" fillOpacity="0.85" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#3dba6a" />
      <ellipse cx={cx - 6} cy={cy - 5} rx={rx * 0.4} ry={ry * 0.35} fill="#5dd68a" fillOpacity="0.4" />
      <circle cx={fx} cy={fy} r={4} fill="#0a1a0e" />
      <line x1={fx} y1={fy} x2={fx} y2={fy - 28} stroke="#ddd" strokeWidth="1.5" />
      <path d={`M${fx} ${fy - 28} L${fx + 14} ${fy - 20} L${fx} ${fy - 12}Z`} fill="#c0392b" />
    </g>
  )
}

function TeeBox({ cx, cy, w = 20, h = 13 }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={3} fill="#2d9c52" stroke="#1a6030" strokeWidth="1.5" />
      <circle cx={cx - 4} cy={cy - h / 2 - 3} r={3} fill="#1a56db" stroke="#fff" strokeWidth="1" />
      <circle cx={cx + 4} cy={cy - h / 2 - 3} r={3} fill="#e5e7eb" stroke="#fff" strokeWidth="1" />
    </g>
  )
}

function YardageMarker({ x, y, yards, color = '#fff' }) {
  return (
    <g>
      <circle cx={x} cy={y} r={12} fill="#000" fillOpacity="0.5" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="9" fontFamily="sans-serif" fontWeight="bold">{yards}</text>
    </g>
  )
}

function Fairway({ d }) {
  return (
    <g>
      <path d={d} fill="#267a43" fillOpacity="0.9" />
      <path d={d} fill="url(#hmMow)" fillOpacity="0.8" />
    </g>
  )
}

function Rough() {
  return <rect x={0} y={0} width={340} height={480} fill="#0d3018" fillOpacity="0.92" />
}

// ─── 18 Hole layouts ────────────────────────────────────────────────────────

const HOLES = {
  // Hole 1 — Par 4, 395 yds — Gentle dogleg right
  1: () => (
    <g>
      <Rough />
      <Fairway d="M130 435 C126 372,128 305,140 248 C154 182,178 138,208 118 C228 104,256 98,278 104 L290 128 C268 122,244 128,226 142 C200 160,180 200,168 262 C156 322,152 384,156 442Z" />
      <Water points="30,285 88,268 96,328 34,342" />
      <Bunker cx={108} cy={216} rx={18} ry={11} />
      <Bunker cx={295} cy={148} rx={15} ry={9} />
      <Bunker cx={268} cy={92} rx={16} ry={10} rotate={15} />
      <Green cx={270} cy={78} rx={26} ry={17} />
      <TeeBox cx={143} cy={448} />
      <YardageMarker x={152} y={318} yards={150} />
      <YardageMarker x={158} y={235} yards={100} />
    </g>
  ),

  // Hole 2 — Par 5, 520 yds — Long straight, water left
  2: () => (
    <g>
      <Rough />
      <Fairway d="M122 455 C118 385,115 308,118 228 C121 155,128 105,143 72 C153 50,170 38,188 35 L208 35 C224 38,238 52,246 74 C260 106,264 154,262 228 C260 305,257 382,253 455Z" />
      <Water points="22,355 92,338 98,425 26,432" />
      <Water points="22,202 88,188 92,255 24,264" />
      <Bunker cx={272} cy={305} rx={20} ry={12} />
      <Bunker cx={110} cy={162} rx={16} ry={10} />
      <Bunker cx={178} cy={26} rx={22} ry={12} rotate={5} />
      <Bunker cx={216} cy={26} rx={18} ry={10} rotate={-5} />
      <Green cx={195} cy={24} rx={28} ry={17} />
      <TeeBox cx={185} cy={462} />
      <YardageMarker x={182} y={335} yards={150} />
      <YardageMarker x={182} y={232} yards={250} color="#ffdd44" />
    </g>
  ),

  // Hole 3 — Par 3, 185 yds — Forced carry over water
  3: () => (
    <g>
      <Rough />
      <path d="M142 425 C138 362,140 285,150 222 C160 162,174 122,188 102 L212 102 C226 124,238 164,242 224 C248 288,246 364,242 425Z" fill="#267a43" fillOpacity="0.62" />
      <Water points="82,302 132,288,148,385,84,392" />
      <Water points="222,294 278,280,282,372,224,380" />
      <Bunker cx={160} cy={118} rx={20} ry={11} />
      <Bunker cx={220} cy={114} rx={18} ry={10} />
      <Green cx={192} cy={86} rx={30} ry={20} />
      <TeeBox cx={192} cy={445} w={24} h={14} />
      <YardageMarker x={192} y={302} yards={100} />
    </g>
  ),

  // Hole 4 — Par 4, 410 yds — Dogleg left, bunker in elbow
  4: () => (
    <g>
      <Rough />
      <Fairway d="M162 448 C160 388,162 325,156 268 C148 208,128 168,106 144 C86 122,66 112,52 110 L46 133 C60 136,78 146,95 164 C118 190,135 226,142 278 C150 335,150 392,150 452Z" />
      <Bunker cx={78} cy={130} rx={18} ry={11} rotate={-20} />
      <Bunker cx={170} cy={302} rx={16} ry={10} />
      <Bunker cx={40} cy={90} rx={20} ry={12} />
      <Bunker cx={70} cy={78} rx={15} ry={9} />
      <Green cx={56} cy={70} rx={25} ry={17} />
      <TeeBox cx={156} cy={460} />
      <YardageMarker x={148} y={322} yards={150} />
      <YardageMarker x={128} y={235} yards={200} />
    </g>
  ),

  // Hole 5 — Par 4, 380 yds — Straight, tree-lined
  5: () => (
    <g>
      <Rough />
      <Fairway d="M150 452 C146 388,144 312,147 245 C150 182,160 134,174 104 C182 82,194 70,208 67 L222 67 C234 70,244 84,250 106 C262 136,268 184,268 246 C268 312,264 388,260 452Z" />
      <Bunker cx={136} cy={212} rx={16} ry={10} />
      <Bunker cx={278} cy={198} rx={16} ry={10} />
      <Bunker cx={202} cy={56} rx={24} ry={13} />
      <Green cx={212} cy={52} rx={26} ry={17} />
      <TeeBox cx={202} cy={462} />
      <YardageMarker x={202} y={302} yards={150} />
    </g>
  ),

  // Hole 6 — Par 5, 545 yds — S-curve double dogleg
  6: () => (
    <g>
      <Rough />
      <Fairway d="M158 462 C154 402,150 338,154 280 C158 224,170 194,187 180 C204 166,224 162,240 154 C260 144,274 124,277 97 C280 74,270 54,257 44 L240 44 C250 54,257 70,254 92 C250 114,237 132,218 142 C200 152,180 156,164 170 C146 186,134 214,130 270 C126 328,130 392,132 458Z" />
      <Water points="282,202 322,192,320,262,280,267" />
      <Bunker cx={242} cy={162} rx={18} ry={10} rotate={-15} />
      <Bunker cx={132} cy={242} rx={18} ry={11} />
      <Bunker cx={110} cy={342} rx={16} ry={10} />
      <Bunker cx={250} cy={52} rx={20} ry={11} />
      <Green cx={250} cy={38} rx={27} ry={17} />
      <TeeBox cx={144} cy={468} />
      <YardageMarker x={140} y={362} yards={150} />
      <YardageMarker x={152} y={262} yards={250} color="#ffdd44" />
    </g>
  ),

  // Hole 7 — Par 3, 175 yds — Green behind bunker wall
  7: () => (
    <g>
      <Rough />
      <path d="M147 442 C144 378,146 298,156 234 C166 172,180 130,198 110 L218 110 C234 132,246 172,250 234 C256 298,254 376,250 442Z" fill="#267a43" fillOpacity="0.62" />
      <Bunker cx={158} cy={124} rx={22} ry={12} rotate={10} />
      <Bunker cx={228} cy={120} rx={20} ry={11} rotate={-10} />
      <Bunker cx={198} cy={100} rx={16} ry={9} />
      <Green cx={198} cy={80} rx={28} ry={18} />
      <TeeBox cx={198} cy={454} w={24} h={14} />
      <YardageMarker x={198} y={298} yards={100} />
    </g>
  ),

  // Hole 8 — Par 4, 420 yds — Dogleg right, water right side
  8: () => (
    <g>
      <Rough />
      <Fairway d="M102 452 C100 390,102 320,110 264 C120 202,142 167,170 150 C194 135,220 132,242 140 L250 162 C230 154,208 157,188 170 C164 186,146 218,138 272 C130 324,128 392,126 454Z" />
      <Water points="257,202 322,190,326,322,260,330" />
      <Bunker cx={242} cy={150} rx={18} ry={10} rotate={20} />
      <Bunker cx={114} cy={220} rx={16} ry={10} />
      <Bunker cx={258} cy={120} rx={20} ry={12} />
      <Bunker cx={282} cy={108} rx={16} ry={9} />
      <Green cx={272} cy={90} rx={26} ry={17} />
      <TeeBox cx={114} cy={462} />
      <YardageMarker x={120} y={322} yards={150} />
    </g>
  ),

  // Hole 9 — Par 4, 390 yds — Slight dogleg left, closing front nine
  9: () => (
    <g>
      <Rough />
      <Fairway d="M177 457 C174 394,172 328,167 270 C160 210,147 167,127 140 C112 118,92 107,74 104 L67 127 C82 130,98 140,112 160 C130 184,142 224,148 274 C154 330,156 392,158 460Z" />
      <Bunker cx={90} cy={124} rx={18} ry={11} rotate={-15} />
      <Bunker cx={170} cy={300} rx={16} ry={10} />
      <Bunker cx={57} cy={84} rx={20} ry={12} />
      <Bunker cx={87} cy={74} rx={15} ry={9} />
      <Green cx={70} cy={66} rx={25} ry={16} />
      <TeeBox cx={167} cy={465} />
      <YardageMarker x={156} y={328} yards={150} />
    </g>
  ),

  // Hole 10 — Par 4, 405 yds — Back nine opener, dogleg right
  10: () => (
    <g>
      <Rough />
      <Fairway d="M122 457 C120 392,122 324,130 270 C140 210,160 172,188 152 C210 136,236 130,258 137 L264 160 C244 152,222 158,202 172 C178 190,160 226,152 274 C144 328,142 392,140 460Z" />
      <Bunker cx={260} cy={150} rx={18} ry={10} rotate={18} />
      <Bunker cx={138} cy={232} rx={16} ry={10} />
      <Bunker cx={270} cy={120} rx={18} ry={11} />
      <Bunker cx={298} cy={107} rx={15} ry={9} />
      <Green cx={284} cy={88} rx={26} ry={17} />
      <TeeBox cx={131} cy={462} />
      <YardageMarker x={138} y={322} yards={150} />
    </g>
  ),

  // Hole 11 — Par 5, 530 yds — Long, water left, bunkers right
  11: () => (
    <g>
      <Rough />
      <Fairway d="M150 467 C147 402,145 332,148 267 C151 204,160 160,172 124 C182 94,197 74,212 64 L230 64 C244 74,256 96,264 126 C274 162,280 204,280 268 C280 332,276 402,272 467Z" />
      <Water points="22,322 102,307,107,412,24,420" />
      <Water points="22,182 97,170,102,250,24,258" />
      <Bunker cx={287} cy={242} rx={20} ry={12} />
      <Bunker cx={290} cy={342} rx={18} ry={11} />
      <Bunker cx={192} cy={54} rx={26} ry={13} />
      <Bunker cx={230} cy={52} rx={20} ry={11} />
      <Green cx={210} cy={44} rx={28} ry={17} />
      <TeeBox cx={210} cy={468} />
      <YardageMarker x={210} y={347} yards={150} />
      <YardageMarker x={210} y={247} yards={250} color="#ffdd44" />
    </g>
  ),

  // Hole 12 — Par 3, 190 yds — Longest par 3, water right
  12: () => (
    <g>
      <Rough />
      <path d="M150 450 C146 380,148 300,157 234 C166 172,180 130,196 110 L216 110 C232 132,244 172,250 236 C257 302,254 380,250 450Z" fill="#267a43" fillOpacity="0.62" />
      <Water points="242,262 308,250,312,352,244,360" />
      <Bunker cx={160} cy={122} rx={22} ry={12} rotate={8} />
      <Bunker cx={224} cy={117} rx={20} ry={11} rotate={-8} />
      <Bunker cx={167} cy={100} rx={14} ry={8} />
      <Green cx={187} cy={80} rx={32} ry={20} />
      <TeeBox cx={200} cy={457} w={24} h={14} />
      <YardageMarker x={198} y={300} yards={100} />
    </g>
  ),

  // Hole 13 — Par 4, 415 yds — Dogleg left, tough approach
  13: () => (
    <g>
      <Rough />
      <Fairway d="M187 457 C185 394,182 330,174 274 C164 214,144 174,117 150 C96 130,72 120,54 118 L48 142 C64 144,84 152,102 170 C126 194,144 230,152 280 C160 334,162 394,164 460Z" />
      <Bunker cx={70} cy={140} rx={18} ry={11} rotate={-18} />
      <Bunker cx={180} cy={302} rx={16} ry={10} />
      <Bunker cx={40} cy={98} rx={20} ry={12} />
      <Bunker cx={67} cy={87} rx={15} ry={9} />
      <Bunker cx={42} cy={74} rx={12} ry={8} />
      <Green cx={52} cy={68} rx={26} ry={17} />
      <TeeBox cx={176} cy={464} />
      <YardageMarker x={160} y={332} yards={150} />
    </g>
  ),

  // Hole 14 — Par 4, 385 yds — Straight with fairway bunkers
  14: () => (
    <g>
      <Rough />
      <Fairway d="M147 457 C144 390,142 317,145 250 C148 187,158 140,172 110 C182 88,196 74,210 70 L224 70 C237 74,248 90,256 112 C268 142,274 188,274 252 C274 318,270 390,266 457Z" />
      <Bunker cx={134} cy={262} rx={18} ry={11} />
      <Bunker cx={282} cy={282} rx={18} ry={11} />
      <Bunker cx={147} cy={182} rx={15} ry={9} />
      <Bunker cx={272} cy={187} rx={15} ry={9} />
      <Bunker cx={207} cy={60} rx={24} ry={13} />
      <Green cx={210} cy={52} rx={27} ry={17} />
      <TeeBox cx={208} cy={464} />
      <YardageMarker x={206} y={312} yards={150} />
    </g>
  ),

  // Hole 15 — Par 5, 555 yds — Longest hole, water right
  15: () => (
    <g>
      <Rough />
      <Fairway d="M102 470 C100 404,102 334,108 270 C114 207,126 164,142 132 C156 104,172 84,190 74 C204 66,220 64,234 70 L244 92 C230 84,216 84,204 92 C188 104,174 124,162 152 C148 184,138 226,134 272 C130 332,128 400,126 470Z" />
      <Water points="254,202 320,188,324,342,257,350" />
      <Bunker cx={244} cy={102} rx={18} ry={10} rotate={22} />
      <Bunker cx={114} cy={222} rx={18} ry={11} />
      <Bunker cx={118} cy={342} rx={16} ry={10} />
      <Bunker cx={197} cy={64} rx={24} ry={12} />
      <Bunker cx={230} cy={64} rx={18} ry={10} />
      <Green cx={212} cy={52} rx={28} ry={17} />
      <TeeBox cx={116} cy={470} />
      <YardageMarker x={122} y={352} yards={150} />
      <YardageMarker x={122} y={252} yards={250} color="#ffdd44" />
    </g>
  ),

  // Hole 16 — Par 3, 180 yds — Bunkers surrounding green
  16: () => (
    <g>
      <Rough />
      <path d="M152 447 C149 380,152 302,160 240 C168 180,182 137,198 114 L216 114 C230 138,242 180,247 242 C252 304,250 380,246 447Z" fill="#267a43" fillOpacity="0.62" />
      <Bunker cx={157} cy={127} rx={22} ry={12} rotate={12} />
      <Bunker cx={230} cy={122} rx={20} ry={11} rotate={-12} />
      <Bunker cx={197} cy={102} rx={15} ry={9} />
      <Bunker cx={164} cy={97} rx={12} ry={7} />
      <Bunker cx={230} cy={97} rx={12} ry={7} />
      <Green cx={198} cy={82} rx={28} ry={18} />
      <TeeBox cx={198} cy={454} w={24} h={14} />
      <YardageMarker x={198} y={300} yards={90} />
    </g>
  ),

  // Hole 17 — Par 4, 400 yds — Dogleg right, water short right
  17: () => (
    <g>
      <Rough />
      <Fairway d="M120 457 C118 392,120 324,128 270 C138 210,158 172,186 152 C208 136,232 130,254 137 L260 160 C240 152,218 158,198 172 C174 190,156 226,148 274 C140 328,138 392,136 460Z" />
      <Water points="260,282 320,270,322,382,262,388" />
      <Bunker cx={257} cy={150} rx={18} ry={10} rotate={18} />
      <Bunker cx={134} cy={232} rx={16} ry={10} />
      <Bunker cx={270} cy={122} rx={18} ry={11} />
      <Bunker cx={294} cy={110} rx={14} ry={8} />
      <Green cx={280} cy={90} rx={26} ry={16} />
      <TeeBox cx={128} cy={462} />
      <YardageMarker x={134} y={320} yards={150} />
    </g>
  ),

  // Hole 18 — Par 4, 356 yds — Short dramatic finisher
  18: () => (
    <g>
      <Rough />
      <Fairway d="M142 460 C140 400,142 337,150 287 C160 230,176 194,198 172 C214 156,234 148,254 150 L262 172 C244 168,228 176,214 190 C194 208,180 242,172 288 C164 340,162 398,160 462Z" />
      <Water points="22,342 97,330,100,422,24,430" />
      <Bunker cx={260} cy={162} rx={18} ry={10} rotate={15} />
      <Bunker cx={146} cy={242} rx={15} ry={9} />
      <Bunker cx={242} cy={132} rx={20} ry={12} />
      <Bunker cx={267} cy={120} rx={14} ry={8} />
      {/* Grandstand behind 18th green */}
      <rect x={218} y={54} width={78} height={20} rx={4} fill="#3a3a4a" fillOpacity="0.65" />
      <rect x={223} y={49} width={68} height={7} rx={2} fill="#4a4a5a" fillOpacity="0.55" />
      <Green cx={254} cy={76} rx={28} ry={18} />
      <TeeBox cx={150} cy={462} />
      <YardageMarker x={154} y={320} yards={100} />
    </g>
  ),
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function HoleMap({ holeNum, par, yards, className = '' }) {
  const HoleContent = HOLES[holeNum]

  const parColor = par === 3 ? '#a78bfa' : par === 4 ? '#34d399' : '#fbbf24'
  const parLabel = par === 3 ? 'Par 3' : par === 4 ? 'Par 4' : 'Par 5'

  return (
    <div className={`hole-map-wrapper ${className}`}>
      <svg
        viewBox="0 0 340 480"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12, overflow: 'hidden' }}
      >
        <defs>
          <pattern id="hmMow" x="0" y="0" width="28" height="480" patternUnits="userSpaceOnUse">
            <rect x="0"  y="0" width="14" height="480" fill="#ffffff" fillOpacity="0.04" />
            <rect x="14" y="0" width="14" height="480" fill="#000000" fillOpacity="0.03" />
          </pattern>
        </defs>

        {HoleContent ? <HoleContent /> : (
          <g>
            <rect width="340" height="480" fill="#0d2e18" />
            <text x="170" y="245" textAnchor="middle" fill="#4a9a6a" fontSize="14" fontFamily="sans-serif">Hole {holeNum}</text>
          </g>
        )}

        {/* North compass */}
        <g transform="translate(314,454)">
          <circle cx="0" cy="0" r="13" fill="#000" fillOpacity="0.55" />
          <path d="M0 -9 L3.5 2 L0 0 L-3.5 2Z" fill="#fff" fillOpacity="0.9" />
          <text x="0" y="9" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="sans-serif" fillOpacity="0.7">N</text>
        </g>

        {/* Header bar */}
        <rect x="0" y="0" width="340" height="34" fill="#000" fillOpacity="0.6" />
        <text x="10" y="22" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
          {`Hole ${holeNum}`}
        </text>
        <text x="172" y="22" textAnchor="middle" fill={parColor} fontSize="11" fontFamily="sans-serif">
          {parLabel}
        </text>
        <text x="330" y="22" textAnchor="end" fill="#9ca3af" fontSize="11" fontFamily="sans-serif">
          {`${yards} yds`}
        </text>

        {/* Legend */}
        <rect x="0" y="446" width="340" height="34" fill="#000" fillOpacity="0.55" />
        <circle cx="12" cy="463" r="5" fill="#267a43" />
        <text x="20" y="467" fill="#9ca3af" fontSize="9" fontFamily="sans-serif">Fairway</text>
        <ellipse cx="68" cy="463" rx="7" ry="5" fill="#e8d49a" />
        <text x="78" y="467" fill="#9ca3af" fontSize="9" fontFamily="sans-serif">Bunker</text>
        <rect x="118" y="458" width="10" height="10" fill="#0f2d4a" />
        <text x="131" y="467" fill="#9ca3af" fontSize="9" fontFamily="sans-serif">Water</text>
        <circle cx="172" cy="463" r="5" fill="#3dba6a" />
        <text x="180" y="467" fill="#9ca3af" fontSize="9" fontFamily="sans-serif">Green</text>
        <rect x="218" y="458" width="10" height="10" rx="2" fill="#2d9c52" />
        <text x="231" y="467" fill="#9ca3af" fontSize="9" fontFamily="sans-serif">Tee</text>
      </svg>
    </div>
  )
}