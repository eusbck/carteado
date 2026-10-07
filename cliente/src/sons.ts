// Sons curtos gerados na hora com Web Audio, sem arquivos: passar o turno, tomar dano e ganhar
// vida. O volume e cada som se ligam e desligam nas Configurações.

import { preferencias, type Som } from './preferencias.ts';

let ctx: AudioContext | null = null;
let ruido: AudioBuffer | null = null;

function contexto(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

// o navegador só deixa tocar depois de um gesto da pessoa: o primeiro clique ou tecla destrava
if (typeof window !== 'undefined') {
  const destravar = () => {
    contexto();
    removeEventListener('pointerdown', destravar);
    removeEventListener('keydown', destravar);
  };
  addEventListener('pointerdown', destravar);
  addEventListener('keydown', destravar);
}

/** uma nota com ataque rápido e queda suave */
function nota(c: AudioContext, saida: AudioNode, freq: number, inicio: number, duracao: number, volume: number, tipo: OscillatorType = 'sine', freqFim?: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, inicio);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, inicio + duracao);
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.exponentialRampToValueAtTime(volume, inicio + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  o.connect(g).connect(saida);
  o.start(inicio);
  o.stop(inicio + duracao + 0.03);
}

/** um sopro de ruído filtrado (o "baque" do dano) */
function sopro(c: AudioContext, saida: AudioNode, inicio: number, duracao: number, volume: number, corte: number): void {
  if (!ruido) {
    ruido = c.createBuffer(1, Math.round(c.sampleRate * 0.4), c.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = ruido;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = corte;
  const g = c.createGain();
  g.gain.setValueAtTime(volume, inicio);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  s.connect(f).connect(g).connect(saida);
  s.start(inicio);
  s.stop(inicio + duracao + 0.02);
}

/** toca um som se ele estiver ligado; `forca` de 0 a 1 (o dano em você soa mais forte que nos outros) */
export function tocar(som: Som, forca = 1): void {
  const p = preferencias();
  if (!p.sons[som] || p.volume <= 0) return;
  const c = contexto();
  if (!c || c.state !== 'running') return;
  const mestre = c.createGain();
  mestre.gain.value = Math.min(1, p.volume) * 0.55 * Math.max(0.2, Math.min(1, forca));
  mestre.connect(c.destination);
  const t = c.currentTime + 0.01;
  switch (som) {
    case 'turno': // dois toques suaves, como um sino de mesa
      nota(c, mestre, 659.25, t, 0.45, 0.35);
      nota(c, mestre, 987.77, t + 0.12, 0.6, 0.3);
      break;
    case 'dano': // baque grave e curto
      nota(c, mestre, 150, t, 0.24, 0.6, 'sine', 48);
      sopro(c, mestre, t, 0.12, 0.35, 900);
      break;
    case 'vida': // brilho subindo
      nota(c, mestre, 783.99, t, 0.22, 0.22, 'triangle');
      nota(c, mestre, 1046.5, t + 0.08, 0.26, 0.2, 'triangle');
      nota(c, mestre, 1318.5, t + 0.16, 0.34, 0.18, 'triangle');
      break;
  }
}
