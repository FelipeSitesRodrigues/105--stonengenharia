/**
 * Imagens do site em src/assets/img, em AVIF e WebP e em várias larguras pra srcset, com o
 * manifesto.json (largura, altura e peso de cada arquivo, pro width/height do <img>). Base da 0100.
 *
 * Origem: ../0105 - José My Eng/Recursos Site/ia, as cenas geradas no ChatGPT no mesmo chat do
 * mockup (2026-11-11). São ilustrativas até o José mandar as fotos reais; aí trocam aqui.
 * Logos: insumos/ (node scripts/logos.mjs tira o fundo dos PNG que vieram).
 * Uso: node scripts/processar-imagens.mjs   (depois: node build.mjs)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import path from 'node:path'

const IA = '../0105 - José My Eng/Recursos Site/ia'
const OUT = 'src/assets/img'
const RAIZ = 'src/raiz'
mkdirSync(OUT, { recursive: true })
mkdirSync(RAIZ, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(path.join(OUT, f), { recursive: true, force: true })
const manifesto = {}

async function gravar(pipeline, nome) {
  const info = await pipeline.toFile(path.join(OUT, nome))
  manifesto[nome] = { w: info.width, h: info.height, kb: Math.round(info.size / 1024) }
}

// uma imagem em várias larguras, AVIF e WebP. corte = [x, y, largura, altura] em fração
async function variantes(nome, origem, larguras, { corte, alfa = false } = {}) {
  let buf = await sharp(origem).toBuffer()
  if (corte) {
    const m = await sharp(buf).metadata()
    buf = await sharp(buf).extract({
      left: Math.round(m.width * corte[0]), top: Math.round(m.height * corte[1]),
      width: Math.round(m.width * corte[2]), height: Math.round(m.height * corte[3]),
    }).toBuffer()
  }
  const { width } = await sharp(buf).metadata()
  for (const w of larguras) {
    if (w > width * 1.02) continue
    for (const f of ['avif', 'webp']) {
      let p = sharp(buf).resize({ width: w, kernel: 'lanczos3' })
      p = f === 'avif'
        ? p.avif({ quality: alfa ? 62 : 52, effort: 7, chromaSubsampling: alfa ? '4:4:4' : '4:2:0' })
        : p.webp({ quality: alfa ? 86 : 76, alphaQuality: 90, effort: 6, smartSubsample: true })
      await gravar(p, `${nome}-${w}.${f}`)
    }
  }
  console.log(nome.padEnd(24), larguras.join(', '))
}

// ---------------------------------------------------------------- hero
// mesmo tamanho do hero da 079 Criatto: 1672x941 no computador, 941x1672 no celular
await variantes('hero', `${IA}/01-hero-desktop.png`, [960, 1280, 1672])
await variantes('hero-celular', `${IA}/02-hero-celular.png`, [480, 760, 941])

// ---------------------------------------------------------------- serviços (cartões em pé, 4:5)
// o corte em pé escolhe o pedaço da cena onde está a ação de cada serviço
const servicos = [
  ['nr13', '03-servico-nr13', [0.08, 0, 0.5, 1]],
  ['linha-de-vida', '04-servico-linha-de-vida', [0.4, 0, 0.5, 1]],
  ['estanqueidade', '05-servico-estanqueidade', [0.15, 0, 0.5, 1]],
  ['calibracao', '06-servico-calibracao', [0.3, 0, 0.5, 1]],
  ['pmoc', '07-servico-pmoc', [0.05, 0, 0.5, 1]],
  ['projetos', '08-servico-projetos', [0.3, 0, 0.5, 1]],
  ['consultoria', '11-servico-consultoria', [0.28, 0, 0.5, 1]],
  ['treinamentos', '09-servico-treinamentos', [0.22, 0, 0.5, 1]],
]
// 0,5 da largura x altura inteira = 768x1024 (3:4)
for (const [nome, arq, corte] of servicos) await variantes(`servico-${nome}`, `${IA}/${arq}.png`, [400, 560, 768], { corte })

// ---------------------------------------------------------------- portfólio (inteiras, 3:2)
for (const [nome, arq] of [['nr13', '03-servico-nr13'], ['linha-de-vida', '04-servico-linha-de-vida'], ['calibracao', '06-servico-calibracao'], ['estanqueidade', '05-servico-estanqueidade'], ['pmoc', '07-servico-pmoc']]) {
  await variantes(`obra-${nome}`, `${IA}/${arq}.png`, [560, 880, 1200])
}

// ---------------------------------------------------------------- sobre
await variantes('sobre', `${IA}/10-sobre.png`, [640, 960, 1280])

// ---------------------------------------------------------------- marca
await gravar(sharp('insumos/logo-horizontal-claro.png').resize({ width: 480 }).webp({ quality: 92, alphaQuality: 95 }), 'logo-claro-480.webp')
await gravar(sharp('insumos/logo-horizontal-escuro.png').resize({ width: 480 }).webp({ quality: 92, alphaQuality: 95 }), 'logo-escuro-480.webp')
await gravar(sharp(`${IA}/01-hero-desktop.png`).resize(1200, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 82, mozjpeg: true }), 'og.jpg')

// favicons: o símbolo claro sobre o azul da marca, com cantos arredondados
async function icone(lado, saida) {
  const s = Math.round(lado * 0.62)
  const simbolo = await sharp('insumos/simbolo-claro.png').resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  const r = Math.round(lado * 0.22)
  const fundo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${r}" fill="#000048"/></svg>`)
  await sharp(fundo).composite([{ input: simbolo, gravity: 'center' }]).png().toFile(path.join(RAIZ, saida))
}
await icone(32, 'favicon-32.png')
await icone(180, 'apple-touch-icon.png')
await icone(192, 'icon-192.png')
await icone(512, 'icon-512.png')

writeFileSync(path.join(OUT, 'manifesto.json'), JSON.stringify(manifesto, null, 1))
const total = Object.values(manifesto).reduce((a, m) => a + m.kb, 0)
console.log(`ok ${Object.keys(manifesto).length} arquivos, ${total} KB`)
