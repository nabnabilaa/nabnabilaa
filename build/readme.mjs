// Writes README.md. Every image exists in four variants and the browser picks
// one through <picture>: mobile (under 768px wide) or desktop, dark or light.
// GitHub strips CSS from READMEs, so this is the only way to be responsive.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const MOBILE = '(max-width: 767px)', DARK = '(prefers-color-scheme: dark)';
// kept on one line: whitespace inside a link renders as an underlined gap
const pic = (name, alt, width = '100%') => `<picture><source media="${MOBILE} and ${DARK}" srcset="assets/${name}-m-dark.svg"><source media="${MOBILE}" srcset="assets/${name}-m-light.svg"><source media="${DARK}" srcset="assets/${name}-dark.svg"><img src="assets/${name}-light.svg" width="${width}" alt="${alt}"></picture>`;
const a = (href, inner) => `<a href="${href}">${inner}</a>`;

const SITE = 'https://www.nabilamelsyana.com/';
const LIVE = {
  vero: ['https://vero-agent.vercel.app/login', 'Open AI Vero'],
  flowbuddy: ['https://flowbuddy-productivity.vercel.app/', 'Open Flowbuddy'],
  lms: ['https://lms-nabila-project.vercel.app/login', 'Open Virtual Intern LMS'],
  otopia: ['https://pos-car-wash.vercel.app/', 'Open Otopia Auto Care']
};
const chips = (x, y) => `<p>
${a(LIVE[x][0], pic('chip-' + x, LIVE[x][1], '49%'))}
${a(LIVE[y][0], pic('chip-' + y, LIVE[y][1], '49%'))}
</p>`;

const md = `${a(SITE, pic('hero', 'Nabila Melsyana, full-stack developer in Jakarta. I build web products end to end, from the first requirement to the release. Open to full-stack roles.'))}

<br>

${pic('title-work', 'Selected work')}

${a('https://nova.maxy.academy/', pic('work-nova', 'Nova AI: a Chrome extension that researches a brand and its competitors on the live web, then returns a market report and an Excel campaign plan. Seven AI providers behind one interface.'))}

${a(SITE + '#work', pic('work-pair-1', 'AI Vero: support agents that answer only from a company’s own documents. Flowbuddy: workplace productivity that tracks burnout, not just tasks.'))}

${chips('vero', 'flowbuddy')}

${a(SITE + '#work', pic('work-pair-2', 'Virtual Intern LMS: three services behind one interface, with live classes and graded code. Otopia Auto Care: a car wash point of sale where each wash draws down its own materials.'))}

${chips('lms', 'otopia')}

${a(SITE + '#work', pic('work-weborder', 'WebOrder Studio: agency orders, staged payments and projects as state machines. Order, Deposit, Build, Settle, Handover.'))}

<br>

${pic('title-stack', 'What I build with')}

${pic('stack', 'Mostly Laravel and React/Next.js with TypeScript, on MySQL or PostgreSQL. Also FastAPI, Fastify, MongoDB, Gemini, OpenAI, Claude, Midtrans, Xendit and the WhatsApp API.')}

<br>

${pic('title-path', 'Where I’ve been')}

${pic('trajectory', 'Full-Stack Developer at MAXY Academy since October 2025. Before that: Ministry of Education (MSIB), Telkom Indonesia, two practicum assistant terms at Telkom University, and UI/UX at Niagahoster x Rakamin. B.Sc. Information Systems, Telkom University. BNSP Certified System Analyst.')}

<br>

${pic('closing', 'Let’s build the whole thing. Email: nabilamelsyana5@gmail.com')}

<p>
${a('mailto:nabilamelsyana5@gmail.com', pic('btn-email', 'Email me', '23.8%'))}
${a(SITE, pic('btn-portfolio', 'Portfolio', '23.8%'))}
${a('https://www.linkedin.com/in/nabilamelsyana', pic('btn-linkedin', 'LinkedIn', '23.8%'))}
${a(SITE + 'cv.pdf', pic('btn-cv', 'Download CV', '23.8%'))}
</p>
`;
writeFileSync(join(root, 'README.md'), md);
console.log('README.md written');
