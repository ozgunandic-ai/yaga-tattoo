// Örnek dövme çizimleri (orijinal, yer tutucu). Gerçek çalışma fotoğraflarıyla değiştirilecek.
// INK = çizgi rengi, BG = arka plan rengi (iç boşluklar için)
export const TATTOOS = [
  {
    name: "Karga", style: "Blackwork",
    svg: `<path d="M100 58 C88 58 80 68 82 80 L70 84 L84 89 C86 99 92 105 100 109 C80 111 50 99 20 68 C38 108 68 127 95 130 L90 166 L100 151 L110 166 L105 130 C132 127 162 108 180 68 C150 99 120 111 100 109 C112 103 118 91 116 79 C114 67 108 58 100 58 Z"/>
          <path d="M40 86 L58 104 M52 82 L72 106 M160 86 L142 104 M148 82 L128 106"/>
          <circle cx="95" cy="74" r="2.6" fill="INK"/>`
  },
  {
    name: "Hilal", style: "Fine line",
    svg: `<path d="M122 36 A64 64 0 1 0 122 164 A52 52 0 1 1 122 36 Z"/>
          <path d="M150 60 L153 70 L163 73 L153 76 L150 86 L147 76 L137 73 L147 70 Z"/>
          <path d="M160 116 L162 122 L168 124 L162 126 L160 132 L158 126 L152 124 L158 122 Z"/>
          <circle cx="100" cy="100" r="88" stroke-dasharray="2 7"/>`
  },
  {
    name: "Hançer", style: "Traditional",
    svg: `<path d="M100 18 L111 120 L100 134 L89 120 Z"/><path d="M100 26 L100 126"/>
          <path d="M66 121 Q100 111 134 121 Q100 131 66 121 Z"/>
          <rect x="93" y="129" width="14" height="38" rx="3"/>
          <path d="M93 138 L107 134 M93 147 L107 143 M93 156 L107 152"/>
          <circle cx="100" cy="174" r="7"/>`
  },
  {
    name: "Kafatası", style: "Blackwork",
    svg: `<path d="M100 30 C60 30 45 60 48 90 C50 108 60 115 62 125 L62 140 L138 140 L138 125 C140 115 150 108 152 90 C155 60 140 30 100 30 Z"/>
          <ellipse cx="80" cy="92" rx="14" ry="16" fill="INK"/><ellipse cx="120" cy="92" rx="14" ry="16" fill="INK"/>
          <path d="M100 106 L93 121 L107 121 Z"/>
          <path d="M70 140 L70 157 C82 168 118 168 130 157 L130 140"/>
          <path d="M82 140 L82 162 M92 140 L92 165 M100 140 L100 166 M108 140 L108 165 M118 140 L118 162"/>`
  },
  {
    name: "Yılan", style: "Neo-traditional",
    svg: `<path d="M42 172 C18 132 80 122 100 100 C120 78 182 70 152 40 C138 26 116 34 120 50" stroke-width="15"/>
          <path d="M42 172 C18 132 80 122 100 100 C120 78 182 70 152 40 C138 26 116 34 120 50" stroke="BG" stroke-width="10"/>
          <path d="M60 140 L66 146 M80 124 L86 130 M100 108 L106 114 M124 86 L128 94 M146 72 L152 78"/>
          <ellipse cx="121" cy="56" rx="9" ry="7" fill="INK"/>
          <path d="M122 63 L120 74 L116 80 M120 74 L124 80"/>`
  },
  {
    name: "Göz", style: "Dotwork",
    svg: `<path d="M100 28 L176 164 L24 164 Z"/>
          <path d="M55 120 Q100 84 145 120 Q100 156 55 120 Z"/>
          <circle cx="100" cy="120" r="16"/><circle cx="100" cy="120" r="6" fill="INK"/>
          <path d="M100 8 L100 18 M150 30 L144 40 M50 30 L56 40 M186 96 L176 100 M14 96 L24 100"/>`
  },
  {
    name: "Güve", style: "Fine line",
    svg: `<ellipse cx="100" cy="104" rx="7" ry="34"/><circle cx="100" cy="64" r="7"/>
          <path d="M97 58 C90 40 78 34 70 36 M103 58 C110 40 122 34 130 36"/>
          <g id="w"><path d="M94 84 C60 40 14 50 24 92 C30 112 70 112 94 100 Z"/>
          <path d="M94 108 C70 116 44 150 68 162 C84 168 94 142 96 122 Z"/>
          <circle cx="54" cy="84" r="9"/><circle cx="54" cy="84" r="3" fill="INK"/></g>
          <g transform="translate(200 0) scale(-1 1)"><path d="M94 84 C60 40 14 50 24 92 C30 112 70 112 94 100 Z"/>
          <path d="M94 108 C70 116 44 150 68 162 C84 168 94 142 96 122 Z"/>
          <circle cx="54" cy="84" r="9"/><circle cx="54" cy="84" r="3" fill="INK"/></g>`
  },
  {
    name: "Gül", style: "Traditional",
    svg: `<path d="M60 92 C55 58 90 48 100 60 C110 48 145 58 140 92 C138 122 115 134 100 134 C85 134 62 122 60 92 Z"/>
          <path d="M100 60 C84 74 88 100 104 100 C116 100 118 84 106 80 C98 78 94 88 100 90"/>
          <path d="M60 92 C76 98 86 110 100 134 M140 92 C124 98 114 110 100 134"/>
          <path d="M100 134 C98 154 105 170 100 190"/>
          <path d="M101 160 C120 150 135 154 142 160 C130 168 114 168 101 160 Z"/>
          <path d="M100 172 C82 162 68 166 60 172 C72 180 88 180 100 172 Z"/>`
  },
];

export function svgMarkup(t, ink, bg, sw = 2.4) {
  const inner = t.svg.replaceAll("INK", ink).replaceAll("BG", bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export function svgDataUrl(t, ink, bg, sw) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgMarkup(t, ink, bg, sw));
}
