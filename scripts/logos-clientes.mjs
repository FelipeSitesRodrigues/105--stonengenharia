/**
 * Logos dos clientes do José (mandadas pelo Felipe no chat, 2026-11-12), coloridas, pra esteira
 * de "Empresas que confiam" (02b-clientes). Origem: ../0105 - José My Eng/Recursos Site/logos-clientes.
 *
 * Cada PNG veio com um fundo diferente (branco, cinza 247, e a Unimed com o xadrez de
 * "transparente" desenhado na imagem). O fundo e o branco viram transparência pela distância
 * de cor, e a sobra é cortada. Como o cartão é branco, o branco de dentro da logo (o texto da
 * Unimed, o GG da Gerdau) continua aparecendo igual.
 * O tamanho de tela sai pela área: logo larga fica baixa, logo quadrada fica alta, e todas
 * pesam parecido na esteira. Saída em src/assets/clientes (o processar-imagens não apaga) e
 * src/dados/clientes.json (largura e altura de tela de cada uma).
 *
 * Uso: node scripts/logos-clientes.mjs   (depois: node build.mjs)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'

const ORIGEM = '../0105 - José My Eng/Recursos Site/logos-clientes'
const OUT = 'src/assets/clientes'
if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })
mkdirSync('src/dados', { recursive: true })

// ordem da esteira: alterna logo larga e logo alta, e as cores, pra não juntar duas iguais
const LOGOS = [
  ['gerdau', 'Gerdau'],
  ['energisa', 'Energisa'],
  ['unimed', 'Unimed'],
  ['adecoagro', 'Adecoagro'],
  ['petroplus', 'Petroplus'],
  ['frizelo', 'Frizelo Frigoríficos'],
  ['usina-sonora', 'Usina Sonora'],
  ['hvm', 'HVM Incorporadora'],
  ['vetorial', 'Vetorial'],
  ['grupo-pereira', 'Grupo Pereira'],
  ['odfjell', 'Odfjell Terminals Granel Química'],
  ['adames', 'Adames Nutrição Animal'],
  ['rfk', 'Grupo RFK'],
  ['cenze', 'Cenze'],
  ['crea', 'CREA'],
]

const AREA = 7600 // px² de tela que cada logo ocupa
const ALT_MAX = 78
const LARG_MAX = 176

const itens = []
for (const [id, nome] of LOGOS) {
  const { data, info } = await sharp(`${ORIGEM}/${id}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const fundo = [data[0], data[1], data[2]]
  const out = Buffer.alloc(w * h * 4)
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const dist = (c) => Math.hypot(r - c[0], g - c[1], b - c[2])
    const d = Math.min(dist(fundo), dist([255, 255, 255]), id === 'unimed' ? dist([239, 239, 239]) : 1e9)
    const a = Math.max(0, Math.min(1, (d - 8) / 34))
    out[j] = r; out[j + 1] = g; out[j + 2] = b
    out[j + 3] = Math.round(a * 255)
    if (!out[j + 3]) out[j] = out[j + 1] = out[j + 2] = 0 // memória png-recorte-cor-escondida
  }
  const buf = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
  // trim pelo alfa: a sobra transparente sai
  const recortado = await sharp(buf).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer({ resolveWithObject: true })
  const rw = recortado.info.width, rh = recortado.info.height
  const prop = rw / rh
  let th = Math.sqrt(AREA / prop)
  th = Math.min(th, ALT_MAX, LARG_MAX / prop)
  const tw = th * prop
  // arquivo a 2x da tela (nítido em celular), sem passar do tamanho da origem
  const fw = Math.min(rw, Math.round(tw * 2))
  await sharp(recortado.data).resize({ width: fw, kernel: 'lanczos3' }).webp({ quality: 90, alphaQuality: 92, effort: 6 }).toFile(`${OUT}/${id}.webp`)
  itens.push({ id, nome, w: Math.round(tw), h: Math.round(th) })
  console.log(id.padEnd(14), `${rw}x${rh}`, '→ tela', Math.round(tw), 'x', Math.round(th))
}
writeFileSync('src/dados/clientes.json', JSON.stringify(itens, null, 1))
console.log(`ok ${itens.length} logos`)
