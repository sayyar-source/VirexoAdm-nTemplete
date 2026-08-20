// Visual verification harness: boots the production build and captures the
// four modes the design ships (light/dark × LTR/RTL) plus the mobile drawer.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const OUT = 'shots'
mkdirSync(OUT, { recursive: true })

const SHOTS = [
  { name: '01-dashboard-light-en', path: '/', cfg: { theme: 'light', locale: 'en' } },
  { name: '02-dashboard-dark-en', path: '/', cfg: { theme: 'dark', locale: 'en' } },
  { name: '03-dashboard-light-ar-rtl', path: '/', cfg: { theme: 'light', locale: 'ar', dir: 'rtl' } },
  { name: '04-dashboard-dark-ar-rtl', path: '/', cfg: { theme: 'dark', locale: 'ar', dir: 'rtl' } },
  { name: '05-deals-light-en', path: '/crm/deals', cfg: { theme: 'light', locale: 'en' } },
  { name: '06-deals-dark-ar-rtl', path: '/crm/deals', cfg: { theme: 'dark', locale: 'ar', dir: 'rtl' } },
  { name: '07-customers-light-tr', path: '/crm/customers', cfg: { theme: 'light', locale: 'tr' } },
  { name: '08-roles-light-en', path: '/users/roles', cfg: { theme: 'light', locale: 'en' } },
  { name: '09-settings-light-en', path: '/settings', cfg: { theme: 'light', locale: 'en' } },
  { name: '10-settings-dark-ar-rtl', path: '/settings', cfg: { theme: 'dark', locale: 'ar', dir: 'rtl' } },
  {
    name: '11-mobile-drawer-ar-rtl',
    path: '/',
    cfg: { theme: 'light', locale: 'ar', dir: 'rtl' },
    viewport: { width: 390, height: 844 },
    openMenu: true,
  },
  {
    name: '12-mobile-dashboard-en',
    path: '/',
    cfg: { theme: 'light', locale: 'en' },
    viewport: { width: 390, height: 844 },
  },
]

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)
const failures = []

for (const shot of SHOTS) {
  const context = await browser.newContext({
    viewport: shot.viewport ?? { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.addInitScript((cfg) => {
    localStorage.setItem(
      'nexora.config',
      JSON.stringify({ density: 'default', numerals: 'latn', primary: '#6366f1', ...cfg }),
    )
  }, { ...shot.cfg, dirSetting: shot.cfg.dir ? shot.cfg.dir : 'auto' })

  await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle' })
  if (shot.openMenu) {
    // The drawer's own close button shares the word "menu" in every locale, so
    // scope the click to the top bar rather than matching on the label.
    await page.locator('header button').first().click()
    await page.waitForTimeout(400)
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: !shot.viewport })

  if (errors.length) failures.push([shot.name, errors])
  await context.close()
}

await browser.close()

if (failures.length) {
  console.error('CONSOLE ERRORS:')
  for (const [name, errors] of failures) console.error(` ${name}: ${errors.join(' | ')}`)
  process.exit(1)
}
console.log(`captured ${SHOTS.length} screenshots, no console errors`)
