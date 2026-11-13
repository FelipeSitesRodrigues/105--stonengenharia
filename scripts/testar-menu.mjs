// abre o menu do celular, tira print, toca em "Serviços" e confere se fechou e rolou até lá
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
const erros = []
p.on('pageerror', (e) => erros.push(e.message))
for (const w of [320, 390]) {
  await p.setViewport({ width: w, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:3416/', { waitUntil: 'networkidle2' })
  const topo = await p.evaluate(() => { const r = document.querySelector('.topo__barra').getBoundingClientRect(); const m = document.querySelector('[data-menu-abre]').getBoundingClientRect(); return { barra: Math.round(r.right), mais: Math.round(m.right), sw: document.documentElement.scrollWidth } })
  await p.screenshot({ path: `revisao/topo-${w}.png`, clip: { x: 0, y: 0, width: w, height: 80 } })
  await p.tap('[data-menu-abre]')
  await new Promise((r) => setTimeout(r, 1200))
  await p.screenshot({ path: `revisao/menu-${w}.png` })
  await p.tap('.painel__links a[href="#diferenciais"]')
  await new Promise((r) => setTimeout(r, 1800))
  const depois = await p.evaluate(() => ({ escondido: document.querySelector('[data-painel]').hidden, y: Math.round(document.querySelector('#diferenciais').getBoundingClientRect().top), trava: document.body.classList.contains('menu-aberto') }))
  await new Promise((r) => setTimeout(r, 1500))
  await p.screenshot({ path: `revisao/diferenciais-${w}.png` })
  console.log(w, JSON.stringify({ topo, depois }))
}
console.log('erros', erros)
await b.close()
