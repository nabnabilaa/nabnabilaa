"""LinkedIn profile banner, in the portfolio's design.

Same arrangement as the banner it replaces (name, role and line top left,
the work on the right) but drawn with the site's own parts: the deep ground,
Fraunces with the italic in the Truntum pink, and the Truntum cloth from
batik.js. The bottom-left corner stays empty: LinkedIn lays the profile
photo over it.

Run: python build/linkedin.py   (writes linkedin/banner.svg, banner.png, banner@2x.png)
"""
import asyncio
from pathlib import Path

from build import (DEEP, ON, ON2, ON3, PINK, INDIGO, GLASS_LINE2, LINE2, Svg, glass, screen, truntum, jpeg)

W, H = 1584, 396
OUT = Path(__file__).resolve().parent.parent / 'linkedin'


def banner():
    g = Svg(W, H, 'Nabila Melsyana, full-stack developer. I build and deliver end-to-end web applications.')
    pg, ig, pat, mg, mk = (g.uid('g') for _ in range(5))
    g.defs.append(
        f'<radialGradient id="{pg}" cx=".1" cy=".2" r=".5" gradientTransform="translate(0 0) scale(1 2.2)"><stop offset="0" stop-color="{PINK}" stop-opacity=".2"/><stop offset="1" stop-color="{PINK}" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="{ig}" cx=".78" cy=".45" r=".45" gradientTransform="scale(1 2.2)"><stop offset="0" stop-color="rgb({INDIGO})" stop-opacity=".16"/><stop offset="1" stop-color="rgb({INDIGO})" stop-opacity="0"/></radialGradient>'
        + truntum(pat, PINK, 1.35) +
        f'<linearGradient id="{mg}" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="1"/></linearGradient>'
        f'<mask id="{mk}"><rect width="{W}" height="{H}" fill="url(#{mg})"/></mask>')
    g.add(f'<rect width="{W}" height="{H}" fill="{DEEP}"/><rect width="{W}" height="{H}" fill="url(#{pg})"/>'
          f'<rect width="{W}" height="{H}" fill="url(#{ig})"/>'
          f'<rect width="{W}" height="{H}" fill="url(#{pat})" opacity=".34" mask="url(#{mk})"/>')

    # the work, hung as three screens stepping back into the cloth
    screen(g, 'weborder-1.jpg', 1250, 56, 420, 263, rx=12, img_w=900)
    screen(g, 'vero-1.jpg', 1070, 96, 420, 263, rx=12, img_w=900)
    screen(g, 'nova-1.jpg', 890, 136, 420, 300, rx=12, img_w=900)

    # the words: kept above the line where the profile photo starts
    x = 56
    g.add(f'<circle cx="{x + 6}" cy="52" r="6" fill="{PINK}"/>')
    g.t(x + 24, 59, 'FULL-STACK DEVELOPER  /  JAKARTA', 'M', 17, ON2, ls=3.2, weight=500)
    g.t(x - 3, 128, 'Nabila Melsyana', 'F', 66, ON, ls=-1.4, weight=420)
    g.text(x - 1, 180, [('I build and deliver ', 'F', ON), ('end-to-end', 'FI', PINK), (' web applications.', 'F', ON)],
           36, ls=-.5, weight=380)

    # what it is built with, between the photo and the screens
    g.t(440, 262, 'LARAVEL · REACT · NEXT.JS', 'M', 15, ON3, ls=2, weight=500)
    g.t(440, 296, 'nabilamelsyana.com', 'M', 17, ON2, ls=1)
    return g.render()


def github_thumb():
    """The Featured card for GitHub: LinkedIn would otherwise show the avatar."""
    TW, TH = 1200, 627
    g = Svg(TW, TH, 'GitHub: the code behind the work')
    pg, ig, pat, mg, mk = (g.uid('g') for _ in range(5))
    g.defs.append(
        f'<radialGradient id="{pg}" cx=".12" cy=".3" r=".6"><stop offset="0" stop-color="{PINK}" stop-opacity=".2"/><stop offset="1" stop-color="{PINK}" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="{ig}" cx=".85" cy=".8" r=".55"><stop offset="0" stop-color="rgb({INDIGO})" stop-opacity=".16"/><stop offset="1" stop-color="rgb({INDIGO})" stop-opacity="0"/></radialGradient>'
        + truntum(pat, PINK, 1.35) +
        f'<linearGradient id="{mg}" x1="0" y1="0" x2="1" y2="0"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity="1"/></linearGradient>'
        f'<mask id="{mk}"><rect width="{TW}" height="{TH}" fill="url(#{mg})"/></mask>')
    g.add(f'<rect width="{TW}" height="{TH}" fill="{DEEP}"/><rect width="{TW}" height="{TH}" fill="url(#{pg})"/>'
          f'<rect width="{TW}" height="{TH}" fill="url(#{ig})"/>'
          f'<rect width="{TW}" height="{TH}" fill="url(#{pat})" opacity=".34" mask="url(#{mk})"/>')
    # the whole README frame, inside the card: nothing runs off an edge
    screen(g, 'readme-1.jpg', 590, 110, 540, 405, rx=14, img_w=1100, align='xMinYMin')
    x = 80
    g.add(f'<circle cx="{x + 6}" cy="112" r="6" fill="{PINK}"/>')
    g.t(x + 24, 119, 'GITHUB  /  NABNABILAA', 'M', 17, ON2, ls=3.2, weight=500)
    g.t(x - 3, 250, 'The code', 'F', 84, ON, ls=-2, weight=380)
    g.t(x - 3, 338, 'behind', 'F', 84, ON, ls=-2, weight=380)
    g.t(x - 3, 426, 'the work.', 'FI', 84, PINK, ls=-1.6, weight=380)
    g.t(x, 540, 'github.com/nabnabilaa', 'M', 18, ON3, ls=1)
    return g.render(), TW, TH


async def render(svg_path):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for scale, name in ((1, 'banner.png'), (2, 'banner@2x.png')):
            page = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=scale)
            await page.goto(svg_path.as_uri())
            await page.wait_for_timeout(800)
            await page.screenshot(path=str(OUT / name))
            await page.close()
        await b.close()


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    svg = OUT / 'banner.svg'
    svg.write_text(banner(), encoding='utf-8')
    asyncio.run(render(svg))
    thumb, tw, th = github_thumb()
    (OUT / 'github-thumb.svg').write_text(thumb, encoding='utf-8')

    async def shoot():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            b = await p.chromium.launch()
            page = await b.new_page(viewport={'width': tw, 'height': th})
            await page.goto((OUT / 'github-thumb.svg').as_uri())
            await page.wait_for_timeout(800)
            await page.screenshot(path=str(OUT / 'github-thumb.png'))
            await b.close()
    asyncio.run(shoot())
    print('written', *sorted(p.name for p in OUT.iterdir()))
