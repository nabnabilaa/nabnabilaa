// Writes README.md. Every image has a light and a dark variant; GitHub picks
// the one that matches the viewer's theme through <picture>.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const pic = (name, alt, width = '100%') =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg"><img src="assets/${name}-light.svg" width="${width}" alt="${alt}"></picture>`;
const a = (href, inner) => `<a href="${href}">${inner}</a>`;

const SITE = 'https://www.nabilamelsyana.com/';
const md = `${a(SITE, pic('hero', 'Nabila Melsyana, full-stack developer in Jakarta. I build web products end to end, from the first requirement to the release. Open to full-stack roles.'))}

<br>

${pic('title-work', 'Selected work')}

${a('https://nova.maxy.academy/', pic('work-nova', 'Nova AI: a Chrome extension that researches a brand and its competitors on the live web, then returns a market report and an Excel campaign plan. Seven AI providers behind one interface.'))}

<p>
${a('https://vero-agent.vercel.app/login', pic('work-vero', 'AI Vero: multi-tenant support agents that answer only from a company’s own documents.', '49.5%'))}
${a('https://flowbuddy-productivity.vercel.app/', pic('work-flowbuddy', 'Flowbuddy: workplace productivity that tracks burnout, not just tasks.', '49.5%'))}
</p>
<p>
${a('https://lms-nabila-project.vercel.app/login', pic('work-lms', 'Virtual Intern LMS: three services behind one interface, with live classes and graded code.', '49.5%'))}
${a('https://pos-car-wash.vercel.app/', pic('work-otopia', 'Otopia Auto Care: a car wash point of sale where each wash draws down its own materials.', '49.5%'))}
</p>

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
${a('mailto:nabilamelsyana5@gmail.com', pic('btn-email', 'Email me', '24.4%'))}
${a(SITE, pic('btn-portfolio', 'Portfolio', '24.4%'))}
${a('https://www.linkedin.com/in/nabilamelsyana', pic('btn-linkedin', 'LinkedIn', '24.4%'))}
${a(SITE + 'cv.pdf', pic('btn-cv', 'Download CV', '24.4%'))}
</p>
`;
writeFileSync(join(root, 'README.md'), md);
console.log('README.md written');
