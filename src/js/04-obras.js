// obras: filtro por serviço. Mostra as pílulas (sem JS elas ficam escondidas) e, ao escolher
// uma norma, apaga as obras de fora com .fora (opacidade e escala, o layout não muda).
;(() => {
  const filtros = document.querySelector('[data-filtros]')
  const galeria = document.querySelector('.galeria')
  if (!filtros || !galeria) return
  filtros.hidden = false
  const botoes = filtros.querySelectorAll('[data-filtro]')
  const obras = galeria.querySelectorAll('.obra')
  filtros.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filtro]')
    if (!b) return
    const tipo = b.dataset.filtro
    botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    galeria.classList.add('filtrando')
    obras.forEach((o) => o.classList.toggle('fora', tipo !== 'todos' && o.dataset.tipo !== tipo))
  })
})()
