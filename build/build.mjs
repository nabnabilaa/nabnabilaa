// Generates every image in ../assets from one place: the brand tokens,
// the copy, and the motion. GitHub strips scripts and external fonts from
// a profile README, so each SVG carries its own subsetted fonts and its own
// CSS animation. Run: node build/build.mjs
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
const img = file => `data:image/jpeg;base64,${b64('img/' + file)}`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
.rise{transform-box:fill-box;animation:rise 1s ${EASE} both}
.fade{transform-box:fill-box;animation:fade .9s ${EASE} both}
.fadein{animation:fadein 1.2s ${EASE} both}
.draw{stroke-dasharray:1;animation:draw 1.8s ${EASE_IO} both}
.grow{transform-box:fill-box;transform-origin:left center;animation:grow 1.1s ${EASE} both}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

const d = s => `animation-delay:${s}s`;

function svg({ w, h, t, fonts, css = '', body, title, defs = '' }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>
<style>${fonts.map(fontFace).join('')}${baseCss(t)}${css}</style>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 ${t.grain}"/></feComponentTransfer></filter>
<pattern id="kawung" width="64" height="64" patternUnits="userSpaceOnUse"><g fill="none" stroke="${t.ink}" stroke-width="1"><ellipse cx="20" cy="20" rx="8" ry="15" transform="rotate(45 20 20)"/><ellipse cx="44" cy="20" rx="8" ry="15" transform="rotate(-45 44 20)"/><ellipse cx="20" cy="44" rx="8" ry="15" transform="rotate(-45 20 44)"/><ellipse cx="44" cy="44" rx="8" ry="15" transform="rotate(45 44 44)"/><circle cx="32" cy="32" r="2.5"/></g></pattern>
<filter id="lift" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="rgb(${t.shadow})" flood-opacity=".16"/><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgb(${t.shadow})" flood-opacity=".06"/></filter>
${defs}
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

/* Kawung ornament fading in from one side. */
const kawungField = (id, w, h, cx, cy, r, opacity) => `
<radialGradient id="${id}g" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}m"><rect width="${w}" height="${h}" fill="url(#${id}g)"/></mask>
<rect width="${w}" height="${h}" fill="url(#kawung)" opacity="${opacity}" mask="url(#${id}m)"/>`;

const lines = (arr, x, y, step, cls, delay0, delayStep = .06, extra = '') =>
    arr.map((s, i) => `<text x="${x}" y="${y + i * step}" class="${cls} fade" style="${d(delay0 + i * delayStep)}"${extra}>${esc(s)}</text>`).join('\n');

/* ---------- HERO ---------- */
function hero(t) {
    const W = 1200, H = 560, cx = 912, cy = 282;
    // one kawung medallion: four petals around a seed, drawn like wax from a canting
    const petal = (dx, dy, rot, i) => {
        const x = cx + dx, y = cy + dy;
        return `<g transform="rotate(${rot} ${x} ${y})">
<ellipse cx="${x}" cy="${y}" rx="46" ry="92" fill="${t.accent}" class="fadein" style="${d(1.5 + i * .08)};opacity:.10"/>
<ellipse cx="${x}" cy="${y}" rx="46" ry="92" pathLength="1" fill="none" stroke="${t.accent}" stroke-width="1.6" class="draw" style="${d(.35 + i * .16)}"/>
<ellipse cx="${x}" cy="${y}" rx="22" ry="58" pathLength="1" fill="none" stroke="${t.accent}" stroke-width="1" opacity=".55" class="draw" style="${d(.75 + i * .16)}"/>
<line x1="${x}" y1="${y - 40}" x2="${x}" y2="${y + 40}" pathLength="1" stroke="${t.accent}" stroke-width="1" opacity=".55" class="draw" style="${d(1.05 + i * .16)}"/>
</g>`;
    };
    const o = 70;
    const dots = Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return `<circle cx="${(cx + Math.cos(a) * 226).toFixed(1)}" cy="${(cy + Math.sin(a) * 226).toFixed(1)}" r="1.8"/>`;
    }).join('');

    const css = `
.orbit{transform-origin:${cx}px ${cy}px;animation:spin 120s linear infinite, fadein 1.4s ${EASE} 1.3s both}
@keyframes spin{to{transform:rotate(360deg)}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ${EASE} 1.8s infinite}
@keyframes ping{0%{transform:scale(1);opacity:.55}100%{transform:scale(3.2);opacity:0}}
.name{font-size:116px;letter-spacing:-3.5px}
`;
    const inner = `
${kawungField('hk', W, H, cx, cy, 520, .09)}
<circle cx="${cx}" cy="${cy}" r="200" fill="none" stroke="${t.line2}" class="fadein" style="${d(.2)}"/>
<g class="orbit" fill="${t.accent}" opacity=".5">${dots}</g>
${petal(-o, -o, 45, 0)}${petal(o, -o, -45, 1)}${petal(o, o, 45, 2)}${petal(-o, o, -45, 3)}
<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="${t.accent}" stroke-width="1.6" pathLength="1" class="draw" style="${d(1.2)}"/>
<circle cx="${cx}" cy="${cy}" r="3" fill="${t.accent}" class="fadein" style="${d(1.6)}"/>

<text x="72" y="112" class="mono acc fade" font-size="15" letter-spacing="2.6" font-weight="500" style="${d(.05)}">FULL-STACK DEVELOPER  /  JAKARTA</text>
<clipPath id="l1"><rect x="0" y="120" width="720" height="128"/></clipPath>
<clipPath id="l2"><rect x="0" y="248" width="720" height="128"/></clipPath>
<g clip-path="url(#l1)"><text x="66" y="232" class="serif ink name rise" style="${d(.15)}">Nabila</text></g>
<g clip-path="url(#l2)"><text x="70" y="344" class="it acc name rise" style="${d(.27)}">Melsyana</text></g>
${lines(['I build web products end to end, from the first', 'requirement to the release, and I stay for what comes after.'], 72, 412, 34, 'sans ink2', .5, .07, ' font-size="22"')}
<g class="fade" style="${d(.75)}">
<circle cx="80" cy="495" r="5" fill="${t.accent}" class="ping"/>
<circle cx="80" cy="495" r="5" fill="${t.accent}"/>
<text x="98" y="500" class="mono muted" font-size="15" letter-spacing=".4">Open to full-stack roles, remote or in Jakarta</text>
</g>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], css,
        title: 'Nabila Melsyana, full-stack developer in Jakarta. I build web products end to end, from the first requirement to the release. Open to full-stack roles.',
        body: panel('hp', W, H, t, inner)
    });
}

/* ---------- SECTION TITLE ---------- */
function title(t, text, italicTail = '') {
    const W = 1200, H = 112;
    return svg({
        w: W, h: H, t, fonts: italicTail ? ['serif', 'serifItalic'] : ['serif'],
        title: text + (italicTail ? ' ' + italicTail : ''),
        body: `
<clipPath id="tc"><rect x="0" y="0" width="${W}" height="84"/></clipPath>
<g clip-path="url(#tc)"><text x="2" y="66" class="serif ink rise" font-size="50" letter-spacing="-1.2">${esc(text)}${italicTail ? ` <tspan class="it acc">${esc(italicTail)}</tspan>` : ''}</text></g>
<line x1="2" y1="96" x2="${W}" y2="96" stroke="${t.line2}" class="grow" style="${d(.2)}"/>
<line x1="2" y1="96" x2="66" y2="96" stroke="${t.accent}" stroke-width="2.5" class="grow" style="${d(.35)}"/>`
    });
}

/* ---------- PROJECT CARDS ---------- */
const PROJECTS = {
    nova: {
        name: 'Nova AI', meta: '2026, built at MAXY Academy, solo', kind: 'Agentic marketing intelligence',
        brief: ['A Chrome extension that researches a brand and', 'its competitors on the live web by itself, then', 'hands back a market report and a ready-to-use', 'Excel campaign plan.'],
        figure: ['7', 'AI providers behind one interface,', 'with failover when a key hits its limit'],
        stack: 'Chrome MV3 / DevTools Protocol / Groq / Gemini / Claude', link: 'nova.maxy.academy', image: 'nova-1.jpg'
    },
    vero: {
        name: 'AI Vero', meta: '2026, MAXY Academy, solo',
        brief: ['Support agents that answer only from a company’s own', 'documents, and say “I don’t know” instead of guessing.'],
        stack: 'Next.js 15 / TypeScript / OpenAI / SQLite / SSE', link: 'vero-agent.vercel.app', image: 'vero-1.jpg'
    },
    flowbuddy: {
        name: 'Flowbuddy', meta: '2026, MAXY Academy, team of two',
        brief: ['Workplace productivity that tracks burnout, not just', 'tasks, and warns a manager when the trend turns.'],
        stack: 'Next.js 16 / React 19 / MySQL / Gemini / Pusher / PWA', link: 'flowbuddy-productivity.vercel.app', phones: ['flowbuddy-1.jpg', 'flowbuddy-2.jpg', 'flowbuddy-3.jpg']
    },
    lms: {
        name: 'Virtual Intern LMS', meta: '2026, personal project, solo',
        brief: ['Three services behind one interface: courses, live', 'classes that record themselves, and graded code.'],
        stack: 'Laravel 12 / React 18 / Fastify / WebRTC / Xendit', link: 'lms-nabila-project.vercel.app', image: 'lms-1.jpg'
    },
    otopia: {
        name: 'Otopia Auto Care', meta: '2025, personal project, solo',
        brief: ['A car wash point of sale that knows a wash burns', 'shampoo, not SKUs, so stock draws itself down.'],
        stack: 'React 18 / FastAPI / MongoDB / shadcn/ui / WhatsApp API', link: 'pos-car-wash.vercel.app', image: 'otopia-1.jpg'
    },
    weborder: {
        name: 'WebOrder Studio', meta: '2025, personal project, solo', kind: 'Agency order and payment system',
        brief: ['Orders, staged payments and projects modelled as', 'explicit state machines, so a client watches the', 'job move instead of asking where it stands.'],
        stack: 'Laravel 11 / Alpine.js / MySQL 8 / Midtrans / DomPDF', link: 'Read the case study'
    }
};

const arrow = t => `<tspan fill="${t.accent}"> ↗</tspan>`;

function featureCard(t, key) {
    const p = PROJECTS[key], W = 1200, H = 540;
    const inner = `
<rect x="600" y="0" width="600" height="${H}" fill="${t.ground2}"/>
${kawungField('fk', W, H, 1200, 0, 520, .07)}
<g class="fade" style="${d(.25)}"><clipPath id="shot"><rect x="640" y="72" width="620" height="520" rx="12"/></clipPath>
<rect x="640" y="72" width="620" height="520" rx="12" fill="${t.surface}" filter="url(#lift)"/>
<image x="640" y="72" width="620" height="465" preserveAspectRatio="xMidYMin slice" href="${img(p.image)}" xlink:href="${img(p.image)}" clip-path="url(#shot)"/>
<rect x="640.5" y="72.5" width="620" height="520" rx="12" fill="none" stroke="${t.line2}"/></g>

<text x="56" y="92" class="mono muted fade" font-size="14" style="${d(.05)}">${esc(p.meta)}</text>
<clipPath id="fn"><rect x="0" y="100" width="600" height="92"/></clipPath>
<g clip-path="url(#fn)"><text x="52" y="172" class="serif ink rise" font-size="72" letter-spacing="-2" style="${d(.1)}">${esc(p.name)}</text></g>
<text x="56" y="214" class="it acc fade" font-size="24" style="${d(.2)}">${esc(p.kind)}</text>
${lines(p.brief, 56, 266, 31, 'sans ink2', .3, .05, ' font-size="20"')}
<g class="fade" style="${d(.55)}">
<text x="52" y="444" class="serif acc" font-size="76" letter-spacing="-2">${p.figure[0]}</text>
<text x="112" y="416" class="sans ink" font-size="17" font-weight="600">${esc(p.figure[1])}</text>
<text x="112" y="440" class="sans muted" font-size="17">${esc(p.figure[2])}</text>
</g>
<line x1="56" y1="474" x2="544" y2="474" stroke="${t.line2}"/>
<text x="56" y="506" class="mono faint" font-size="13.5">${esc(p.stack)}</text>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'],
        title: `${p.name}: ${p.kind}. ${p.brief.join(' ')} Live at ${p.link}.`,
        body: panel('fc', W, H, t, inner)
    });
}

function halfCard(t, key) {
    const p = PROJECTS[key], W = 600, H = 600, MH = 318;
    let media;
    if (p.phones) {
        media = p.phones.map((f, i) => {
            const x = 72 + i * 158, y = [58, 30, 74][i], w = 142, h = Math.round(w * 909 / 420);
            return `<g class="fade" style="${d(.15 + i * .08)}"><clipPath id="ph${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/></clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${t.surface}" filter="url(#lift)"/>
<image x="${x}" y="${y}" width="${w}" height="${h}" href="${img(f)}" xlink:href="${img(f)}" clip-path="url(#ph${i})"/>
<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${h - 1}" rx="17.5" fill="none" stroke="${t.line2}"/></g>`;
        }).join('');
    } else {
        media = `<g class="fade" style="${d(.15)}"><clipPath id="hs"><rect x="56" y="48" width="600" height="400" rx="12"/></clipPath>
<rect x="56" y="48" width="600" height="400" rx="12" fill="${t.surface}" filter="url(#lift)"/>
<image x="56" y="48" width="600" height="400" preserveAspectRatio="xMinYMin slice" href="${img(p.image)}" xlink:href="${img(p.image)}" clip-path="url(#hs)"/>
<rect x="56.5" y="48.5" width="600" height="400" rx="12" fill="none" stroke="${t.line2}"/></g>`;
    }
    const inner = `
<clipPath id="mc"><rect width="${W}" height="${MH}"/></clipPath>
<g clip-path="url(#mc)"><rect width="${W}" height="${MH}" fill="${t.ground2}"/>${kawungField('hk', W, MH, W, 0, 420, .07)}${media}</g>
<line x1="0" y1="${MH}" x2="${W}" y2="${MH}" stroke="${t.line2}"/>
<text x="40" y="${MH + 50}" class="mono muted fade" font-size="14" style="${d(.1)}">${esc(p.meta)}</text>
<clipPath id="hn"><rect x="0" y="${MH + 56}" width="${W}" height="58"/></clipPath>
<g clip-path="url(#hn)"><text x="38" y="${MH + 102}" class="serif ink rise" font-size="44" letter-spacing="-1.2" style="${d(.15)}">${esc(p.name)}</text></g>
${lines(p.brief, 40, MH + 144, 28, 'sans ink2', .25, .05, ' font-size="18.5"')}
<text x="40" y="${H - 64}" class="mono faint" font-size="13">${esc(p.stack)}</text>
<text x="40" y="${H - 34}" class="mono acc" font-size="14" font-weight="500">${esc(p.link)}${arrow(t)}</text>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'sans', 'mono'],
        title: `${p.name}. ${p.brief.join(' ')} Live at ${p.link}.`,
        body: panel('hc', W, H, t, inner)
    });
}

/* WebOrder has no public demo, so its visual is the thing that makes it
   interesting: the order state machine, running. */
function machineCard(t, key) {
    const p = PROJECTS[key], W = 1200, H = 420;
    const states = [['Order', 'package'], ['Deposit', 'Midtrans 50%'], ['Build', 'calendar sync'], ['Settle', 'PDF invoice'], ['Handover', 'WhatsApp']];
    const x0 = 668, step = 118, y = 236, T = 9, hold = .74; // seconds per cycle; share of cycle spent moving forward
    const at = i => (i / (states.length - 1)) * hold * 100;
    const pct = v => v.toFixed(2) + '%';
    // progress bar: glides node to node, rests at each, resets at the end
    let prog = '', dot = '';
    states.forEach((_, i) => {
        const a = at(i), rest = Math.min(a + 6, hold * 100 + 6);
        prog += `${pct(a)}{transform:scaleX(${i / (states.length - 1)})}${pct(rest)}{transform:scaleX(${i / (states.length - 1)})}`;
        dot += `${pct(a)}{transform:translateX(${i * step}px)}${pct(rest)}{transform:translateX(${i * step}px)}`;
    });
    const css = `
@keyframes prog{0%{transform:scaleX(0)}${prog}94%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes dot{0%{transform:translateX(0)}${dot}94%{transform:translateX(${4 * step}px);opacity:1}100%{transform:translateX(${4 * step}px);opacity:0}}
.prog{transform-box:fill-box;transform-origin:left center;animation:prog ${T}s ${EASE} 1s infinite both}
.runner{animation:dot ${T}s ${EASE} 1s infinite both}
${states.map((_, i) => `@keyframes on${i}{0%,${pct(Math.max(at(i) - .01, 0))}{opacity:0}${pct(at(i) + 2)},94%{opacity:1}100%{opacity:0}}.on${i}{animation:on${i} ${T}s ${EASE} 1s infinite both}`).join('\n')}
`;
    const nodes = states.map(([s, c], i) => {
        const x = x0 + i * step;
        return `<circle cx="${x}" cy="${y}" r="11" fill="${t.ground2}" stroke="${t.line2}" stroke-width="1.5"/>
<circle cx="${x}" cy="${y}" r="11" fill="${t.wash}" stroke="${t.accent}" stroke-width="1.5" class="on${i}"/>
<text x="${x}" y="${y + 46}" text-anchor="middle" class="sans ink" font-size="17" font-weight="600">${s}</text>
<text x="${x}" y="${y + 70}" text-anchor="middle" class="mono muted" font-size="12.5">${esc(c)}</text>`;
    }).join('\n');
    const inner = `
<rect x="600" y="0" width="600" height="${H}" fill="${t.ground2}"/>
${kawungField('mk', W, H, 1200, H, 520, .06)}
<text x="${x0 - 11}" y="120" class="mono muted" font-size="13.5">What the client sees</text>
<text x="${x0 - 11}" y="152" class="serif ink" font-size="26">One job, one status, always.</text>
<line x1="${x0}" y1="${y}" x2="${x0 + 4 * step}" y2="${y}" stroke="${t.line2}" stroke-width="2"/>
<line x1="${x0}" y1="${y}" x2="${x0 + 4 * step}" y2="${y}" stroke="${t.accent}" stroke-width="2" class="prog"/>
${nodes}
<g class="runner"><circle cx="${x0}" cy="${y}" r="5" fill="${t.accent}"/></g>

<text x="56" y="92" class="mono muted fade" font-size="14" style="${d(.05)}">${esc(p.meta)}</text>
<clipPath id="wn"><rect x="0" y="100" width="600" height="84"/></clipPath>
<g clip-path="url(#wn)"><text x="52" y="164" class="serif ink rise" font-size="60" letter-spacing="-1.6" style="${d(.1)}">${esc(p.name)}</text></g>
<text x="56" y="204" class="it acc fade" font-size="22" style="${d(.2)}">${esc(p.kind)}</text>
${lines(p.brief, 56, 252, 30, 'sans ink2', .3, .05, ' font-size="19"')}
<text x="56" y="${H - 42}" class="mono faint" font-size="13.5">${esc(p.stack)}</text>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'], css,
        title: `${p.name}: ${p.kind}. ${p.brief.join(' ')} States: Order, Deposit, Build, Settle, Handover.`,
        body: panel('mc2', W, H, t, inner)
    });
}

/* ---------- STACK ---------- */
function stack(t) {
    const W = 1200, H = 470;
    const cols = [
        ['Backend', ['Laravel, PHP 8', 'FastAPI, Python', 'Fastify, Express', 'REST API design', 'Sanctum, JWT, RBAC']],
        ['Frontend', ['React, Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui, Radix UI', 'Framer Motion']],
        ['Data', ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite, Redis', 'Socket.io, WebRTC']],
        ['AI and integrations', ['Gemini, OpenAI, Claude', 'RAG retrieval, SSE', 'Midtrans, Xendit', 'WhatsApp API', 'Chrome Extension MV3']]
    ];
    const cw = 272;
    const body = cols.map(([h, items], c) => {
        const x = 56 + c * cw;
        return `<g class="fade" style="${d(.25 + c * .08)}">
<text x="${x}" y="244" class="it acc" font-size="24">${esc(h)}</text>
${items.map((s, i) => `<text x="${x}" y="${292 + i * 33}" class="sans ink2" font-size="18.5">${esc(s)}</text>`).join('')}
</g>`;
    }).join('\n');
    const inner = `
${kawungField('sk', W, H, 1200, 0, 460, .06)}
<clipPath id="s1"><rect x="0" y="50" width="${W}" height="56"/></clipPath>
<clipPath id="s2"><rect x="0" y="106" width="${W}" height="56"/></clipPath>
<g clip-path="url(#s1)"><text x="54" y="96" class="serif ink rise" font-size="38" letter-spacing="-.8">Mostly <tspan class="it acc">Laravel</tspan> and <tspan class="it acc">React/Next.js</tspan> with TypeScript,</text></g>
<g clip-path="url(#s2)"><text x="54" y="146" class="serif ink rise" font-size="38" letter-spacing="-.8" style="${d(.08)}">on MySQL or PostgreSQL. AI where it does real work.</text></g>
<line x1="56" y1="190" x2="${W - 56}" y2="190" stroke="${t.line2}" class="grow" style="${d(.2)}"/>
${body}`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans'],
        title: 'Stack. Mostly Laravel and React/Next.js with TypeScript, on MySQL or PostgreSQL. ' + cols.map(([h, i]) => `${h}: ${i.join(', ')}.`).join(' '),
        body: panel('sp', W, H, t, inner)
    });
}

/* ---------- TRAJECTORY ---------- */
function trajectory(t) {
    const W = 1200, H = 560;
    const start = [2023, 7], end = [2026, 10];           // axis runs Jul 2023 → Oct 2026
    const months = (end[0] - start[0]) * 12 + end[1] - start[1];
    const ax0 = 500, ax1 = 1136, px = (ax1 - ax0) / months;
    const X = (y, m) => ax0 + ((y - start[0]) * 12 + m - start[1]) * px;
    const rows = [
        ['Full-Stack Developer', 'MAXY Academy', [2025, 10], [2026, 9.7], 'Oct 2025 - now', true],
        ['Full-Stack Developer', 'Ministry of Education, MSIB', [2024, 8], [2024, 12.9], 'Aug - Dec 2024'],
        ['Data Management', 'Telkom Indonesia', [2024, 6], [2024, 8.9], 'Jun - Aug 2024'],
        ['Practicum Assistant, ADSI', 'Telkom University', [2024, 2], [2024, 6.9], 'Feb - Jun 2024'],
        ['Practicum Assistant, OOP', 'Telkom University', [2023, 9], [2023, 12.9], 'Sep - Dec 2023'],
        ['UI/UX Designer', 'Niagahoster x Rakamin', [2023, 8], [2023, 10.9], 'Aug - Oct 2023']
    ];
    const ticks = [2024, 2025, 2026].map(y => `<line x1="${X(y, 1)}" y1="84" x2="${X(y, 1)}" y2="${84 + rows.length * 58}" stroke="${t.line}" stroke-dasharray="2 5"/>
<text x="${X(y, 1) + 8}" y="78" class="mono faint" font-size="13">${y}</text>`).join('');
    const r = rows.map(([role, org, a, b, when, now], i) => {
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
<line x1="${nowX}" y1="60" x2="${nowX}" y2="${84 + rows.length * 58}" stroke="${t.accent}" stroke-width="1.2" class="fadein" style="${d(.4)}"/>
<text x="${nowX - 8}" y="54" text-anchor="end" class="mono acc" font-size="13">now</text>
${r}
<line x1="56" y1="${H - 104}" x2="${W - 56}" y2="${H - 104}" stroke="${t.line2}"/>
<g class="fade" style="${d(.8)}">
<text x="56" y="${H - 58}" class="serif ink" font-size="24">B.Sc. Information Systems, <tspan class="it acc">Telkom University</tspan></text>
<text x="56" y="${H - 30}" class="mono muted" font-size="13.5">2021 - 2025, GPA 3.70 / 4.00</text>
<text x="${W - 56}" y="${H - 58}" text-anchor="end" class="serif ink" font-size="24">BNSP Certified <tspan class="it acc">System Analyst</tspan></text>
<text x="${W - 56}" y="${H - 30}" text-anchor="end" class="mono muted" font-size="13.5">valid 2025 - 2028</text>
</g>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'],
        title: 'Experience. ' + rows.map(r => `${r[0]}, ${r[1]}, ${r[4]}.`).join(' ') + ' B.Sc. Information Systems, Telkom University, GPA 3.70. BNSP Certified System Analyst.',
        body: panel('tp', W, H, t, inner)
    });
}

/* ---------- CLOSING ---------- */
function closing(t) {
    const W = 1200, H = 330;
    const inner = `
${kawungField('ck', W, H, 1150, 165, 480, .065)}
<clipPath id="c1"><rect x="0" y="60" width="${W}" height="96"/></clipPath>
<g clip-path="url(#c1)"><text x="52" y="136" class="serif ink rise" font-size="76" letter-spacing="-2.2">Let’s build the <tspan class="it acc">whole thing.</tspan></text></g>
${lines(['Email is the fastest way to reach me. I usually reply within a day.'], 58, 196, 30, 'sans ink2', .3, 0, ' font-size="21"')}
<text x="58" y="262" class="mono muted fade" font-size="14.5" style="${d(.45)}">nabilamelsyana5@gmail.com</text>`;
    return svg({
        w: W, h: H, t, fonts: ['serif', 'serifItalic', 'sans', 'mono'],
        title: 'Let’s build the whole thing. Email is the fastest way to reach me: nabilamelsyana5@gmail.com. I usually reply within a day.',
        body: panel('cp', W, H, t, inner)
    });
}

/* Pills: the one place with full radius. Panels are 18, buttons are pills. */
function button(t, label, primary) {
    const W = 290, H = 76;
    const fill = primary ? t.accent : t.ground, stroke = primary ? t.accent : t.line2;
    return svg({
        w: W, h: H, t, fonts: ['sans'], title: label,
        body: `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${fill}" stroke="${stroke}"/>
<text x="${W / 2}" y="${H / 2 + 7}" text-anchor="middle" class="sans" font-size="20" font-weight="600" fill="${primary ? t.onAccent : t.ink}">${esc(label)}</text>`
    });
}

/* ---------- write ---------- */
const jobs = {
    hero: hero,
    'title-work': t => title(t, 'Selected', 'work'),
    'title-stack': t => title(t, 'What I build', 'with'),
    'title-path': t => title(t, 'Where I’ve', 'been'),
    'work-nova': t => featureCard(t, 'nova'),
    'work-vero': t => halfCard(t, 'vero'),
    'work-flowbuddy': t => halfCard(t, 'flowbuddy'),
    'work-lms': t => halfCard(t, 'lms'),
    'work-otopia': t => halfCard(t, 'otopia'),
    'work-weborder': t => machineCard(t, 'weborder'),
    stack,
    trajectory,
    closing,
    'btn-email': t => button(t, 'Email me', true),
    'btn-portfolio': t => button(t, 'Portfolio ↗'),
    'btn-linkedin': t => button(t, 'LinkedIn ↗'),
    'btn-cv': t => button(t, 'Download CV')
};

for (const [name, fn] of Object.entries(jobs)) {
    for (const [mode, t] of Object.entries(THEMES)) {
        const file = join(out, `${name}-${mode}.svg`);
        const s = fn(t);
        if (/[–—]/.test(s)) throw new Error(`dash character in ${name}`);
        writeFileSync(file, s);
        console.log(`${name}-${mode}.svg`.padEnd(30), (s.length / 1024).toFixed(0) + ' KB');
    }
}
