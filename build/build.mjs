// Generates every image in ../assets from one place: the brand tokens,
// the copy, and the motion. GitHub strips scripts, CSS and external fonts
// from a profile README, so each SVG carries its own subsetted fonts and its
// own CSS animation.
//
// Every piece exists four times: desktop and mobile, light and dark. GitHub
// cannot resize an image with CSS, so "responsive" here means README.md picks
// a different drawing through <picture><source media>, the mobile one being
// 600 wide, stacked, and set in larger type.
//
// Project covers are the exception: pictures only, one per theme, because
// the words that describe each project live in README.md as real text.
//
// Run: node build/build.mjs && node build/readme.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'assets');
mkdirSync(out, { recursive: true });

/* ---------- tokens (lifted from the portfolio's style.css) ---------- */
const THEMES = {
    light: {
        ground: '#FAF8F4', ground2: '#F2EEE7', surface: '#FFFFFF',
        ink: '#17150F', ink2: '#3D382E', muted: '#6B6459', faint: '#9A9285',
        accent: '#C1502E', wash: '#F7EAE3', onAccent: '#FAF8F4',
        line: 'rgba(23,21,15,.10)', line2: 'rgba(23,21,15,.16)', shadow: '23,21,15', grain: .07
    },
    dark: {
        ground: '#16140F', ground2: '#1E1B15', surface: '#24201A',
        ink: '#F3EEE5', ink2: '#D8D1C4', muted: '#A69E90', faint: '#7C7468',
        accent: '#E2794F', wash: '#2B1C14', onAccent: '#16140F',
        line: 'rgba(243,238,229,.10)', line2: 'rgba(243,238,229,.16)', shadow: '0,0,0', grain: .09
    }
};

const EASE = 'cubic-bezier(.23,1,.32,1)';      // Emil's ease-out
const EASE_IO = 'cubic-bezier(.77,0,.175,1)';

/* ---------- fonts, embedded ---------- */
const b64 = p => readFileSync(join(here, p)).toString('base64');
const FONT_FILES = {
    serif: ['Fraunces', 'normal', '300 600', 'fonts/fraunces-normal-var-latin.woff2'],
    serifItalic: ['Fraunces', 'italic', '300 600', 'fonts/fraunces-italic-var-latin.woff2'],
    sans: ['Inter', 'normal', '400 600', 'fonts/inter-normal-var-latin.woff2'],
    mono: ['JetBrains Mono', 'normal', '400 800', 'fonts/jetbrains-mono-normal-var-latin.woff2']
};
const fontCache = {};
const fontFace = key => {
    const [family, style, weight, file] = FONT_FILES[key];
    fontCache[key] ??= b64(file);
    return `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};src:url(data:font/woff2;base64,${fontCache[key]}) format('woff2')}`;
};
const imgCache = {};
const img = file => (imgCache[file] ??= `data:image/jpeg;base64,${b64('img/' + file)}`);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Greedy word wrap. Widths are estimated from each face's average advance
   (Inter ~0.505em, JetBrains Mono 0.6em), checked against rendered output. */
const wrap = (text, px, size, em = .505) => {
    const max = Math.floor(px / (size * em));
    const out = [];
    let line = '';
    for (const w of text.split(' ')) {
        if (line && (line + ' ' + w).length > max) { out.push(line); line = w; }
        else line = line ? line + ' ' + w : w;
    }
    if (line) out.push(line);
    return out;
};

/* ---------- shared CSS ---------- */
const baseCss = t => `
.serif{font-family:'Fraunces',Georgia,serif;font-weight:400}
.it{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:360}
.sans{font-family:'Inter',system-ui,sans-serif}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.ink{fill:${t.ink}}.ink2{fill:${t.ink2}}.muted{fill:${t.muted}}.faint{fill:${t.faint}}.acc{fill:${t.accent}}
@keyframes fadein{from{opacity:0}}
@keyframes draw{from{stroke-dashoffset:1}}
/* Words never animate in. An image that starts invisible is blank to anyone
   who scrolls past before it plays, and GitHub gives no way to wait for the
   viewer. Only the ornament moves: petals drawn in, the orbit turning. */
.fadein{animation:fadein 1.2s ${EASE} both}
.draw{stroke-dasharray:1;animation:draw 1.8s ${EASE_IO} both}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

const d = s => `animation-delay:${s.toFixed(2)}s`;

function svg({ w, h, t, fonts, css = '', body, title }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>
<style>${fonts.map(fontFace).join('')}${baseCss(t)}${css}</style>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 ${t.grain}"/></feComponentTransfer></filter>
<pattern id="kawung" width="64" height="64" patternUnits="userSpaceOnUse"><g fill="none" stroke="${t.ink}" stroke-width="1"><ellipse cx="20" cy="20" rx="8" ry="15" transform="rotate(45 20 20)"/><ellipse cx="44" cy="20" rx="8" ry="15" transform="rotate(-45 44 20)"/><ellipse cx="20" cy="44" rx="8" ry="15" transform="rotate(-45 20 44)"/><ellipse cx="44" cy="44" rx="8" ry="15" transform="rotate(45 44 44)"/><circle cx="32" cy="32" r="2.5"/></g></pattern>
<filter id="lift" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="rgb(${t.shadow})" flood-opacity=".16"/><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgb(${t.shadow})" flood-opacity=".06"/></filter>
</defs>
${body}
</svg>`;
}

/* A rounded panel with paper grain; everything inside is clipped to it. */
const panel = (id, w, h, t, inner, fill = t.ground) => `
<clipPath id="${id}"><rect width="${w}" height="${h}" rx="18"/></clipPath>
<g clip-path="url(#${id})">
<rect width="${w}" height="${h}" fill="${fill}"/>
${inner}
<rect width="${w}" height="${h}" filter="url(#grain)"/>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="17.5" fill="none" stroke="${t.line2}"/>`;

/* Kawung ornament fading out from a point. */
const kawungField = (id, w, h, cx, cy, r, opacity, y0 = 0) => `
<radialGradient id="${id}g" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}m"><rect y="${y0}" width="${w}" height="${h}" fill="url(#${id}g)"/></mask>
<rect y="${y0}" width="${w}" height="${h}" fill="url(#kawung)" opacity="${opacity}" mask="url(#${id}m)"/>`;

const lines = (arr, x, y, step, cls, delay0, delayStep = .06, extra = '') =>
    arr.map((s, i) => `<text x="${x}" y="${y + i * step}" class="${cls} fade" style="${d(delay0 + i * delayStep)}"${extra}>${esc(s)}</text>`).join('\n');

/* A line of display type, clipped to its own band. */
const riser = (id, clip, text, attrs, delay) =>
    `<clipPath id="${id}"><rect x="0" y="${clip[0]}" width="2000" height="${clip[1]}"/></clipPath>
<g clip-path="url(#${id})"><text ${attrs} style="${d(delay)}">${text}</text></g>`;

/* ---------- HERO ---------- */
function medallion(t, cx, cy, s) {
    // one kawung medallion: four petals around a seed, drawn like wax from a canting
    const o = 70 * s;
    const petal = (dx, dy, rot, i) => {
        const x = cx + dx, y = cy + dy;
        return `<g transform="rotate(${rot} ${x} ${y})">
<ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${92 * s}" fill="${t.accent}" class="fadein" style="${d(1.5 + i * .08)};opacity:.10"/>
<ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${92 * s}" pathLength="1" fill="none" stroke="${t.accent}" stroke-width="1.6" class="draw" style="${d(.35 + i * .16)}"/>
<ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${58 * s}" pathLength="1" fill="none" stroke="${t.accent}" stroke-width="1" opacity=".55" class="draw" style="${d(.75 + i * .16)}"/>
<line x1="${x}" y1="${y - 40 * s}" x2="${x}" y2="${y + 40 * s}" pathLength="1" stroke="${t.accent}" stroke-width="1" opacity=".55" class="draw" style="${d(1.05 + i * .16)}"/>
</g>`;
    };
    const dots = Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return `<circle cx="${(cx + Math.cos(a) * 226 * s).toFixed(1)}" cy="${(cy + Math.sin(a) * 226 * s).toFixed(1)}" r="1.8"/>`;
    }).join('');
    return {
        css: `.orbit{transform-origin:${cx}px ${cy}px;animation:spin 120s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}`,
        body: `<circle cx="${cx}" cy="${cy}" r="${200 * s}" fill="none" stroke="${t.line2}" class="fadein" style="${d(.2)}"/>
<g class="orbit" fill="${t.accent}" opacity=".5">${dots}</g>
${petal(-o, -o, 45, 0)}${petal(o, -o, -45, 1)}${petal(o, o, 45, 2)}${petal(-o, o, -45, 3)}
<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="${t.accent}" stroke-width="1.6" pathLength="1" class="draw" style="${d(1.2)}"/>
<circle cx="${cx}" cy="${cy}" r="3" fill="${t.accent}" class="fadein" style="${d(1.6)}"/>`
    };
}

function hero(t, m) {
    const L = m
        ? { W: 600, H: 780, cx: 300, cy: 222, s: .74, x: 40, eyebrow: [468, 19, 2.6], size: 98, l1: [560, 478, 104], l2: [654, 582, 104], status: 728 }
        : { W: 1200, H: 470, cx: 920, cy: 235, s: .92, x: 72, eyebrow: [112, 15, 2.6], size: 116, l1: [232, 120, 128], l2: [344, 248, 128], status: 414 };
    const med = medallion(t, L.cx, L.cy, L.s);
    const css = `${med.css}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ${EASE} 1.8s infinite}
@keyframes ping{0%{transform:scale(1);opacity:.55}100%{transform:scale(3.2);opacity:0}}
.name{font-size:${L.size}px;letter-spacing:${-L.size * .03}px}`;
    const inner = `
${kawungField('hk', L.W, L.H, L.cx, L.cy, m ? 420 : 520, .09)}
${med.body}
<text x="${L.x}" y="${L.eyebrow[0]}" class="mono acc fade" font-size="${L.eyebrow[1]}" letter-spacing="${L.eyebrow[2]}" font-weight="500" style="${d(.05)}">FULL-STACK DEVELOPER  /  JAKARTA</text>
${riser('l1', L.l1.slice(1), 'Nabila', `x="${L.x - 6}" y="${L.l1[0]}" class="serif ink name rise"`, .15)}
${riser('l2', L.l2.slice(1), 'Melsyana', `x="${L.x - 2}" y="${L.l2[0]}" class="it acc name rise"`, .27)}
<g class="fade" style="${d(.5)}">
<circle cx="${L.x + 8}" cy="${L.status - 5}" r="5" fill="${t.accent}" class="ping"/>
<circle cx="${L.x + 8}" cy="${L.status - 5}" r="5" fill="${t.accent}"/>
<text x="${L.x + 26}" y="${L.status}" class="mono muted" font-size="${m ? 17 : 15}" letter-spacing=".4">Open to full-stack roles, remote or in Jakarta</text>
</g>`;
    return svg({
        w: L.W, h: L.H, t, fonts: ['serif', 'serifItalic', 'mono'], css,
        title: 'Nabila Melsyana, full-stack developer in Jakarta, open to full-stack roles.',
        body: panel('hp', L.W, L.H, t, inner)
    });
}

/* ---------- SECTION TITLE ---------- */
function title(t, m, text, italicTail) {
    const W = m ? 600 : 1200, H = 112, size = m ? 54 : 50;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic'],
        title: `${text} ${italicTail}`,
        body: `
${riser('tc', [0, 84], `${esc(text)} <tspan class="it acc">${esc(italicTail)}</tspan>`, `x="2" y="66" class="serif ink rise" font-size="${size}" letter-spacing="-1.2"`, 0)}
<line x1="2" y1="96" x2="${W}" y2="96" stroke="${t.line2}" class="grow" style="${d(.2)}"/>
<line x1="2" y1="96" x2="66" y2="96" stroke="${t.accent}" stroke-width="2.5" class="grow" style="${d(.35)}"/>`
    });
}

/* ---------- PROJECT COVERS ----------
   Pictures only. The project name, the problem and the stack are real text in
   README.md, so search engines and screen readers get them and GitHub can
   render them without waiting on an image. Covers hold still: a screenshot
   that fades in can be caught half-drawn by anyone who scrolls quickly. */
const COVERS = {
    nova: { name: 'Nova AI', image: 'nova-1.jpg' },
    flowbuddy: { name: 'Flowbuddy', phones: ['flowbuddy-1.jpg', 'flowbuddy-2.jpg', 'flowbuddy-3.jpg'] },
    vero: { name: 'AI Vero', image: 'vero-1.jpg' },
    lms: { name: 'Virtual Intern LMS', image: 'lms-1.jpg' },
    maxy: { name: 'Maxy Learning', image: 'maxy-1.jpg' },
    otopia: { name: 'Otopia Auto Care', image: 'otopia-1.jpg' },
    weborder: { name: 'WebOrder Studio', image: 'weborder-1.jpg' }
};

/* A screenshot in a lifted frame, bleeding off the edge of its media area. */
const shot = (id, t, file, x, y, w, h, delay, rx = 12) => `<g class="fade" style="${d(delay)}"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${t.surface}" filter="url(#lift)"/>
<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMin slice" href="${img(file)}" xlink:href="${img(file)}" clip-path="url(#${id})"/>
<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="${rx - .5}" fill="none" stroke="${t.line2}"/></g>`;

/* A browser window: a quiet title bar with three dots, the page under it. */
const browser = (id, t, file, x, y, w, h, delay) => {
    const bar = 30;
    return `<g class="fade" style="${d(delay)}"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${t.surface}" filter="url(#lift)"/>
<g clip-path="url(#${id})">
<rect x="${x}" y="${y}" width="${w}" height="${bar}" fill="${t.ground}"/>
${[0, 1, 2].map(i => `<circle cx="${x + 20 + i * 16}" cy="${y + bar / 2}" r="4.5" fill="${t.line2}"/>`).join('')}
<line x1="${x}" y1="${y + bar}" x2="${x + w}" y2="${y + bar}" stroke="${t.line2}"/>
<image x="${x}" y="${y + bar}" width="${w}" height="${h - bar}" preserveAspectRatio="xMidYMin slice" href="${img(file)}" xlink:href="${img(file)}"/>
</g>
<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="11.5" fill="none" stroke="${t.line2}"/></g>`;
};

function cover(t, key) {
    const p = COVERS[key], W = 1200, H = 440;
    const media = p.phones
        ? p.phones.map((f, i) => {
            const w = 176, h = Math.round(w * 909 / 420), x = 600 - w * 1.5 - 28 + i * (w + 28);
            return shot(`${key}p${i}`, t, f, x, [70, 44, 86][i], w, h, .1 + i * .08, 22);
        }).join('')
        : browser(`${key}s`, t, p.image, 170, 56, 860, 620, .1);
    const inner = `
<rect width="${W}" height="${H}" fill="${t.ground2}"/>
${kawungField('ck', W, H, W, 0, 640, .08)}
${kawungField('ck2', W, H, 0, H, 420, .05)}
${media.replace(/ class="fade" style="[^"]*"/g, '')}`;
    return svg({ w: W, h: H, t, fonts: [], title: `${p.name}, screenshot`, body: panel('cv', W, H, t, inner) });
}

/* ---------- CLOSING ---------- */
const CLOSE_SUB = 'Email is the fastest way to reach me. I usually reply within a day.';

function closing(t, m) {
    const W = m ? 600 : 1200;
    const head = m
        ? riser('c1', [60, 94], 'Let’s build the', `x="36" y="136" class="serif ink rise" font-size="76" letter-spacing="-2.2"`, 0) +
          riser('c2', [154, 94], 'whole thing.', `x="36" y="222" class="it acc rise" font-size="76" letter-spacing="-2.2"`, .1)
        : riser('c1', [60, 96], `Let’s build the <tspan class="it acc">whole thing.</tspan>`, `x="52" y="136" class="serif ink rise" font-size="76" letter-spacing="-2.2"`, 0);
    const sub = m ? wrap(CLOSE_SUB, 520, 23) : [CLOSE_SUB];
    const yS = m ? 290 : 196, step = m ? 33 : 30, yE = yS + (sub.length - 1) * step + (m ? 60 : 66);
    const H = yE + (m ? 52 : 68);
    const inner = `
${kawungField('ck', W, H, W - 50, H / 2, m ? 360 : 480, .065)}
${head}
${lines(sub, m ? 40 : 58, yS, step, 'sans ink2', .3, .05, ` font-size="${m ? 23 : 21}"`)}
<text x="${m ? 40 : 58}" y="${yE}" class="mono muted fade" font-size="${m ? 18 : 14.5}" style="${d(.45)}">nabilamelsyana5@gmail.com</text>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'],
        title: 'Let’s build the whole thing. ' + CLOSE_SUB + ' nabilamelsyana5@gmail.com',
        body: panel('cp', W, H, t, inner)
    });
}

/* Pills: the one place with full radius. Panels are 18, buttons are pills.
   Mobile labels are shorter because four of them share a phone's width. */
function button(t, m, label, short, primary) {
    const [W, H, size] = m ? [128, 60, 20] : [290, 76, 20];
    const text = m ? short : label;
    const fill = primary ? t.accent : t.ground, stroke = primary ? t.accent : t.line2;
    return svg({
        w: W, h: H, t, fonts: ['sans'], title: label,
        body: `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${fill}" stroke="${stroke}"/>
<text x="${W / 2}" y="${H / 2 + 7}" text-anchor="middle" class="sans" font-size="${size}" font-weight="600" fill="${primary ? t.onAccent : t.ink}">${esc(text)}</text>`
    });
}

/* ---------- write ---------- */
const jobs = {
    hero,
    'title-work': (t, m) => title(t, m, 'Selected', 'work'),
    'title-stack': (t, m) => title(t, m, 'What I build', 'with'),
    'title-path': (t, m) => title(t, m, 'Where I’ve', 'been'),
    closing,
    'btn-email': (t, m) => button(t, m, 'Email me', 'Email', true),
    'btn-portfolio': (t, m) => button(t, m, 'Portfolio ↗', 'Portfolio'),
    'btn-linkedin': (t, m) => button(t, m, 'LinkedIn ↗', 'LinkedIn'),
    'btn-cv': (t, m) => button(t, m, 'Download CV', 'CV')
};
// covers are one drawing per theme: a picture scales down on a phone on its own
const covers = Object.keys(COVERS);

let total = 0;
for (const key of covers) {
    for (const [mode, t] of Object.entries(THEMES)) {
        writeFileSync(join(out, `cover-${key}-${mode}.svg`), cover(t, key));
        total++;
    }
}
for (const [name, fn] of Object.entries(jobs)) {
    for (const m of [false, true]) {
        for (const [mode, t] of Object.entries(THEMES)) {
            const file = `${name}${m ? '-m' : ''}-${mode}.svg`;
            const s = fn(t, m);
            if (/[–—]/.test(s)) throw new Error(`dash character in ${file}`);
            writeFileSync(join(out, file), s);
            total++;
        }
    }
}
console.log(`${total} images written to assets/`);
