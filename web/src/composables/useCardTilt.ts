export function useCardTilt() {
  function onMouseMove(e: MouseEvent, card: HTMLElement) {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = x / rect.width - 0.5
    const cy = y / rect.height - 0.5

    const maxTilt = 8
    card.style.transform =
      `perspective(800px) rotateY(${cx * maxTilt}deg) rotateX(${-cy * maxTilt}deg) translateY(-6px)`

    const shX = -cx * 12
    const shY = -cy * 16
    const shBlur = 24 + Math.abs(cx) * 8 + Math.abs(cy) * 8
    card.style.boxShadow =
      `${shX}px ${shY}px ${shBlur}px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)`

    // Glare
    const glare = card.querySelector('.card-glare') as HTMLElement | null
    if (glare) {
      glare.style.background =
        `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,.55) 0%, transparent 70%)`
    }
  }

  function onMouseLeave(card: HTMLElement) {
    card.style.transform =
      'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)'
    card.style.boxShadow = '0 1px 2px rgba(0,0,0,.04)'
  }

  return { onMouseMove, onMouseLeave }
}
