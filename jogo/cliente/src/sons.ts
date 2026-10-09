// Sons curtos gerados na hora com Web Audio, sem arquivos: começo do seu turno, começo do turno de
// um adversário, tomar dano, ganhar vida e mensagem no chat. O volume e cada som se ligam e desligam nas
// Configurações. O contexto de áudio é o mesmo da música (cliente/src/musica.ts).
//
// Os dois sons de turno ficam em sol, o tom da música (The Snow Queen, sol menor), e são fáceis de
// distinguir sem olhar:
// - seu turno: chamada de trompas subindo (ré, sol e o ré agudo sustentado sobre sol, uma quinta
//   aberta), com tímpano e um brilho de sino; forte e mais longo, chama atenção;
// - turno de um adversário: dois toques de harpa descendo (sol, ré), curtos, abafados e baixos.

import { preferencias, type Som } from './preferencias.ts';

let ctx: AudioContext | null = null;
let ruido: AudioBuffer | null = null;
const aoDestravar = new Set<() => void>();

/**
 * O contexto de áudio da página; null antes do primeiro clique ou tecla da pessoa (o navegador só
 * deixa tocar depois de um gesto, e criar o contexto antes disso deixa aviso no console).
 */
export function contexto(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx && typeof navigator !== 'undefined' && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  if (!ctx) {
    const c = new AudioContext();
    ctx = c;
    // quem esperava o áudio (a música) começa quando o contexto passa a rodar
    c.addEventListener('statechange', () => { if (c.state === 'running') avisar(); });
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

function avisar(): void {
  for (const f of [...aoDestravar]) { aoDestravar.delete(f); f(); }
}

/** chama `f` quando o áudio estiver liberado: na hora, se já estiver, ou depois do primeiro gesto */
export function quandoLiberado(f: () => void): void {
  if (ctx?.state === 'running') f();
  else aoDestravar.add(f);
}

// o primeiro clique ou tecla destrava o áudio (cria ou retoma o contexto dentro do gesto)
if (typeof window !== 'undefined') {
  const destravar = () => {
    const c = contexto();
    if (!c) return;
    if (c.state === 'running') avisar();
    removeEventListener('pointerdown', destravar);
    removeEventListener('keydown', destravar);
  };
  addEventListener('pointerdown', destravar);
  addEventListener('keydown', destravar);
}

/** uma nota com ataque rápido e queda suave */
function nota(c: BaseAudioContext, saida: AudioNode, freq: number, inicio: number, duracao: number, volume: number, tipo: OscillatorType = 'sine', freqFim?: number): void {
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

/**
 * Uma nota de metal (trompa): duas ondas dente de serra levemente desafinadas num filtro que abre no
 * ataque e fecha devagar, como o sopro de um metal.
 */
function trompa(c: BaseAudioContext, saida: AudioNode, freq: number, inicio: number, duracao: number, volume: number): void {
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 0.8;
  f.frequency.setValueAtTime(freq * 1.2, inicio);
  f.frequency.exponentialRampToValueAtTime(freq * 5, inicio + 0.07);
  f.frequency.exponentialRampToValueAtTime(freq * 2.2, inicio + duracao);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.exponentialRampToValueAtTime(volume, inicio + 0.035);
  g.gain.setValueAtTime(volume * 0.85, inicio + Math.max(0.05, duracao - 0.18));
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  f.connect(g).connect(saida);
  for (const desafino of [-6, 6]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    o.detune.value = desafino;
    o.connect(f);
    o.start(inicio);
    o.stop(inicio + duracao + 0.03);
  }
}

/** um toque de harpa: triângulo abafado, queda longa */
function harpa(c: BaseAudioContext, saida: AudioNode, freq: number, inicio: number, duracao: number, volume: number): void {
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1100;
  f.connect(saida);
  nota(c, f, freq, inicio, duracao, volume, 'triangle');
  nota(c, f, freq * 2, inicio, duracao * 0.5, volume * 0.25, 'sine');
}

/** 0,4 s de ruído branco, criado uma vez */
function bufferRuido(c: BaseAudioContext): AudioBuffer {
  if (!ruido) {
    ruido = c.createBuffer(1, Math.round(c.sampleRate * 0.4), c.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ruido;
}

/** um sopro de ruído filtrado (o "baque" do dano, a pele do tímpano) */
function sopro(c: BaseAudioContext, saida: AudioNode, inicio: number, duracao: number, volume: number, corte: number): void {
  const s = c.createBufferSource();
  s.buffer = bufferRuido(c);
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

/** uma rajada de vento: ruído num filtro de banda que varre de `de` a `para` (as faixas da abertura deslizando) */
function rajada(c: BaseAudioContext, saida: AudioNode, inicio: number, duracao: number, volume: number, de: number, para: number): void {
  const s = c.createBufferSource();
  s.buffer = bufferRuido(c);
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.4;
  f.frequency.setValueAtTime(de, inicio);
  f.frequency.exponentialRampToValueAtTime(para, inicio + duracao);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, inicio);
  g.gain.exponentialRampToValueAtTime(volume, inicio + duracao * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  s.connect(f).connect(g).connect(saida);
  s.start(inicio);
  s.stop(inicio + duracao + 0.02);
}

// sol: as notas dos sons de turno (sem a terça, servem a sol maior e a sol menor)
const SOL2 = 98, SOL3 = 196, RE4 = 293.66, SOL4 = 392, RE5 = 587.33, SOL5 = 783.99;

const nada = () => {};

/**
 * toca um som se ele estiver ligado; `forca` de 0 a 1 (o dano em você soa mais forte que nos outros). Devolve uma
 * função que cala o som em seguida (a abertura pulada no meio não deixa o impacto tocar sobre a mesa).
 */
export function tocar(som: Som, forca = 1): () => void {
  return preferencias().sons[som] ? gerar(som, forca) : nada;
}

/** o botão de ouvir das Configurações: toca mesmo com o som desligado (no volume dos efeitos) */
export function ouvir(som: Som): void {
  gerar(som, 1);
}

function gerar(som: Som, forca: number): () => void {
  const p = preferencias();
  if (p.volume <= 0) return nada;
  const c = contexto();
  if (!c || c.state !== 'running') return nada;
  const mestre = c.createGain();
  mestre.gain.value = Math.min(1, p.volume) * 0.55 * Math.max(0.2, Math.min(1, forca));
  mestre.connect(c.destination);
  desenharSom(c, mestre, som, c.currentTime + 0.01);
  return () => mestre.gain.setTargetAtTime(0, c.currentTime, 0.04);
}

/** monta o som em `mestre` começando em `t` (separado de `gerar` para dar para gravar num OfflineAudioContext) */
export function desenharSom(c: BaseAudioContext, mestre: AudioNode, som: Som, t: number): void {
  switch (som) {
    case 'turnoMeu': // chamada de trompas: ré, sol, e o ré agudo sustentado sobre sol, com tímpano e sino
      trompa(c, mestre, RE4, t, 0.16, 0.16);
      trompa(c, mestre, SOL4, t + 0.15, 0.16, 0.17);
      trompa(c, mestre, RE5, t + 0.3, 0.85, 0.15);
      trompa(c, mestre, SOL4, t + 0.3, 0.85, 0.12);
      trompa(c, mestre, SOL3, t + 0.3, 0.85, 0.09);
      nota(c, mestre, SOL2 * 1.5, t + 0.3, 0.5, 0.45, 'sine', SOL2);
      sopro(c, mestre, t + 0.3, 0.09, 0.18, 500);
      nota(c, mestre, SOL5 * 2, t + 0.32, 0.9, 0.05, 'sine');
      break;
    case 'turnoAdversario': // dois toques de harpa descendo, abafados e discretos
      harpa(c, mestre, SOL4, t, 0.55, 0.2);
      harpa(c, mestre, RE4, t + 0.13, 0.7, 0.18);
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
    case 'chat': // dois toques curtos e baixos (sol, ré), como uma notificação discreta
      nota(c, mestre, SOL5, t, 0.12, 0.14, 'sine');
      nota(c, mestre, RE5 * 2, t + 0.07, 0.2, 0.12, 'sine');
      break;
    case 'abertura': { // as faixas entram com duas rajadas; 1,42 s depois o VS crava (casa com IMPACTO em Abertura.tsx)
      rajada(c, mestre, t, 0.7, 0.22, 300, 2200);
      rajada(c, mestre, t + 0.14, 0.7, 0.18, 2400, 400);
      const b = t + 1.42;
      nota(c, mestre, 130, b, 1.1, 0.7, 'sine', 36); // o baque grave caindo
      sopro(c, mestre, b, 0.4, 0.4, 1200);
      trompa(c, mestre, SOL2, b, 1.1, 0.16); // metais graves em sol e ré
      trompa(c, mestre, RE4 / 2, b, 1.1, 0.12);
      nota(c, mestre, SOL5, b, 1.6, 0.05, 'triangle'); // o brilho do metal
      nota(c, mestre, RE5 * 2, b + 0.01, 1.4, 0.035, 'triangle');
      break;
    }
  }
}
