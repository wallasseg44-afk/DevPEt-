export function petSvg(stage = 0, accessory = 0, mini = false) {
  const egg = `<path d="M141 221c-43-2-61-25-56-60 5-36 33-78 56-78s51 42 56 78c5 35-13 58-56 60Z" fill="#faf5da" stroke="#57654b" stroke-width="2.5"/>
    <path d="M89 168c0 29 22 46 52 46 26 0 44-11 53-33-3 27-21 40-53 40-35 0-55-16-56-43Z" fill="#e6dfb8"/>
    <path d="m104 107 15 10-7 14 20-7 11 15 10-18 19 4-9-16" fill="none" stroke="#dad3ad" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="110" cy="148" rx="7" ry="5" fill="#d5dfad" transform="rotate(-24 110 148)"/><ellipse cx="161" cy="193" rx="9" ry="6" fill="#d5dfad" transform="rotate(18 161 193)"/>
    <path d="M124 165v8m33-8v8" stroke="#364d38" stroke-width="5" stroke-linecap="round"/><path d="M134 178q7 7 14 0" fill="none" stroke="#364d38" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="113" cy="177" rx="7" ry="4" fill="#e8b9a0" opacity=".7"/><ellipse cx="168" cy="177" rx="7" ry="4" fill="#e8b9a0" opacity=".7"/>
    <path d="M141 84V68" stroke="#638451" stroke-width="3"/><path d="M141 73c-16 0-21-8-18-15 13-2 20 5 18 15Z" fill="#91b77b" stroke="#638451" stroke-width="1.7"/><path d="M141 78c0-15 10-21 21-16-1 12-10 17-21 16Z" fill="#b1cc91" stroke="#638451" stroke-width="1.7"/>`;
  const creature = `<path d="M184 186c19-9 21-21 18-29 17 7 25 24 9 39l-27 8" fill="#95b878" stroke="#4e7046" stroke-width="2.5"/>
    ${stage >= 2 ? '<path d="m112 119-15-20 20-1 5-20 18 18 18-18 4 21 21 2-16 19" fill="#93b272" stroke="#4e7046" stroke-width="2.5"/>' : ''}
    <path d="M98 204c-14 2-22 11-16 16 7 6 27 2 33-5m53-11c14 2 22 11 16 16-7 6-27 2-33-5" fill="#9cbe82" stroke="#4e7046" stroke-width="2.5"/>
    <path d="M91 159c-13-27-12-57 0-61 11-3 27 12 29 25h29c8-17 23-29 33-23 11 7 8 34 1 52 12 14 13 36 4 49-17 25-76 23-92 4-11-13-15-33-4-46Z" fill="${stage >= 3 ? '#89b276' : '#acd292'}" stroke="#4e7046" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M94 128c-6-10-8-20-3-21 6-1 14 9 17 17m55 0c5-10 11-17 15-16 5 3 3 14 0 22" fill="#d5e5b4"/>
    <ellipse cx="140" cy="189" rx="29" ry="25" fill="#dae7b7"/>
    <path d="M114 156v9m51-9v9" stroke="#344b38" stroke-width="5" stroke-linecap="round"/><path d="m132 174 7 5 7-5" fill="none" stroke="#344b38" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="106" cy="174" rx="9" ry="5" fill="#dcae92" opacity=".65"/><ellipse cx="174" cy="174" rx="9" ry="5" fill="#dcae92" opacity=".65"/>
    <path d="M88 182q-13 10-3 15m104-14q14 9 3 15" fill="#acd292" stroke="#4e7046" stroke-width="2.5" stroke-linecap="round"/>
    ${stage >= 2 ? '<path d="m108 187 31 12 32-12-6 13-26 9-26-8Z" fill="#d4a36f" stroke="#a37c52" stroke-width="1.5"/><path d="m149 203 9 18 10-6-9-17" fill="#d4a36f" stroke="#a37c52" stroke-width="1.5"/>' : ''}
    ${stage >= 3 ? '<path d="M104 99q36-27 71 1l-7 13-58-1Z" fill="#5b7561" stroke="#344b38" stroke-width="2"/><path d="m108 101 62 1" stroke="#a1b991" stroke-width="3"/><path d="M145 91q-1-20 15-24c-1 13-6 22-15 24" fill="#c4d69b" stroke="#4e7046" stroke-width="1.5"/>' : ''}
    ${accessory >= 1 ? '<path d="m139 195 3 5 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#f9d779" stroke="#b2964a"/>' : ''}
    ${accessory >= 2 ? '<circle cx="114" cy="161" r="13" fill="none" stroke="#465e49" stroke-width="2"/><circle cx="165" cy="161" r="13" fill="none" stroke="#465e49" stroke-width="2"/><path d="M127 160h25" stroke="#465e49" stroke-width="2"/>' : ''}
    ${accessory >= 3 ? `<circle cx="189" cy="107" r="9" fill="${['#f4d182', '#b7d6e4', '#d0b9e6', '#e8b8a9', '#b8d896'][(accessory - 3) % 5]}"/><path d="m189 93 2 7m12 7-6 1m-8 12-1-6" stroke="#afac80" stroke-width="2"/>` : ''}`;
  return `<svg class="pet-art ${mini ? 'mini-pet' : ''}" viewBox="0 0 280 265" fill="none" role="img" aria-label="DevPet no estágio ${['ovo com um brotinho e um sorriso', 'filhote verde de orelhas grandes', 'jovem com um cachecol', 'adulto com chapéu de explorador'][stage]}${accessory ? ', com acessórios conquistados' : ''}">
    ${mini ? '' : '<ellipse cx="141" cy="226" rx="85" ry="16" fill="#aec399" opacity=".17"/><ellipse cx="141" cy="222" rx="65" ry="8" fill="#80956c" opacity=".13"/>'}
    <g class="pet-body" style="transform-origin:140px 220px">${stage === 0 ? egg : creature}</g>
    ${accessory >= 4 ? `<g fill="#d0ac59"><path d="m53 130 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m222 160 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>` : ''}
  </svg>`;
}
export const scenery = `<svg class="scenery" viewBox="0 0 780 350" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true">
  <circle cx="390" cy="190" r="122" fill="#edf2df"/><circle cx="390" cy="190" r="94" fill="#e6edd7"/>
  <path d="M0 310q195-32 390-8t390-1v49H0Z" fill="#e4e9d8"/><path d="M0 330q210-23 390-6t390-5v31H0Z" fill="#dce4cf" opacity=".8"/>
  <path d="M108 310v-42m0 17c-19 0-27-10-26-23 15-2 28 8 26 23Zm0 10c19 0 27-10 26-23-15-2-28 8-26 23Z" stroke="#8da37a" stroke-width="2" fill="#bdcea6"/>
  <path d="M646 315v-59m0 19c-24 0-34-13-31-29 19-1 33 12 31 29Zm0 13c23 0 33-13 31-28-20-2-33 11-31 28Z" stroke="#8da37a" stroke-width="2" fill="#b7c99e"/>
  <path d="m191 132-10 8 10 8m28-16 10 8-10 8m-9-22-6 27" stroke="#9fab8d" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
  <path d="m574 145 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#b8c897"/><path d="m262 210 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" fill="#b8c897"/>
  <circle cx="515" cy="86" r="3" fill="#c5d0b1"/><circle cx="230" cy="252" r="3" fill="#b7c99e"/>
  <path d="m542 290 8-10m-8 10-5-9m13 32 4-7m-343 2-5-8m5 8 5-4" stroke="#a8b892" stroke-width="2" stroke-linecap="round"/>
</svg>`;
