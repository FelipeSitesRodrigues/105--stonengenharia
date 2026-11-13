// Rolagem suave com o Lenis 1.3.26 (pedido do Felipe, 2026-11-13; mesmo arquivo e mesma inércia da
// 05 Guday): inércia na roda do mouse e no touchpad, por cima da rolagem nativa, então o cabeçalho
// fixo, os IntersectionObserver da revelação e a esteira de clientes seguem iguais.
// - Só no computador (pointer fine) e sem movimento reduzido; o celular segue nativo. ?lenis=0 desliga.
// - O script só baixa depois do load: antes disputaria a rede com a foto do hero (LCP).
// - Gesto mais de lado que de pé fica nativo.
// - Links do menu (#servicos, #contato...) deslizam com o Lenis. O "Pular para o conteúdo" e o Enter
//   no teclado seguem no salto nativo, que leva o foco junto.
// - Menu do celular/tablet aberto (body.menu-aberto) para o Lenis, igual ao overflow hidden.
;(() => {
  const LERP = 0.09
  const VOO = 1.2
  const liga = new URLSearchParams(location.search).get('lenis') !== '0'
    && matchMedia('(pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!liga) return

  const iniciar = () => {
    if (!window.Lenis) return
    const lenis = new window.Lenis({
      lerp: LERP,
      autoRaf: true,
      virtualScroll: ({ deltaX, deltaY }) => Math.abs(deltaY) > Math.abs(deltaX),
    })
    window.lenis = lenis

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a || a.classList.contains('pular') || !e.detail || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return
      const alvo = a.hash.length > 1 && document.querySelector(a.hash)
      if (!alvo) return
      e.preventDefault()
      history.pushState(null, '', a.hash)
      lenis.scrollTo(a.hash === '#inicio' ? 0 : alvo, { duration: VOO, lock: true })
    })

    new MutationObserver(() => (document.body.classList.contains('menu-aberto') ? lenis.stop() : lenis.start()))
      .observe(document.body, { attributes: true, attributeFilter: ['class'] })
  }

  const carregar = () => {
    const s = document.createElement('script')
    s.src = '/assets/js/lenis.min.js'
    s.onload = iniciar
    document.head.append(s)
  }
  if (document.readyState === 'complete') carregar()
  else addEventListener('load', carregar, { once: true })
})()
