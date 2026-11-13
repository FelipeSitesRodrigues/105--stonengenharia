/**
 * Logos da Ston sem o fundo. Os PNG que vieram (Recursos Site/Logos, 8505x4106) têm fundo chapado:
 * azul #000048 (páginas 1 a 3) ou branco (4 a 6). O alfa sai da distância até a cor do fundo e a
 * cor é desfeita da mistura com ele, pra a borda não ficar com halo azul ou branco.
 * Uso: node scripts/logos.mjs  -> insumos/logo-*.png
 */
import sharp from 'sharp'
const L = '../0105 - José My Eng/Recursos Site/Logos'

async function semFundo(arq, fundo, saida) {
  const { data, info } = await sharp(`${L}/${arq}`).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(info.width * info.height * 4)
  // o pixel mais distante do fundo nessa imagem é a referência de opaco
  const dist = (i) => Math.max(Math.abs(data[i] - fundo[0]), Math.abs(data[i + 1] - fundo[1]), Math.abs(data[i + 2] - fundo[2]))
  let max = 0
  for (let i = 0; i < data.length; i += 3) max = Math.max(max, dist(i))
  // limite: a cor mais "fraca" do logo (o cinza) fica opaca
  const cheio = max * 0.42
  for (let p = 0, i = 0; i < data.length; i += 3, p += 4) {
    const a = Math.min(1, dist(i) / cheio)
    for (let c = 0; c < 3; c++) out[p + c] = a > 0 ? Math.max(0, Math.min(255, Math.round((data[i + c] - fundo[c] * (1 - a)) / a))) : 0
    out[p + 3] = Math.round(a * 255)
  }
  // caixa do que é logo de verdade (alfa > 50%), longe da borda: os arquivos têm um fio de 1 px
  // na moldura que o trim não ignora
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0
  const m = 40
  for (let y = m; y < info.height - m; y++) for (let x = m; x < info.width - m; x++) {
    if (out[(y * info.width + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  const f = 8
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: x0 - f, top: y0 - f, width: x1 - x0 + 1 + 2 * f, height: y1 - y0 + 1 + 2 * f })
    .png().toFile(`insumos/${saida}`)
  const md = await sharp(`insumos/${saida}`).metadata()
  console.log(saida, md.width, md.height)
}
await semFundo('Page 2.png', [0, 0, 72], 'logo-horizontal-claro.png')
await semFundo('Page 5.png', [255, 255, 255], 'logo-horizontal-escuro.png')
await semFundo('Page 3.png', [0, 0, 72], 'simbolo-claro.png')
await semFundo('Page 6.png', [255, 255, 255], 'simbolo-escuro.png')
