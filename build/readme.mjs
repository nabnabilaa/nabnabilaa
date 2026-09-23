// Writes README.md. The drawings (hero, section titles, covers, buttons) carry
// the look of the portfolio; everything a person or a search engine needs to
// read is plain text, so it is indexed, selectable and there before any image
// loads. GitHub strips CSS from READMEs, so the drawings switch between mobile
// and desktop, dark and light, through <picture>.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const MOBILE = '(max-width: 767px)', DARK = '(prefers-color-scheme: dark)';
// kept on one line: whitespace inside a link renders as an underlined gap
const pic = (name, alt, width = '100%') => `<picture><source media="${MOBILE} and ${DARK}" srcset="assets/${name}-m-dark.svg"><source media="${MOBILE}" srcset="assets/${name}-m-light.svg"><source media="${DARK}" srcset="assets/${name}-dark.svg"><img src="assets/${name}-light.svg" width="${width}" alt="${alt}"></picture>`;
const coverPic = (key, alt) => `<picture><source media="${DARK}" srcset="assets/cover-${key}-dark.svg"><img src="assets/cover-${key}-light.svg" width="100%" alt="${alt}"></picture>`;
const a = (href, inner) => `<a href="${href}">${inner}</a>`;

const SITE = 'https://www.nabilamelsyana.com/';
const EMAIL = 'nabilamelsyana5@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/nabilamelsyana';

/* Same order and the same live links as the portfolio's data.js. Each one is
   written problem first: what was wrong, then what the product does about it. */
const PROJECTS = [
  {
    key: 'nova', name: 'Nova AI', kind: 'Agentic marketing research', meta: '2026 · MAXY Academy · solo',
    href: 'https://nova.maxy.academy/',
    text: 'Marketing teams lose days to competitor research before a campaign brief can even be written, and the research goes stale almost at once. Nova is a Chrome extension that takes one brief, researches the brand and its competitors on the live web by itself, and hands back a written market report and a ready-to-use Excel campaign plan. Seven AI providers sit behind one interface, with failover when a key hits its limit.',
    stack: ['Chrome Extension MV3', 'JavaScript', 'Chrome DevTools Protocol', 'Gemini', 'Groq', 'OpenAI', 'Claude']
  },
  {
    key: 'flowbuddy', name: 'Flowbuddy', kind: 'Employee productivity and wellbeing', meta: '2026 · MAXY Academy · team of two',
    href: 'https://flowbuddy.maxy.academy/',
    text: 'Productivity tools measure output and ignore the person producing it, so burnout only shows once someone has already stopped. Flowbuddy keeps tasks, attendance and daily mood check-ins in one place, and warns a manager when the trend turns. Built by two people; I worked across both the frontend and the backend.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'MySQL', 'Gemini AI', 'Pusher', 'PWA']
  },
  {
    key: 'vero', name: 'AI Vero', kind: 'Multi-tenant AI support agents', meta: '2026 · MAXY Academy · solo',
    href: 'https://vero.maxy.academy/',
    text: 'A support bot that makes up an answer is worse than no bot at all. AI Vero lets a company upload its own documents and web pages and get a customer-service agent that answers only from that material and says “I don’t know” otherwise, with billing, analytics and handover to a human agent built in.',
    stack: ['Next.js 15', 'TypeScript', 'OpenAI', 'RAG', 'SQLite', 'SSE streaming', 'Tailwind CSS']
  },
  {
    key: 'lms', name: 'Virtual Intern LMS', kind: 'Learning platform in three services', meta: '2026 · personal project · solo',
    href: 'https://lms-nabila-project.vercel.app/',
    text: 'Running a paid online internship means teaching, meeting, assessing and invoicing, and no single service does all four well. This one does it behind one interface: courses and quizzes, live classes that record themselves, graded coding assignments, payment and certificates, split across three services.',
    stack: ['Laravel 12', 'React 18', 'Fastify', 'PostgreSQL', 'WebRTC', 'Socket.io', 'Xendit']
  },
  {
    key: 'maxy', name: 'Maxy Learning', kind: 'Hands-on learning platform', meta: '2025 · MAXY Academy · solo',
    href: 'https://dashboard-quiz-project.vercel.app/',
    text: 'A multiple-choice quiz tests whether someone remembers the chapter, not whether they can do the work. Every lesson here is an exercise the system grades: repair a broken interface, assemble a UML diagram on a canvas, run real Git commands and watch the branch tree redraw.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
  },
  {
    key: 'otopia', name: 'Otopia Auto Care', kind: 'Car wash point of sale', meta: '2025 · personal project · solo',
    href: 'https://pos-car-wash.vercel.app/',
    text: 'A car wash sells services that quietly use up shampoo, wax and cloth, so ordinary POS stock never matches what is on the shelf. Otopia defines each service by the materials it consumes, so ringing up a wash draws them down. Cash is reconciled per shift, and staff commission comes from the same sales records as the daily report.',
    stack: ['React 18', 'FastAPI', 'Python', 'MongoDB', 'shadcn/ui', 'Recharts', 'WhatsApp API']
  },
  {
    key: 'weborder', name: 'WebOrder Studio', kind: 'Agency orders and staged payments', meta: '2025 · personal project · solo',
    href: 'https://weborder-project.vercel.app/',
    text: 'An agency website runs for weeks, gets revised and is paid in stages, which is exactly what spreadsheets and status emails handle worst. WebOrder models the order, the payment and the project as state machines, so a client watches the job move from order to handover instead of asking where it stands. One confirmed payment produces the invoice, the project record and a WhatsApp notice.',
    stack: ['Laravel 11', 'PHP 8.2', 'MySQL 8', 'Alpine.js', 'Midtrans', 'Google Calendar API', 'DomPDF']
  }
];

const project = p => `${a(p.href, coverPic(p.key, `${p.name}: ${p.kind.toLowerCase()}, screenshot`))}

### [${p.name}](${p.href})

<sub>${p.kind.toUpperCase()} · ${p.meta.toUpperCase()}</sub>

${p.text}

${p.stack.map(s => '`' + s + '`').join(' ')} &nbsp;·&nbsp; **[Open ${p.name} ↗](${p.href})**`;

const md = `${a(SITE, pic('hero', 'Nabila Melsyana, full-stack developer in Jakarta'))}

Hi, I’m **Nabila Melsyana**, a full-stack developer in Jakarta, Indonesia. I work out the problem first, then build the whole product around it: the database, the API, the interface and the release. Mostly **Laravel** and **React / Next.js** with TypeScript, on MySQL or PostgreSQL, with AI where it does real work. I’m a Full-Stack Developer at MAXY Academy, an Information Systems graduate of Telkom University, and a BNSP-certified System Analyst.

**[Portfolio](${SITE})** &nbsp;·&nbsp; **[LinkedIn](${LINKEDIN})** &nbsp;·&nbsp; **[CV (PDF)](${SITE}cv.pdf)** &nbsp;·&nbsp; **[${EMAIL}](mailto:${EMAIL})**

<br>

${pic('title-work', 'Selected work')}

These are the projects I’m free to show. Each one has a full case study on [nabilamelsyana.com](${SITE}#work).

${PROJECTS.map(project).join('\n\n<br>\n\n')}

<br>

${pic('title-stack', 'What I build with')}

| Backend | Frontend | Data | AI and integrations |
| :-- | :-- | :-- | :-- |
| Laravel, PHP 8 | React, Next.js | MySQL | Gemini, OpenAI, Claude |
| FastAPI, Python | TypeScript | PostgreSQL | RAG retrieval, SSE |
| Fastify, Express | Tailwind CSS | MongoDB | Midtrans, Xendit |
| REST API design | shadcn/ui, Radix UI | SQLite, Redis | WhatsApp API |
| Sanctum, JWT, RBAC | Framer Motion | Socket.io, WebRTC | Chrome Extension MV3 |

<br>

${pic('title-path', 'Where I’ve been')}

| Role | Where | When |
| :-- | :-- | :-- |
| **Full-Stack Developer** | MAXY Academy | Oct 2025 to now |
| Full-Stack Developer | Ministry of Education, MSIB | Aug to Dec 2024 |
| Data Management | Telkom Indonesia | Jun to Aug 2024 |
| Practicum Assistant, ADSI | Telkom University | Feb to Jun 2024 |
| Practicum Assistant, OOP | Telkom University | Sep to Dec 2023 |
| UI/UX Designer | Niagahoster x Rakamin | Aug to Oct 2023 |

**B.Sc. Information Systems**, Telkom University, 2021 to 2025, GPA 3.70 / 4.00<br>
**BNSP Certified System Analyst**, valid 2025 to 2028

<br>

${pic('closing', 'Let’s build the whole thing. Email is the fastest way to reach me.')}

<p>
${a('mailto:' + EMAIL, pic('btn-email', 'Email me', '23.8%'))}
${a(SITE, pic('btn-portfolio', 'Portfolio', '23.8%'))}
${a(LINKEDIN, pic('btn-linkedin', 'LinkedIn', '23.8%'))}
${a(SITE + 'cv.pdf', pic('btn-cv', 'Download CV', '23.8%'))}
</p>
`;
if (/[–—]/.test(md)) throw new Error('dash character in README.md');
writeFileSync(join(root, 'README.md'), md);
console.log('README.md written');
