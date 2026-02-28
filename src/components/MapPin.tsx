/**
 * MapPin.tsx
 * Creates a Leaflet DivIcon for themed map pins.
 * Called from WorldMap — NOT a React component itself, just a factory function.
 *
 * Erik:   dark navy circle, gold border + gold dot center
 * Marisa: blush white circle, rose border + rose dot center
 */

import L from 'leaflet'

export interface PinOptions {
  /** Accent hex (border + center dot color) */
  accentHex: string
  /** Background hex of the circle */
  bgHex: string
  /** Whether this trip was attended (full opacity) or is future/placeholder (60%) */
  visited: boolean
  /** Whether this pin is currently hovered */
  hovered?: boolean
}

/**
 * Creates a themed Leaflet DivIcon pin.
 * Size: 28x28 circle with drop shadow.
 * Hovered: 36x36 (scale up effect via larger size + adjusted anchor).
 */
export function createPinIcon(options: PinOptions): L.DivIcon {
  const { accentHex, bgHex, visited, hovered = false } = options
  const size = hovered ? 36 : 28
  const half = size / 2
  const dotRadius = hovered ? 5 : 4
  const opacity = visited ? 1 : 0.55

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${bgHex};
      border: 2.5px solid ${accentHex};
      box-shadow: 0 2px 8px rgba(0,0,0,0.45), 0 0 0 ${hovered ? '3px' : '0px'} ${accentHex}55;
      opacity: ${opacity};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      cursor: pointer;
      position: relative;
    ">
      <div style="
        width: ${dotRadius * 2}px;
        height: ${dotRadius * 2}px;
        border-radius: 50%;
        background-color: ${accentHex};
        box-shadow: 0 0 ${hovered ? '6px' : '3px'} ${accentHex}88;
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: '', // suppress default leaflet-div-icon styles
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 4)],
  })
}

/**
 * Creates a "pulse" icon for the currently selected trip pin.
 */
export function createSelectedPinIcon(options: Omit<PinOptions, 'hovered'>): L.DivIcon {
  const { accentHex, bgHex, visited } = options
  const size = 36
  const opacity = visited ? 1 : 0.75

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px;">
      <!-- Pulse ring -->
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid ${accentHex};
        opacity: 0.5;
        animation: pin-pulse 1.4s ease-out infinite;
        pointer-events: none;
      "></div>
      <!-- Main circle -->
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${bgHex};
        border: 2.5px solid ${accentHex};
        box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 0 4px ${accentHex}33;
        opacity: ${opacity};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: ${accentHex};
          box-shadow: 0 0 8px ${accentHex};
        "></div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  })
}
