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
@keyframes rise{from{transform:translateY(108%)}}
@keyframes fade{from{opacity:0;transform:translateY(14px)}}
@keyframes fadein{from{opacity:0}}
@keyframes draw{from{stroke-dashoffset:1}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes growy{from{transform:scaleY(0)}}
.rise{transform-box:fill-box;animation:rise 1s ${EASE} both}
.fade{transform-box:fill-box;animation:fade .9s ${EASE} both}
.fadein{animation:fadein 1.2s ${EASE} both}
.draw{stroke-dasharray:1;animation:draw 1.8s ${EASE_IO} both}
.grow{transform-box:fill-box;transform-origin:left center;animation:grow 1.1s ${EASE} both}
.growy{transform-box:fill-box;transform-origin:center top;animation:growy 1.4s ${EASE} both}
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

/* A line of display type that rises out from under its own baseline. */
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
        css: `.orbit{transform-origin:${cx}px ${cy}px;animation:spin 120s linear infinite, fadein 1.4s ${EASE} 1.3s both}
@keyframes spin{to{transform:rotate(360deg)}}`,
        body: `<circle cx="${cx}" cy="${cy}" r="${200 * s}" fill="none" stroke="${t.line2}" class="fadein" style="${d(.2)}"/>
<g class="orbit" fill="${t.accent}" opacity=".5">${dots}</g>
${petal(-o, -o, 45, 0)}${petal(o, -o, -45, 1)}${petal(o, o, 45, 2)}${petal(-o, o, -45, 3)}
<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="${t.accent}" stroke-width="1.6" pathLength="1" class="draw" style="${d(1.2)}"/>
<circle cx="${cx}" cy="${cy}" r="3" fill="${t.accent}" class="fadein" style="${d(1.6)}"/>`
    };
}

const HERO_SUB = 'I build web products end to end, from the first requirement to the release, and I stay for what comes after.';

function hero(t, m) {
    const L = m
        ? { W: 600, H: 880, cx: 300, cy: 222, s: .74, x: 40, eyebrow: [468, 19, 2.6], size: 98, l1: [560, 478, 104], l2: [654, 582, 104], sub: [wrap(HERO_SUB, 520, 24), 718, 34, 24], status: 838 }
        : { W: 1200, H: 560, cx: 912, cy: 282, s: 1, x: 72, eyebrow: [112, 15, 2.6], size: 116, l1: [232, 120, 128], l2: [344, 248, 128], sub: [['I build web products end to end, from the first', 'requirement to the release, and I stay for what comes after.'], 412, 34, 22], status: 500 };
    const med = medallion(t, L.cx, L.cy, L.s);
    const css = `${med.css}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ${EASE} 1.8s infinite}
@keyframes ping{0%{transform:scale(1);opacity:.55}100%{transform:scale(3.2);opacity:0}}
.name{font-size:${L.size}px;letter-spacing:${-L.size * .03}px}`;
    const [subLines, subY, subStep, subSize] = L.sub;
    const inner = `
${kawungField('hk', L.W, L.H, L.cx, L.cy, m ? 420 : 520, .09)}
${med.body}
<text x="${L.x}" y="${L.eyebrow[0]}" class="mono acc fade" font-size="${L.eyebrow[1]}" letter-spacing="${L.eyebrow[2]}" font-weight="500" style="${d(.05)}">FULL-STACK DEVELOPER  /  JAKARTA</text>
${riser('l1', L.l1.slice(1), 'Nabila', `x="${L.x - 6}" y="${L.l1[0]}" class="serif ink name rise"`, .15)}
${riser('l2', L.l2.slice(1), 'Melsyana', `x="${L.x - 2}" y="${L.l2[0]}" class="it acc name rise"`, .27)}
${lines(subLines, L.x, subY, subStep, 'sans ink2', .5, .07, ` font-size="${subSize}"`)}
<g class="fade" style="${d(.75)}">
<circle cx="${L.x + 8}" cy="${L.status - 5}" r="5" fill="${t.accent}" class="ping"/>
<circle cx="${L.x + 8}" cy="${L.status - 5}" r="5" fill="${t.accent}"/>
<text x="${L.x + 26}" y="${L.status}" class="mono muted" font-size="${m ? 17 : 15}" letter-spacing=".4">Open to full-stack roles, remote or in Jakarta</text>
</g>`;
    return svg({
        w: L.W, h: L.H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], css,
        title: 'Nabila Melsyana, full-stack developer in Jakarta. ' + HERO_SUB + ' Open to full-stack roles.',
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

/* ---------- PROJECTS ---------- */
const PROJECTS = {
    nova: {
        name: 'Nova AI', meta: '2026, built at MAXY Academy, solo', kind: 'Agentic marketing intelligence',
        brief: 'A Chrome extension that researches a brand and its competitors on the live web by itself, then hands back a market report and a ready-to-use Excel campaign plan.',
        figure: ['7', 'AI providers behind one interface,', 'with failover when a key hits its limit'],
        stack: 'Chrome MV3 / DevTools Protocol / Groq / Gemini / Claude', href: 'https://nova.maxy.academy/', link: 'nova.maxy.academy', image: 'nova-1.jpg'
    },
    vero: {
        name: 'AI Vero', meta: '2026, MAXY Academy, solo',
        brief: 'Support agents that answer only from a company’s own documents, and say “I don’t know” instead of guessing.',
        stack: 'Next.js 15 / TypeScript / OpenAI / SQLite / SSE', href: 'https://vero-agent.vercel.app/login', link: 'vero-agent.vercel.app', image: 'vero-1.jpg'
    },
    flowbuddy: {
        name: 'Flowbuddy', meta: '2026, MAXY Academy, team of two',
        brief: 'Workplace productivity that tracks burnout, not just tasks, and warns a manager when the trend turns.',
        stack: 'Next.js 16 / React 19 / MySQL / Gemini / Pusher / PWA', href: 'https://flowbuddy-productivity.vercel.app/', link: 'flowbuddy-productivity.vercel.app', phones: ['flowbuddy-1.jpg', 'flowbuddy-2.jpg', 'flowbuddy-3.jpg']
    },
    lms: {
        name: 'Virtual Intern LMS', meta: '2026, personal project, solo',
        brief: 'Three services behind one interface: courses, live classes that record themselves, and graded code.',
        stack: 'Laravel 12 / React 18 / Fastify / WebRTC / Xendit', href: 'https://lms-nabila-project.vercel.app/login', link: 'lms-nabila-project.vercel.app', image: 'lms-1.jpg'
    },
    otopia: {
        name: 'Otopia Auto Care', meta: '2025, personal project, solo',
        brief: 'A car wash point of sale that knows a wash burns shampoo, not SKUs, so stock draws itself down.',
        stack: 'React 18 / FastAPI / MongoDB / shadcn/ui / WhatsApp API', href: 'https://pos-car-wash.vercel.app/', link: 'pos-car-wash.vercel.app', image: 'otopia-1.jpg'
    },
    weborder: {
        name: 'WebOrder Studio', meta: '2025, personal project, solo', kind: 'Agency order and payment system',
        brief: 'Orders, staged payments and projects modelled as explicit state machines, so a client watches the job move instead of asking where it stands.',
        stack: 'Laravel 11 / Alpine.js / MySQL 8 / Midtrans / DomPDF', href: 'https://www.nabilamelsyana.com/#work'
    }
};

/* A screenshot in a lifted frame, bleeding off the edge of its media area. */
const shot = (id, t, file, x, y, w, h, delay, rx = 12) => `<g class="fade" style="${d(delay)}"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${t.surface}" filter="url(#lift)"/>
<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMinYMin slice" href="${img(file)}" xlink:href="${img(file)}" clip-path="url(#${id})"/>
<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="${rx - .5}" fill="none" stroke="${t.line2}"/></g>`;

function featureCard(t, m, key) {
    const p = PROJECTS[key];
    if (!m) {
        const W = 1200, H = 540;
        const inner = `
<rect x="600" y="0" width="600" height="${H}" fill="${t.ground2}"/>
${kawungField('fk', W, H, 1200, 0, 520, .07)}
${shot('fs', t, p.image, 640, 72, 620, 520, .25)}
<text x="56" y="92" class="mono muted fade" font-size="14" style="${d(.05)}">${esc(p.meta)}</text>
${riser('fn', [100, 92], esc(p.name), `x="52" y="172" class="serif ink rise" font-size="72" letter-spacing="-2"`, .1)}
<text x="56" y="214" class="it acc fade" font-size="24" style="${d(.2)}">${esc(p.kind)}</text>
${lines(wrap(p.brief, 488, 20), 56, 266, 31, 'sans ink2', .3, .05, ' font-size="20"')}
<g class="fade" style="${d(.55)}">
<text x="52" y="444" class="serif acc" font-size="76" letter-spacing="-2">${p.figure[0]}</text>
<text x="112" y="416" class="sans ink" font-size="17" font-weight="600">${esc(p.figure[1])}</text>
<text x="112" y="440" class="sans muted" font-size="17">${esc(p.figure[2])}</text>
</g>
<line x1="56" y1="474" x2="544" y2="474" stroke="${t.line2}"/>
<text x="56" y="506" class="mono faint" font-size="13.5">${esc(p.stack)}</text>`;
        return svg({ w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], title: `${p.name}: ${p.kind}. ${p.brief} Live at ${p.link}.`, body: panel('fc', W, H, t, inner) });
    }
    const W = 600, MH = 372, brief = wrap(p.brief, 520, 23), stack = wrap(p.stack, 520, 16, .6);
    const yB = MH + 222, yF = yB + (brief.length - 1) * 33 + 112, yS = yF + 58;
    const H = yS + (stack.length - 1) * 24 + 40;
    const inner = `
<rect width="${W}" height="${MH}" fill="${t.ground2}"/>
${kawungField('fk', W, MH, W, 0, 420, .07)}
<clipPath id="fm"><rect width="${W}" height="${MH}"/></clipPath>
<g clip-path="url(#fm)">${shot('fs', t, p.image, 40, 44, 600, 450, .2)}</g>
<line x1="0" y1="${MH}" x2="${W}" y2="${MH}" stroke="${t.line2}"/>
<text x="40" y="${MH + 56}" class="mono muted fade" font-size="18" style="${d(.05)}">${esc(p.meta)}</text>
${riser('fn', [MH + 64, 82], esc(p.name), `x="36" y="${MH + 130}" class="serif ink rise" font-size="68" letter-spacing="-2"`, .1)}
<text x="40" y="${MH + 174}" class="it acc fade" font-size="28" style="${d(.2)}">${esc(p.kind)}</text>
${lines(brief, 40, yB, 33, 'sans ink2', .3, .05, ' font-size="23"')}
<g class="fade" style="${d(.55)}">
<text x="36" y="${yF}" class="serif acc" font-size="80" letter-spacing="-2">${p.figure[0]}</text>
<text x="100" y="${yF - 30}" class="sans ink" font-size="20" font-weight="600">${esc(p.figure[1])}</text>
<text x="100" y="${yF - 3}" class="sans muted" font-size="20">${esc(p.figure[2])}</text>
</g>
<line x1="40" y1="${yS - 34}" x2="${W - 40}" y2="${yS - 34}" stroke="${t.line2}"/>
${lines(stack, 40, yS, 24, 'mono faint', .6, 0, ' font-size="16"')}`;
    return svg({ w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], title: `${p.name}: ${p.kind}. ${p.brief} Live at ${p.link}.`, body: panel('fc', W, H, t, inner) });
}

/* One half-width card, laid out at (0,0); returns its body and height so a
   pair can be placed side by side (desktop) or stacked (mobile). */
function halfCard(t, m, key) {
    const p = PROJECTS[key], id = key, W = 600;
    const S = m
        ? { MH: 330, meta: 18, name: 52, brief: 23, bStep: 33, stack: 16, sStep: 24 }
        : { MH: 318, meta: 14, name: 44, brief: 18.5, bStep: 28, stack: 13, sStep: 20 };
    const brief = wrap(p.brief, 520, S.brief), stack = m ? wrap(p.stack, 520, S.stack, .6) : [p.stack];
    const yMeta = S.MH + (m ? 54 : 50), yName = yMeta + (m ? 64 : 52), yB = yName + (m ? 48 : 42);
    const yS = yB + (brief.length - 1) * S.bStep + (m ? 50 : 44);
    const H = yS + (stack.length - 1) * S.sStep + (m ? 40 : 38);
    let media;
    if (p.phones) {
        media = p.phones.map((f, i) => {
            const x = 72 + i * 158, y = [58, 30, 74][i], w = 142, h = Math.round(w * 909 / 420);
            return shot(`${id}p${i}`, t, f, x, y, w, h, .15 + i * .08, 18);
        }).join('');
    } else media = shot(`${id}s`, t, p.image, 56, 48, 600, 400, .15);
    const inner = `
<clipPath id="${id}mc"><rect width="${W}" height="${S.MH}"/></clipPath>
<g clip-path="url(#${id}mc)"><rect width="${W}" height="${S.MH}" fill="${t.ground2}"/>${kawungField(id + 'k', W, S.MH, W, 0, 420, .07)}${media}</g>
<line x1="0" y1="${S.MH}" x2="${W}" y2="${S.MH}" stroke="${t.line2}"/>
<text x="40" y="${yMeta}" class="mono muted fade" font-size="${S.meta}" style="${d(.1)}">${esc(p.meta)}</text>
${riser(id + 'n', [yName - S.name * .82, S.name * 1.12], esc(p.name), `x="38" y="${yName}" class="serif ink rise" font-size="${S.name}" letter-spacing="-1.2"`, .15)}
${lines(brief, 40, yB, S.bStep, 'sans ink2', .25, .05, ` font-size="${S.brief}"`)}
${lines(stack, 40, yS, S.sStep, 'mono faint', .45, 0, ` font-size="${S.stack}"`)}`;
    return { h: H, w: W, title: `${p.name}. ${p.brief}`, render: hh => panel(id + 'pc', W, hh, t, inner) };
}

function pair(t, m, a, b) {
    const A = halfCard(t, m, a), B = halfCard(t, m, b), gap = m ? 28 : 16;
    const h = Math.max(A.h, B.h);
    const W = m ? 600 : 1200 + gap, H = m ? A.h + gap + B.h : h;
    const body = m
        ? `${A.render(A.h)}<g transform="translate(0 ${A.h + gap})">${B.render(B.h)}</g>`
        : `${A.render(h)}<g transform="translate(${600 + gap} 0)">${B.render(h)}</g>`;
    return svg({ w: W, h: H, t, fonts: ['serif', 'sans', 'mono'], title: `${A.title} ${B.title}`, body });
}

/* The link under each card of a pair. Desktop names the domain; mobile, where
   two of these share a phone's width, names the product. */
function chip(t, m, key) {
    const p = PROJECTS[key];
    const [W, H] = m ? [280, 64] : [600, 52];
    const body = m
        ? `<text x="6" y="40" class="sans ink" font-size="22" font-weight="600">${esc(p.name)}<tspan fill="${t.accent}"> ↗</tspan></text>`
        : `<text x="40" y="30" class="mono acc" font-size="15" font-weight="500">${esc(p.link)} ↗</text>`;
    return svg({ w: W, h: H, t, fonts: [m ? 'sans' : 'mono'], title: `Open ${p.name}`, body });
}

/* WebOrder has no public demo, so its visual is the thing that makes it
   interesting: the order state machine, running. */
function machineCard(t, m, key) {
    const p = PROJECTS[key];
    const states = [['Order', 'package'], ['Deposit', 'Midtrans 50%'], ['Build', 'calendar sync'], ['Settle', 'PDF invoice'], ['Handover', 'WhatsApp']];
    const brief = wrap(p.brief, m ? 520 : 470, m ? 23 : 19), stack = m ? wrap(p.stack, 520, 16, .6) : [p.stack];
    // layout: desktop is text left, machine right; mobile stacks them
    let W, H, x0, step, y, textBlock, machineBg, heading;
    if (!m) {
        W = 1200; H = 420; x0 = 668; step = 118; y = 236;
        machineBg = `<rect x="600" y="0" width="600" height="${H}" fill="${t.ground2}"/>${kawungField('mk', W, H, 1200, H, 520, .06)}`;
        heading = [x0 - 11, 120, 152, 13.5, 26];
        textBlock = `
<text x="56" y="92" class="mono muted fade" font-size="14" style="${d(.05)}">${esc(p.meta)}</text>
${riser('wn', [100, 84], esc(p.name), `x="52" y="164" class="serif ink rise" font-size="60" letter-spacing="-1.6"`, .1)}
<text x="56" y="204" class="it acc fade" font-size="22" style="${d(.2)}">${esc(p.kind)}</text>
${lines(brief, 56, 252, 30, 'sans ink2', .3, .05, ' font-size="19"')}
<text x="56" y="${H - 42}" class="mono faint" font-size="13.5">${esc(p.stack)}</text>`;
    } else {
        W = 600; x0 = 64; step = 118;
        const yB = 222, yS = yB + (brief.length - 1) * 33 + 54, top = yS + (stack.length - 1) * 24 + 40;
        heading = [40, top + 62, top + 102, 17, 30];
        y = top + 176; H = y + 96;
        machineBg = `<rect x="0" y="${top}" width="${W}" height="${H - top}" fill="${t.ground2}"/><line x1="0" y1="${top}" x2="${W}" y2="${top}" stroke="${t.line2}"/>${kawungField('mk', W, H - top, W, H, 420, .06, top)}`;
        textBlock = `
<text x="40" y="70" class="mono muted fade" font-size="18" style="${d(.05)}">${esc(p.meta)}</text>
${riser('wn', [78, 80], esc(p.name), `x="36" y="140" class="serif ink rise" font-size="60" letter-spacing="-1.6"`, .1)}
<text x="40" y="182" class="it acc fade" font-size="27" style="${d(.2)}">${esc(p.kind)}</text>
${lines(brief, 40, yB, 33, 'sans ink2', .3, .05, ' font-size="23"')}
${lines(stack, 40, yS, 24, 'mono faint', .5, 0, ' font-size="16"')}`;
    }
    const T = 9, hold = .74; // seconds per cycle; share of the cycle spent moving forward
    const at = i => (i / (states.length - 1)) * hold * 100;
    const pct = v => v.toFixed(2) + '%';
    let prog = '', dot = '';
    states.forEach((_, i) => {
        const a = at(i), rest = a + 6;
        prog += `${pct(a)}{transform:scaleX(${i / 4})}${pct(rest)}{transform:scaleX(${i / 4})}`;
        dot += `${pct(a)}{transform:translateX(${i * step}px)}${pct(rest)}{transform:translateX(${i * step}px)}`;
    });
    const css = `
@keyframes prog{0%{transform:scaleX(0)}${prog}94%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes dot{0%{transform:translateX(0)}${dot}94%{transform:translateX(${4 * step}px);opacity:1}100%{transform:translateX(${4 * step}px);opacity:0}}
.prog{transform-box:fill-box;transform-origin:left center;animation:prog ${T}s ${EASE} 1s infinite both}
.runner{animation:dot ${T}s ${EASE} 1s infinite both}
${states.map((_, i) => `@keyframes on${i}{0%,${pct(Math.max(at(i) - .01, 0))}{opacity:0}${pct(at(i) + 2)},94%{opacity:1}100%{opacity:0}}.on${i}{animation:on${i} ${T}s ${EASE} 1s infinite both}`).join('\n')}`;
    const nodes = states.map(([s, c], i) => {
        const x = x0 + i * step;
        return `<circle cx="${x}" cy="${y}" r="${m ? 12 : 11}" fill="${t.ground2}" stroke="${t.line2}" stroke-width="1.5"/>
<circle cx="${x}" cy="${y}" r="${m ? 12 : 11}" fill="${t.wash}" stroke="${t.accent}" stroke-width="1.5" class="on${i}"/>
<text x="${x}" y="${y + (m ? 50 : 46)}" text-anchor="middle" class="sans ink" font-size="${m ? 19 : 17}" font-weight="600">${s}</text>
${m ? '' : `<text x="${x}" y="${y + 70}" text-anchor="middle" class="mono muted" font-size="12.5">${esc(c)}</text>`}`;
    }).join('\n');
    const inner = `
${machineBg}
<text x="${heading[0]}" y="${heading[1]}" class="mono muted" font-size="${heading[3]}">What the client sees</text>
<text x="${heading[0]}" y="${heading[2]}" class="serif ink" font-size="${heading[4]}">One job, one status, always.</text>
<line x1="${x0}" y1="${y}" x2="${x0 + 4 * step}" y2="${y}" stroke="${t.line2}" stroke-width="2"/>
<line x1="${x0}" y1="${y}" x2="${x0 + 4 * step}" y2="${y}" stroke="${t.accent}" stroke-width="2" class="prog"/>
${nodes}
<g class="runner"><circle cx="${x0}" cy="${y}" r="5" fill="${t.accent}"/></g>
${textBlock}`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], css,
        title: `${p.name}: ${p.kind}. ${p.brief} States: Order, Deposit, Build, Settle, Handover.`,
        body: panel('mc2', W, H, t, inner)
    });
}

/* ---------- STACK ---------- */
const STACK = [
    ['Backend', ['Laravel, PHP 8', 'FastAPI, Python', 'Fastify, Express', 'REST API design', 'Sanctum, JWT, RBAC']],
    ['Frontend', ['React, Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui, Radix UI', 'Framer Motion']],
    ['Data', ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite, Redis', 'Socket.io, WebRTC']],
    ['AI and integrations', ['Gemini, OpenAI, Claude', 'RAG retrieval, SSE', 'Midtrans, Xendit', 'WhatsApp API', 'Chrome Extension MV3']]
];
const L_ = w => `<tspan class="it acc">${w}</tspan>`;

function stack(t, m) {
    const head = m
        ? [`Mostly ${L_('Laravel')} and`, `${L_('React/Next.js')} with TypeScript,`, 'on MySQL or PostgreSQL.', 'AI where it does real work.']
        : [`Mostly ${L_('Laravel')} and ${L_('React/Next.js')} with TypeScript,`, 'on MySQL or PostgreSQL. AI where it does real work.'];
    const hs = m ? 38 : 38, hStep = m ? 48 : 50, hy = m ? 84 : 96;
    const rule = hy + (head.length - 1) * hStep + (m ? 46 : 44);
    const col = (c, x, y) => {
        const [h, items] = STACK[c];
        return `<g class="fade" style="${d(.25 + c * .08)}">
<text x="${x}" y="${y}" class="it acc" font-size="${m ? 27 : 24}">${esc(h)}</text>
${items.map((s, i) => `<text x="${x}" y="${y + (m ? 46 : 48) + i * (m ? 34 : 33)}" class="sans ink2" font-size="${m ? 21 : 18.5}">${esc(s)}</text>`).join('')}
</g>`;
    };
    let W, H, cols;
    if (m) {
        W = 600; const r1 = rule + 62, r2 = r1 + 246;
        cols = col(0, 40, r1) + col(1, 316, r1) + col(2, 40, r2) + col(3, 316, r2);
        H = r2 + 46 + 4 * 34 + 44;
    } else {
        W = 1200; H = 470;
        cols = STACK.map((_, c) => col(c, 56 + c * 272, 244)).join('');
    }
    const x = m ? 38 : 54;
    const inner = `
${kawungField('sk', W, H, W, 0, m ? 380 : 460, .06)}
${head.map((s, i) => riser('s' + i, [hy + i * hStep - hs * .95, hStep], s, `x="${x}" y="${hy + i * hStep}" class="serif ink rise" font-size="${hs}" letter-spacing="-.8"`, i * .08)).join('\n')}
<line x1="${x + 2}" y1="${rule}" x2="${W - x - 2}" y2="${rule}" stroke="${t.line2}" class="grow" style="${d(.2)}"/>
${cols}`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans'],
        title: 'Stack. Mostly Laravel and React/Next.js with TypeScript, on MySQL or PostgreSQL. ' + STACK.map(([h, i]) => `${h}: ${i.join(', ')}.`).join(' '),
        body: panel('sp', W, H, t, inner)
    });
}

/* ---------- TRAJECTORY ---------- */
const ROLES = [
    ['Full-Stack Developer', 'MAXY Academy', [2025, 10], [2026, 9.7], 'Oct 2025 - now', true],
    ['Full-Stack Developer', 'Ministry of Education, MSIB', [2024, 8], [2024, 12.9], 'Aug - Dec 2024'],
    ['Data Management', 'Telkom Indonesia', [2024, 6], [2024, 8.9], 'Jun - Aug 2024'],
    ['Practicum Assistant, ADSI', 'Telkom University', [2024, 2], [2024, 6.9], 'Feb - Jun 2024'],
    ['Practicum Assistant, OOP', 'Telkom University', [2023, 9], [2023, 12.9], 'Sep - Dec 2023'],
    ['UI/UX Designer', 'Niagahoster x Rakamin', [2023, 8], [2023, 10.9], 'Aug - Oct 2023']
];
const TRAJ_TITLE = 'Experience. ' + ROLES.map(r => `${r[0]}, ${r[1]}, ${r[4]}.`).join(' ') + ' B.Sc. Information Systems, Telkom University, GPA 3.70. BNSP Certified System Analyst.';

function trajectory(t, m) {
    if (m) return trajectoryMobile(t);
    const W = 1200, H = 560;
    const start = [2023, 7], end = [2026, 10];           // axis runs Jul 2023 to Oct 2026
    const months = (end[0] - start[0]) * 12 + end[1] - start[1];
    const ax0 = 500, ax1 = 1136, px = (ax1 - ax0) / months;
    const X = (y, mo) => ax0 + ((y - start[0]) * 12 + mo - start[1]) * px;
    const ticks = [2024, 2025, 2026].map(y => `<line x1="${X(y, 1)}" y1="84" x2="${X(y, 1)}" y2="${84 + ROLES.length * 58}" stroke="${t.line}" stroke-dasharray="2 5"/>
<text x="${X(y, 1) + 8}" y="78" class="mono faint" font-size="13">${y}</text>`).join('');
    const r = ROLES.map(([role, org, a, b, when, now], i) => {
        const y = 128 + i * 58, x1 = X(...a), x2 = X(...b);
        return `<g class="fade" style="${d(.15 + i * .07)}">
<text x="56" y="${y}" class="sans ink" font-size="17.5" font-weight="600">${esc(role)}</text>
<text x="56" y="${y + 23}" class="sans muted" font-size="15.5">${esc(org)}</text>
<text x="452" y="${y + 10}" text-anchor="end" class="mono ${now ? 'acc' : 'faint'}" font-size="13">${esc(when)}</text>
</g>
<rect x="${x1}" y="${y}" width="${x2 - x1}" height="12" rx="6" fill="${now ? t.accent : t.ink2}" opacity="${now ? 1 : .32}" class="grow" style="${d(.45 + i * .07)}"/>`;
    }).join('\n');
    const nowX = X(2026, 9.7);
    const inner = `
${kawungField('tk', W, H, 0, H, 480, .05)}
${ticks}
<line x1="${nowX}" y1="60" x2="${nowX}" y2="${84 + ROLES.length * 58}" stroke="${t.accent}" stroke-width="1.2" class="fadein" style="${d(.4)}"/>
<text x="${nowX - 8}" y="54" text-anchor="end" class="mono acc" font-size="13">now</text>
${r}
<line x1="56" y1="${H - 104}" x2="${W - 56}" y2="${H - 104}" stroke="${t.line2}"/>
<g class="fade" style="${d(.8)}">
<text x="56" y="${H - 58}" class="serif ink" font-size="24">B.Sc. Information Systems, <tspan class="it acc">Telkom University</tspan></text>
<text x="56" y="${H - 30}" class="mono muted" font-size="13.5">2021 - 2025, GPA 3.70 / 4.00</text>
<text x="${W - 56}" y="${H - 58}" text-anchor="end" class="serif ink" font-size="24">BNSP Certified <tspan class="it acc">System Analyst</tspan></text>
<text x="${W - 56}" y="${H - 30}" text-anchor="end" class="mono muted" font-size="13.5">valid 2025 - 2028</text>
</g>`;
    return svg({ w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], title: TRAJ_TITLE, body: panel('tp', W, H, t, inner) });
}

/* On a phone the time axis would be unreadable, so the mobile version is a
   vertical rail: newest first, the current role lit. */
function trajectoryMobile(t) {
    const W = 600, y0 = 84, step = 104, railX = 52;
    const last = y0 + (ROLES.length - 1) * step;
    const rows = ROLES.map(([role, org, , , when, now], i) => {
        const y = y0 + i * step;
        return `<circle cx="${railX}" cy="${y - 7}" r="7" fill="${now ? t.accent : t.ground}" stroke="${now ? t.accent : t.faint}" stroke-width="1.5" class="fadein" style="${d(.3 + i * .08)}"/>
<g class="fade" style="${d(.15 + i * .08)}">
<text x="84" y="${y}" class="sans ink" font-size="22" font-weight="600">${esc(role)}</text>
<text x="84" y="${y + 30}" class="sans muted" font-size="19">${esc(org)}</text>
<text x="84" y="${y + 58}" class="mono ${now ? 'acc' : 'faint'}" font-size="16">${esc(when)}</text>
</g>`;
    }).join('\n');
    const rule = last + 100, H = rule + 236;
    const inner = `
${kawungField('tk', W, H, 0, H, 420, .05)}
<line x1="${railX}" y1="${y0 - 7}" x2="${railX}" y2="${last - 7}" stroke="${t.line2}" stroke-width="1.5" class="growy" style="${d(.1)}"/>
${rows}
<line x1="40" y1="${rule}" x2="${W - 40}" y2="${rule}" stroke="${t.line2}"/>
<g class="fade" style="${d(.7)}">
<text x="40" y="${rule + 56}" class="serif ink" font-size="27">B.Sc. Information Systems</text>
<text x="40" y="${rule + 90}" class="it acc" font-size="27">Telkom University</text>
<text x="40" y="${rule + 120}" class="mono muted" font-size="16">2021 - 2025, GPA 3.70 / 4.00</text>
<text x="40" y="${rule + 176}" class="serif ink" font-size="27">BNSP Certified <tspan class="it acc">System Analyst</tspan></text>
<text x="40" y="${rule + 206}" class="mono muted" font-size="16">valid 2025 - 2028</text>
</g>`;
    return svg({ w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], title: TRAJ_TITLE, body: panel('tp', W, H, t, inner) });
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
    'work-nova': (t, m) => featureCard(t, m, 'nova'),
    'work-pair-1': (t, m) => pair(t, m, 'vero', 'flowbuddy'),
    'work-pair-2': (t, m) => pair(t, m, 'lms', 'otopia'),
    'work-weborder': (t, m) => machineCard(t, m, 'weborder'),
    ...Object.fromEntries(['vero', 'flowbuddy', 'lms', 'otopia'].map(k => [`chip-${k}`, (t, m) => chip(t, m, k)])),
    stack,
    trajectory,
    closing,
    'btn-email': (t, m) => button(t, m, 'Email me', 'Email', true),
    'btn-portfolio': (t, m) => button(t, m, 'Portfolio ↗', 'Portfolio'),
    'btn-linkedin': (t, m) => button(t, m, 'LinkedIn ↗', 'LinkedIn'),
    'btn-cv': (t, m) => button(t, m, 'Download CV', 'CV')
};

let total = 0;
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
