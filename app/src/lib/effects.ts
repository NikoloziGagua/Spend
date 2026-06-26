import confetti from 'canvas-confetti'

let audioCtx: AudioContext | null = null

export function playTone(enabled: boolean, freq = 880, dur = 0.06, type: OscillatorType = 'sine') {
  if (!enabled) return
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!audioCtx) audioCtx = new Ctor()
    const ctx = audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  } catch {
    /* ignore */
  }
}

export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}

// earned-moment confetti only — warm/silver palette, restrained
export function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({
    particleCount: 60,
    spread: 64,
    startVelocity: 32,
    scalar: 0.85,
    ticks: 140,
    origin: { y: 0.7 },
    colors: ['#14161B', '#9CA1A9', '#3E9B6E', '#C7C9CE'],
  })
}
