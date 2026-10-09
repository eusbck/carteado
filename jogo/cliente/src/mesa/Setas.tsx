// Setas do combate numa camada por cima da mesa: de cada atacante até quem ele ataca (vermelho) e
// de cada bloqueador até o atacante que ele bloqueia (azul). Todos veem. As posições vêm da tela,
// medidas depois de desenhar (e de novo enquanto as cartas terminam de girar ou de se mover).

import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ObjId, TargetRef } from '../../../motor/types.ts';

export interface Seta { de: ObjId; para: TargetRef; tipo: 'ataque' | 'bloqueio' }

interface Linha { x1: number; y1: number; x2: number; y2: number; tipo: Seta['tipo'] }

function alvo(t: TargetRef): Element | null {
  return t.kind === 'player' ? document.querySelector(`[data-jogador="${t.id}"] .vida-n`) : document.querySelector(`.campo [data-obj="${t.id}"]`);
}

/** curva suave entre os dois pontos, encurtada nas pontas para não cobrir as cartas */
function caminho(l: Linha): string {
  const dx = l.x2 - l.x1, dy = l.y2 - l.y1;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const ini = l.tipo === 'ataque' ? 18 : 12, fim = l.tipo === 'ataque' ? 26 : 14;
  const x1 = l.x1 + ux * ini, y1 = l.y1 + uy * ini, x2 = l.x2 - ux * fim, y2 = l.y2 - uy * fim;
  const curva = Math.min(60, dist * 0.14);
  const cx = (x1 + x2) / 2 - uy * curva, cy = (y1 + y2) / 2 + ux * curva;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

/** as mesmas linhas (comparação campo a campo; o JSON.stringify de antes rodava a cada quadro) */
function iguais(a: Linha[], b: Linha[]): boolean {
  return a.length === b.length && a.every((l, i) => {
    const m = b[i];
    return l.x1 === m.x1 && l.y1 === m.y1 && l.x2 === m.x2 && l.y2 === m.y2 && l.tipo === m.tipo;
  });
}

const alvoChave = (t: TargetRef) => (t.kind === 'player' ? `j${t.id}` : `o${t.id}`);

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
        ls.push({ x1: ra.left + ra.width / 2 - base.left, y1: ra.top + ra.height / 2 - base.top, x2: rb.left + rb.width / 2 - base.left, y2: rb.top + rb.height / 2 - base.top, tipo: s.tipo });
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
