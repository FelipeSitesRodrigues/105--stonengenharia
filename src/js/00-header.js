// cabeçalho: vira vidro azul quando o marco do topo do hero sai da tela. Também mostra o botão
// flutuante do WhatsApp (13-flutuante) a partir daí. Sem ouvir o scroll.
;(() => {
  const topo = document.querySelector('[data-topo]')
  const marco = document.querySelector('.hero__marco')
  const flutuante = document.querySelector('[data-flutuante]')
  if (!topo || !marco || !('IntersectionObserver' in window)) return
  new IntersectionObserver(([e]) => {
    const passou = !e.isIntersecting
    topo.classList.toggle('topo--solido', passou)
    if (flutuante) flutuante.classList.toggle('flutuante--on', passou)
  }).observe(marco)
})()

// menu do celular: os 3 pontinhos abrem o painel; fecha no X, no Esc, ao tocar num link ou ao
// voltar pra largura de computador. O foco vai pro painel e volta pro botão ao fechar.
;(() => {
  const painel = document.querySelector('[data-painel]')
  const abre = document.querySelector('[data-menu-abre]')
  const fecha = document.querySelector('[data-menu-fecha]')
  if (!painel || !abre || !fecha) return
  const abrir = () => {
    painel.hidden = false
    document.body.classList.add('menu-aberto')
    abre.setAttribute('aria-expanded', 'true')
    requestAnimationFrame(() => requestAnimationFrame(() => painel.classList.add('aberto')))
    fecha.focus()
  }
  const fechar = (devolverFoco = true) => {
    if (painel.hidden) return
    painel.classList.remove('aberto')
    document.body.classList.remove('menu-aberto')
    abre.setAttribute('aria-expanded', 'false')
    setTimeout(() => { painel.hidden = true }, 350)
    if (devolverFoco) abre.focus()
  }
  abre.addEventListener('click', abrir)
  fecha.addEventListener('click', () => fechar())
  painel.addEventListener('click', (e) => { if (e.target.closest('a')) fechar(false) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar() })
  matchMedia('(min-width: 75em)').addEventListener('change', (m) => { if (m.matches) fechar(false) })
})()
