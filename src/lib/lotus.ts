// A wind-swept lotus field at Angkor dawn, painted with SVG blur and texture
// filters: a pale sky, a moat-teal field, pink blooms dragged by the wind and
// two blooms in focus. Returns the SVG children for a W by H canvas.
export function lotusField(W = 1200, H = 630) {
  let seed = 11; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const ANGLE = -18; // wind: strokes lean this way
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const greens = ["#7FA08C", "#6E9480", "#8FB39B", "#5E8371", "#A7C2AC", "#4F7566"];
  const pinks = ["#D9789A", "#E08AA6", "#C9637F", "#EFA5BB", "#D46F8C"];
  // One lotus bloom: broad petals fanned around the base, a pale back layer
  // and a deeper front layer, with a dark heart and a touch of saffron.
  function lotus(cx, cy, s, col) {
    let g = "";
    const petal = (ang, len, wid, fill, op) => {
      const r = (ang * Math.PI) / 180, px = cx + Math.sin(r) * len * 0.5, py = cy + s * 0.2 - Math.cos(r) * len * 0.5;
      return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${wid.toFixed(1)}" ry="${(len * 0.55).toFixed(1)}" transform="rotate(${ang} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${fill}" fill-opacity="${op}"/>`;
    };
    for (const a of [-62, -38, 38, 62]) g += petal(a, s * 0.95, s * 0.2, "#EFA5BB", 0.75);
    g += `<ellipse cx="${cx}" cy="${cy - s * 0.1}" rx="${s * 0.2}" ry="${s * 0.32}" fill="#8E3A57" fill-opacity="0.3"/>`;
    for (const a of [-20, 0, 20]) g += petal(a, s * 1.05, s * 0.22, a === 0 ? col : pick(pinks), 0.9);
    g += `<ellipse cx="${cx}" cy="${cy + s * 0.18}" rx="${s * 0.14}" ry="${s * 0.05}" fill="#E39B2D" fill-opacity="0.8"/>`;
    return g;
  }
  let field = "", stems = "", far = "", near = "", focus = "";
  // Grass and leaf strokes, dragged by the wind.
  for (let i = 0; i < 420; i++) {
    const x = rnd() * (W + 300) - 150, y = 300 + rnd() * 360, len = 40 + rnd() * 140;
    field += `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y - len * 0.08}" stroke="${pick(greens)}" stroke-width="${2 + rnd() * 9}" stroke-opacity="${0.25 + rnd() * 0.45}" stroke-linecap="round"/>`;
  }
  // Lily pads as soft green ellipses.
  for (let i = 0; i < 26; i++) field += `<ellipse cx="${rnd() * W}" cy="${420 + rnd() * 200}" rx="${30 + rnd() * 60}" ry="${8 + rnd() * 14}" fill="${pick(greens)}" fill-opacity="${0.35 + rnd() * 0.3}"/>`;
  // Far blooms: blurred pink dabs drifting across the field and up into the sky.
  for (let i = 0; i < 26; i++) { const x = rnd() * W, y = 300 + rnd() * 260; far += `<ellipse cx="${x}" cy="${y}" rx="${18 + rnd() * 40}" ry="${12 + rnd() * 22}" fill="${pick(pinks)}" fill-opacity="${0.35 + rnd() * 0.4}"/>`; }
  let skyStreak = `<ellipse cx="1000" cy="170" rx="230" ry="55" transform="rotate(-14 1000 170)" fill="#E08AA6" fill-opacity="0.4"/>`;
  far += `<ellipse cx="90" cy="380" rx="160" ry="70" fill="#D9789A" fill-opacity="0.5"/>`;
  // Near blooms, some on stems.
  for (const [x, y, s] of [[300, 470, 46], [560, 520, 38], [180, 560, 30], [980, 470, 34]]) { stems += `<path d="M${x} ${y + s * 0.3} C${x + 6} ${y + 80} ${x + 14} ${y + 140} ${x + 22} ${H}" stroke="#4F7566" stroke-width="2.5" fill="none" stroke-opacity="0.7"/>`; near += lotus(x, y, s, pick(pinks)); }
  // Two blooms in focus, like the sharp poppies in the reference.
  for (const [x, y, s] of [[810, 440, 74], [935, 505, 46]]) { stems += `<path d="M${x} ${y + s * 0.3} C${x + 4} ${y + 70} ${x + 10} ${y + 120} ${x + 16} ${H}" stroke="#3F6658" stroke-width="2.4" fill="none"/>`; focus += lotus(x, y, s, "#D46F8C"); }
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F1E7"/><stop offset="0.42" stop-color="#E7EFE6"/><stop offset="0.62" stop-color="#C9DCCD"/><stop offset="1" stop-color="#7FA08C"/></linearGradient>
    <filter id="windFar" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34 10"/></filter>
    <filter id="windMid" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14 3"/></filter>
    <filter id="windNear" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="3" seed="8" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="7 2"/></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.18" numOctaves="3" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="2.2 1.2"/></filter>
    <filter id="streak" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.2" numOctaves="3" seed="12" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="12 2.5"/></filter>
    <filter id="canvas"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0 0.44  0 0 0 0.06 0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g transform="rotate(${ANGLE} 600 315)">
    <g filter="url(#windFar)">${skyStreak}</g>
    <g filter="url(#streak)">${far}</g>
    <g filter="url(#streak)">${field}</g>
    <g filter="url(#windNear)">${stems}${near}</g>
  </g>
  <g filter="url(#soft)" transform="rotate(${ANGLE / 3} 860 480)">${focus}</g>
  <rect width="${W}" height="${H}" filter="url(#canvas)"/>`;

}
