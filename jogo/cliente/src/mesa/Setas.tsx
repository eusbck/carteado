// Setas do combate numa camada por cima da mesa: de cada atacante até quem ele ataca (vermelho) e
// de cada bloqueador até o atacante que ele bloqueia (azul). Todos veem. As posições vêm da tela,
// medidas depois de desenhar (e de novo enquanto as cartas terminam de girar ou de se mover). A seta
// que passaria por cima do retrato e da vida de outro jogador (em 4 jogadores, o ataque a quem está do
// outro lado da mesa) faz uma curva maior, por baixo ou por cima dele.

import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ObjId, TargetRef } from '../../../motor/types.ts';

export interface Seta { de: ObjId; para: TargetRef; tipo: 'ataque' | 'bloqueio' }

/** `curva`: deslocamento do ponto de controle, para um lado (+) ou para o outro (−) da reta */
interface Linha { x1: number; y1: number; x2: number; y2: number; tipo: Seta['tipo']; curva: number }
interface Caixa { x0: number; y0: number; x1: number; y1: number }

function alvo(t: TargetRef): Element | null {
  return t.kind === 'player' ? document.querySelector(`[data-jogador="${t.id}"] .vida-n`) : document.querySelector(`.campo [data-obj="${t.id}"]`);
}

/** pontos da curva (início, controle, fim), encurtada nas pontas para não cobrir as cartas */
function pontos(l: Omit<Linha, 'curva'>, curva: number): [number, number, number, number, number, number] {
  const dx = l.x2 - l.x1, dy = l.y2 - l.y1;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const ini = l.tipo === 'ataque' ? 18 : 12, fim = l.tipo === 'ataque' ? 26 : 14;
  const x1 = l.x1 + ux * ini, y1 = l.y1 + uy * ini, x2 = l.x2 - ux * fim, y2 = l.y2 - uy * fim;
  return [x1, y1, (x1 + x2) / 2 - uy * curva, (y1 + y2) / 2 + ux * curva, x2, y2];
}

/** curva suave entre os dois pontos */
function caminho(l: Linha): string {
  const [x1, y1, cx, cy, x2, y2] = pontos(l, l.curva);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

/** a curva de sempre (até 60 px) ou, se ela passar por cima de um retrato, a primeira maior que não passe */
function desviar(l: Omit<Linha, 'curva'>, retratos: Caixa[]): number {
  const padrao = Math.min(60, Math.hypot(l.x2 - l.x1, l.y2 - l.y1) * 0.14);
  const toca = (curva: number) => {
    const [x1, y1, cx, cy, x2, y2] = pontos(l, curva);
    for (let k = 1; k < 16; k++) {
      const t = k / 16, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
      const x = a * x1 + b * cx + c * x2, y = a * y1 + b * cy + c * y2;
      if (retratos.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1)) return true;
    }
    return false;
  };
  if (!retratos.length || !toca(padrao)) return padrao;
  for (const curva of [-padrao, 110, -110, 170, -170, 240, -240]) if (!toca(curva)) return curva;
  return padrao;
}

/** as mesmas linhas (comparação campo a campo; o JSON.stringify de antes rodava a cada quadro) */
function iguais(a: Linha[], b: Linha[]): boolean {
  return a.length === b.length && a.every((l, i) => {
    const m = b[i];
    return l.x1 === m.x1 && l.y1 === m.y1 && l.x2 === m.x2 && l.y2 === m.y2 && l.tipo === m.tipo && l.curva === m.curva;
  });
}

const alvoChave = (t: TargetRef) => (t.kind === 'player' ? `j${t.id}` : `o${t.id}`);

/** o retrato e a vida de cada jogador (menos o de quem é o alvo da seta), com uma folga */
function retratos(base: DOMRect, alvoJogador: number | null): Caixa[] {
  const l: Caixa[] = [];
  for (const av of document.querySelectorAll<HTMLElement>('.area .avatar')) {
    if (alvoJogador !== null && av.dataset.jogadorAvatar === String(alvoJogador)) continue;
    const r = av.getBoundingClientRect(), v = av.querySelector('.avatar-vida')?.getBoundingClientRect() ?? r;
    l.push({ x0: Math.min(r.left, v.left) - base.left - 6, y0: r.top - base.top - 6, x1: Math.max(r.right, v.right) - base.left + 6, y1: Math.max(r.bottom, v.bottom) - base.top + 6 });
  }
  return l;
}

export function Setas({ setas, versao }: { setas: Seta[]; versao: unknown }) {
  const svg = useRef<SVGSVGElement>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const chave = setas.map((s) => `${s.tipo[0]}${s.de}>${alvoChave(s.para)}`).join(' ');
  useLayoutEffect(() => {
    // sem setas: só limpa se ainda havia linhas (um [] novo a cada vista redesenhava a camada à toa)
    if (!setas.length) { setLinhas((l) => (l.length ? [] : l)); return; }
    let quadro = 0;
    let ultima: Linha[] | null = null;
    const ate = performance.now() + 600;
    const medir = () => {
      const base = svg.current?.getBoundingClientRect();
      if (!base) return;
      const ls: Linha[] = [];
      for (const s of setas) {
        const a = document.querySelector(`.campo [data-obj="${s.de}"]`);
        const b = alvo(s.para);
        if (!a || !b) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const reta = { x1: ra.left + ra.width / 2 - base.left, y1: ra.top + ra.height / 2 - base.top, x2: rb.left + rb.width / 2 - base.left, y2: rb.top + rb.height / 2 - base.top, tipo: s.tipo };
        ls.push({ ...reta, curva: desviar(reta, retratos(base, s.para.kind === 'player' ? s.para.id : null)) });
      }
      if (!ultima || !iguais(ultima, ls)) { ultima = ls; setLinhas((atual) => (iguais(atual, ls) ? atual : ls)); }
      if (performance.now() < ate) quadro = requestAnimationFrame(medir);
    };
    medir();
    const tab = document.querySelector('.tabuleiro');
    const ro = new ResizeObserver(() => medir());
    if (tab) ro.observe(tab);
    return () => { cancelAnimationFrame(quadro); ro.disconnect(); };
  }, [chave, versao]);

  // os mesmos tons de --vermelho (ataque) e --azul (bloqueio) do estilo.css (atributo de SVG não lê var())
  return (
    <svg ref={svg} class="setas-combate" aria-hidden="true">
      <defs>
        <marker id="seta-ponta" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#e0464f" /></marker>
        <marker id="seta-bola" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.4" markerHeight="3.4"><circle cx="5" cy="5" r="4" fill="#3d9be0" /></marker>
      </defs>
      {linhas.map((l, i) => {
        const d = caminho(l);
        const cor = l.tipo === 'ataque' ? '#e0464f' : '#3d9be0';
        return (
          <g key={i}>
            <path d={d} stroke={cor} stroke-opacity=".28" stroke-width="10" fill="none" stroke-linecap="round" />
            <path d={d} stroke={cor} stroke-width={l.tipo === 'ataque' ? 3.5 : 3} fill="none" stroke-linecap="round"
              marker-end={l.tipo === 'ataque' ? 'url(#seta-ponta)' : 'url(#seta-bola)'} marker-start={l.tipo === 'bloqueio' ? 'url(#seta-bola)' : undefined} />
          </g>
        );
      })}
    </svg>
  );
}
