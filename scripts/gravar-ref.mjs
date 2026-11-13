import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1280, height: 720 })
const cdp = await p.createCDPSession()
const quadros = []
cdp.on('Page.screencastFrame', async (f) => { quadros.push({ t: f.metadata.timestamp, d: f.data }); await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) })
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 })
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 3200))
await cdp.send('Page.stopScreencast')
const fs = await import('node:fs')
const t0 = quadros[0].t
let ult = -1
for (const q of quadros) { const ms = Math.round((q.t - t0) * 1000); if (ms - ult < 90) continue; ult = ms; fs.writeFileSync(`revisao/ref/${String(ms).padStart(5, '0')}.jpg`, Buffer.from(q.d, 'base64')) }
console.log(quadros.length, 'quadros')
await b.close()
