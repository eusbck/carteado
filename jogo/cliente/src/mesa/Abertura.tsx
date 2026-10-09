// Abertura da partida (a tela VS): antes da mão inicial, a arte do deck de cada jogador lado a lado (só a arte, sem
// o retrato: com ele ficava carregado demais), com o VS em brasa cravando no meio. Some sozinha em uns 4 s; clicar
// ou apertar Esc pula. A mesa mostra uma vez por partida neste navegador (chave com o código da sala e o id da
// partida: recarregar a página não repete).
// Duelo: duas metades com o corte inclinado. Três ou quatro jogadores: faixas inclinadas, você na primeira e os
// outros na ordem dos turnos. Estilos em abertura.css; brasas e faíscas num canvas; o som é o 'abertura' de sons.ts.
// Com "reduzir movimento" no sistema, aparece parada e sem partículas; com os efeitos desligados, sem partículas,
// clarão nem tremor; no modo Desempenho (Configurações), só sem as partículas.

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { preferencias } from '../preferencias.ts';
import { tocar } from '../sons.ts';
import './abertura.css';

export interface LadoVS {
  jogador: number;
  nome: string;
  /** "Você", "Oponente" ou "Oponente · bot Difícil" */
  papel: string;
  /** nome curto do comandante (até a vírgula) */
  comandante: string | null;
  deck: string | null;
  /** arte do deck (a mesma do fundo da área na mesa) */
  fundo: string | null;
  /** onde está o rosto do comandante na arte (0 a 1, da esquerda e do alto): fica no meio da faixa */
  foco: readonly [number, number];
  /** cor do brilho atrás do nome: a aura do retrato do jogador, ou a cor dele na mesa */
  aura: string;
  comeca: boolean;
}

const CHAVE = 'commander-da-mesa:vs:';
/** as já mostradas nesta página (vale mesmo sem armazenamento, até fechar ou recarregar) */
const vistas = new Set<string>();
export const chaveAbertura = (sala: string, partida: string | null): string => `${CHAVE}${sala}:${partida ?? ''}`;
export function aberturaVista(chave: string): boolean {
  if (vistas.has(chave)) return true;
  try { return sessionStorage.getItem(chave) === '1'; } catch { return false; }
}
export function marcarAbertura(chave: string): void {
  vistas.add(chave);
  try { sessionStorage.setItem(chave, '1'); } catch { /* sem armazenamento: fica só a lista desta página */ }
}

/** quanto tempo a tela fica (do começo da animação até começar a sumir), a saída e a espera máxima pelas imagens */
const DURACAO = 4400;
const DURACAO_PARADA = 2600;
const SAIDA = 550;
const ESPERA_IMAGENS = 1500;
/** quando o VS crava (casa com o clarão em abertura.css e com o impacto do som) */
const IMPACTO = 1480;

const iconeComeca = (
  <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" /></svg>
);

/** carrega a imagem e devolve o tamanho dela (null se não houver ou não carregar) */
function carregar(url: string | null): Promise<[number, number] | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img.naturalWidth && img.naturalHeight ? [img.naturalWidth, img.naturalHeight] : null);
    img.onerror = () => ok(null);
    img.src = url;
  });
}

/** inclinação das faixas: quanto (em % da largura) o alto de cada corte fica à direita do pé */
const INCLINACAO_DUELO = 14;
const INCLINACAO = 6;
/** altura (fração da tela) em que o rosto deve ficar no meio da faixa */
const ALTURA_ROSTO = 0.38;

/**
 * Onde desenhar a arte da faixa `i` de `n` (em px, numa tela `larg` × `alt`): do tamanho que cobre a faixa inteira e
 * com o rosto do comandante (`foco`) no meio dela, na altura do rosto. Se o rosto estiver perto da beira da arte, ela
 * para no limite (a faixa nunca fica com um vão) e o rosto fica o mais perto do meio que der.
 */
function posicaoArte(i: number, n: number, foco: readonly [number, number], tam: [number, number], larg: number, alt: number) {
  const w = 100 / n, s = n === 2 ? INCLINACAO_DUELO : INCLINACAO;
  // a borda esquerda da faixa k, em % da largura, na altura y (0 no alto, 1 no pé); as bordas da tela ficam retas
  const borda = (k: number, y: number) => (k <= 0 ? 0 : k >= n ? 100 : k * w + s / 2 - s * y);
  const x0 = Math.min(borda(i, 0), borda(i, 1)) * larg / 100, x1 = Math.max(borda(i + 1, 0), borda(i + 1, 1)) * larg / 100;
  const meio = (borda(i, ALTURA_ROSTO) + borda(i + 1, ALTURA_ROSTO)) / 2 * larg / 100;
  const escala = Math.max((x1 - x0) / tam[0], alt / tam[1]);
  const dw = tam[0] * escala, dh = tam[1] * escala;
  const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  return {
    recorte: `polygon(${borda(i, 0)}% 0, ${borda(i + 1, 0)}% 0, ${borda(i + 1, 1)}% 100%, ${borda(i, 1)}% 100%)`,
    caixa: { left: x0, width: x1 - x0 },
    arte: { left: limitar(meio - foco[0] * dw, x1 - dw, x0), top: limitar(alt * ALTURA_ROSTO - foco[1] * dh, alt - dh, 0), width: dw, height: dh },
    /** o meio da faixa no pé, em % da largura (o nome e o brilho atrás dele) */
    pe: (borda(i, 0.92) + borda(i + 1, 0.92)) / 2,
  };
}

const telaAgora = (): [number, number] => [innerWidth, innerHeight];

export function Abertura({ lados, fim }: { lados: LadoVS[]; fim: () => void }) {
  const [fase, setFase] = useState<'carregando' | 'tocando' | 'saindo'>('carregando');
  const [tela, setTela] = useState(telaAgora);
  const [tamanhos, setTamanhos] = useState<([number, number] | null)[]>([]);
  const raiz = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const parada = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const efeitos = preferencias().efeitos && !parada;
  // o canvas das brasas e faíscas é a parte cara da abertura: o modo Desempenho tira só ele
  const comParticulas = efeitos && !preferencias().desempenho;
  const sair = () => setFase((f) => (f === 'saindo' ? f : 'saindo'));

  // espera as artes (no máximo um pouco), para as faixas não entrarem vazias; o tamanho de cada uma posiciona o rosto
  useEffect(() => {
    let vivo = true;
    const espera = new Promise<void>((ok) => setTimeout(ok, ESPERA_IMAGENS));
    const tudo = Promise.all(lados.map((l) => carregar(l.fundo))).then((t) => { if (vivo) setTamanhos(t); });
    void Promise.race([tudo, espera]).then(() => { if (vivo) setFase((f) => (f === 'carregando' ? 'tocando' : f)); });
    const medir = () => setTela(telaAgora());
    addEventListener('resize', medir);
    return () => { vivo = false; removeEventListener('resize', medir); };
  }, []);

  useEffect(() => {
    if (fase === 'saindo') { const t = setTimeout(fim, SAIDA); return () => clearTimeout(t); }
    if (fase !== 'tocando') return;
    // pulada antes do fim, o som para junto (o impacto não toca sobre a mesa)
    const calar = tocar('abertura');
    const t = setTimeout(sair, parada ? DURACAO_PARADA : DURACAO);
    if (!comParticulas || !canvas.current) return () => { clearTimeout(t); calar(); };
    const p = particulas(canvas.current);
    const explosao = setTimeout(() => {
      const e = raiz.current?.querySelector('.vs-emblema')?.getBoundingClientRect();
      if (e) p.explodir(e.left + e.width / 2, e.top + e.height / 2);
    }, IMPACTO);
    return () => { clearTimeout(t); clearTimeout(explosao); p.parar(); calar(); };
  }, [fase]);

  // Esc, Enter e espaço pulam (antes dos atalhos da mesa)
  useLayoutEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape' && ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      sair();
    };
    addEventListener('keydown', tecla, true);
    return () => removeEventListener('keydown', tecla, true);
  }, []);

  const duelo = lados.length === 2;
  const n = lados.length;
  const w = 100 / n;
  const [larg, alt] = tela;
  const px = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, `${v}px`]));
  return (
    <div ref={raiz} class={`abertura ${fase} ${efeitos ? '' : 'sem-efeitos'}`} role="dialog" aria-label={`Começa a partida: ${lados.map((l) => l.nome).join(' contra ')}`} onClick={sair}>
      <div class={`vs ${duelo ? 'vs-2' : 'vs-n'}`}>
        <div class="vs-treme">
          {lados.map((l, i) => {
            // faixa i: de i/n a (i+1)/n da largura, com o alto deslocado para a direita; a arte com o rosto no meio dela
            const pos = posicaoArte(i, n, l.foco, tamanhos[i] ?? [16, 9], larg, alt);
            const estilo: Record<string, string | number> = { '--i': i, '--aura': l.aura, clipPath: pos.recorte };
            let nome: Record<string, string> = {};
            if (duelo) estilo['--de'] = i ? '40%' : '-40%';
            else {
              estilo['--de'] = i % 2 ? '0, 60%' : '0, -60%';
              estilo['--cx'] = `${pos.pe}%`;
              nome = { left: `${pos.pe}%` };
            }
            const arte = { ...px(pos.arte), transformOrigin: `${l.foco[0] * 100}% ${l.foco[1] * 100}%` };
            return (
              <div key={l.jogador} class={`vs-lado l${i}`} style={estilo}>
                {l.fundo ? <img class="vs-arte" src={l.fundo} alt="" draggable={false} style={arte} /> : <div class="vs-arte vazia" style={px(pos.caixa)} />}
                <div class="vs-tinta" />
                <div class="vs-veu" />
                <div class="vs-nome" style={nome}>
                  {l.comeca && <span class="vs-comeca">{iconeComeca}Começa</span>}
                  <b>{l.nome}</b>
                  <span class="vs-papel">{l.papel}</span>
                  {(l.comandante || l.deck) && <span class="vs-deck">{[l.comandante, l.deck].filter(Boolean).join(' · ')}</span>}
                </div>
              </div>
            );
          })}
          {duelo
            ? <div class="vs-costura" />
            : lados.slice(1).map((l, i) => <div key={l.jogador} class="vs-costura" style={{ '--x': `${(i + 1) * w}%` }} />)}
          <canvas ref={canvas} aria-hidden="true" />
          <div class="vs-emblema" aria-hidden="true">
            <span class="vs-calor" />
            <span class="vs-onda" />
            <span class="vs-letras brilho">VS</span>
            <span class="vs-letras frente">VS</span>
            {!duelo && <span class="vs-rotulo">todos contra todos</span>}
          </div>
        </div>
        <div class="vs-clarao" />
        <div class="vs-pular">Clique para pular</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ partículas
// Brasas subindo devagar pela tela e a explosão de faíscas quando o VS crava. Cada partícula é um sprite de brilho
// (miolo branco, borda na cor) somado ao que já está no canvas ('lighter'), que esquenta onde elas se juntam.

type Cor = readonly [number, number, number];
interface Particula { x: number; y: number; vx: number; vy: number; t: number; vida: number; s0: number; s1: number; spr: HTMLCanvasElement; arrasto: number; g: number; onda: number; fase: number; a: number }

const sprites = new Map<string, HTMLCanvasElement>();
function sprite([r, g, b]: Cor): HTMLCanvasElement {
  const k = `${r},${g},${b}`;
  const pronto = sprites.get(k);
  if (pronto) return pronto;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.2, `rgba(${k},.95)`);
  gr.addColorStop(0.5, `rgba(${k},.32)`);
  gr.addColorStop(1, `rgba(${k},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  sprites.set(k, c);
  return c;
}

const BRASAS: Cor[] = [[255, 140, 50], [255, 190, 90], [232, 93, 40]];
const FAISCAS: Cor[] = [...BRASAS, [255, 240, 210]];
const ale = (a: number, b: number) => a + Math.random() * (b - a);
const um = <T,>(l: readonly T[]): T => l[Math.floor(Math.random() * l.length)];

function particulas(cv: HTMLCanvasElement): { explodir: (x: number, y: number) => void; parar: () => void } {
  const ctx = cv.getContext('2d');
  if (!ctx) return { explodir: () => {}, parar: () => {} };
  let W = 0, H = 0, dpr = 1;
  const medir = () => {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  };
  medir();
  addEventListener('resize', medir);
  let ps: Particula[] = [];
  const nova = (o: Partial<Particula> & Pick<Particula, 'x' | 'y' | 'vida' | 's0' | 's1' | 'spr'>): Particula =>
    ({ vx: 0, vy: 0, t: 0, arrasto: 1, g: 0, onda: 0, fase: Math.random() * 6.28, a: 1, ...o });
  let acumulado = 0, ultimo = 0, quadro = 0;
  const passo = (agora: number) => {
    const dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000);
    ultimo = agora;
    const k = W / 1000;
    // brasas subindo do pé da tela
    acumulado += 18 * dt;
    while (acumulado >= 1) {
      acumulado--;
      ps.push(nova({ x: ale(0, W), y: H + 8, vx: ale(-20, 20) * k, vy: ale(-110, -40) * k, vida: ale(3, 6), s0: ale(4, 9) * k, s1: 2 * k, spr: sprite(um(BRASAS)), onda: 28 * k, a: 0.85 }));
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const vivas: Particula[] = [];
    for (const p of ps) {
      p.t += dt;
      if (p.t >= p.vida) continue;
      const ar = Math.pow(p.arrasto, dt);
      p.vx *= ar; p.vy *= ar; p.vy += p.g * dt;
      p.x += (p.vx + Math.sin(p.fase + p.t * 5) * p.onda) * dt;
      p.y += p.vy * dt;
      const f = p.t / p.vida;
      const alfa = p.a * (f < 0.12 ? f / 0.12 : Math.pow(1 - (f - 0.12) / 0.88, 1.3));
      const s = p.s0 + (p.s1 - p.s0) * f;
      ctx.globalAlpha = Math.max(0, alfa);
      ctx.drawImage(p.spr, p.x - s / 2, p.y - s / 2, s, s);
      vivas.push(p);
    }
    ps = vivas;
    ctx.globalAlpha = 1;
    quadro = requestAnimationFrame(passo);
  };
  quadro = requestAnimationFrame(passo);
  return {
    explodir: (x, y) => {
      const r = cv.getBoundingClientRect();
      const k = W / 1000;
      for (let i = 0; i < 170; i++) {
        const ang = Math.random() * Math.PI * 2, v = ale(250, 1100) * k;
        ps.push(nova({ x: x - r.left, y: y - r.top, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v * 0.7, arrasto: 0.03, g: 260 * k, vida: ale(0.45, 1.2), s0: ale(5, 12) * k, s1: k, spr: sprite(um(FAISCAS)) }));
      }
    },
    parar: () => { cancelAnimationFrame(quadro); removeEventListener('resize', medir); },
  };
}
