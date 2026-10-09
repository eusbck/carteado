// Arrumar o seu campo com o ponteiro: mover permanentes (uma com os anexos dela, ou a seleção
// inteira) e selecionar com um retângulo arrastado no espaço vazio. Durante o arraste as cartas
// andam direto no DOM (left/top), sem redesenhar a mesa nem esperar o servidor; ao soltar, a
// posição vai para a sala. As contas ficam em posicionar.ts.

import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ObjId } from '../../../motor/types.ts';
import type { ObjView } from '../../../motor/view.ts';
import { acompanharArrasto } from './arrastar.ts';
import './arrumar.css';
import { type Caixa, limitarDeslocamento, limites, proporcional, retangulo, tocaRetangulo } from './posicionar.ts';

export interface NovaPosicao { obj: ObjId; x: number; y: number }

/** o tamanho do campo que a área usa nas posições proporcionais (AreaJogador grava em data-larg/data-alt) */
export function medidas(campo: HTMLElement): { W: number; H: number } {
  return { W: Number(campo.dataset.larg) || campo.clientWidth, H: Number(campo.dataset.alt) || campo.clientHeight };
}

/** canto (o left/top que a mesa deu) e tamanho de pé da carta */
function ler(el: HTMLElement): Caixa {
  return { x: parseFloat(el.style.left) || 0, y: parseFloat(el.style.top) || 0, w: el.offsetWidth, h: el.offsetHeight, virada: el.classList.contains('virada') };
}

/**
 * Arrastar permanentes no seu campo. `mover`: todas as cartas que andam juntas (a pega, os anexos,
 * a seleção); `guardar`: as que ganham posição na sala (os anexos seguem a carta em que estão
 * presos). Todas andam exatamente o que o ponteiro andou desde que o botão desceu, então o ponto
 * por onde a carta foi pega continua sob o ponteiro; na borda do campo o grupo para inteiro.
 */
export function moverCartas(ev: PointerEvent, el: HTMLElement, mover: ObjId[], guardar: ObjId[], fazer: { inicio: () => void; soltar: (novas: NovaPosicao[]) => void }): void {
  acompanharArrasto(ev, () => {
    const campo = el.closest('.campo') as HTMLElement;
    const { W, H } = medidas(campo);
    const els: HTMLElement[] = [], caixas: Caixa[] = [], ids: ObjId[] = [];
    for (const id of mover) {
      const e = campo.querySelector<HTMLElement>(`:scope > .carta[data-obj="${id}"]`);
      if (!e) continue;
      els.push(e); caixas.push(ler(e)); ids.push(id);
    }
    const x0 = ev.clientX, y0 = ev.clientY;
    let d = { dx: 0, dy: 0 };
    // a classe volta a cada passo: se a mesa for redesenhada no meio do arraste, ela some
    const por = () => els.forEach((e, i) => { e.classList.add('movendo'); e.style.left = `${caixas[i].x + d.dx}px`; e.style.top = `${caixas[i].y + d.dy}px`; });
    const acabar = () => { els.forEach((e) => e.classList.remove('movendo')); document.body.classList.remove('movendo-cartas'); };
    return {
      inicio: () => { document.body.classList.add('movendo-cartas'); fazer.inicio(); },
      mover: (x, y) => { d = limitarDeslocamento(caixas, x - x0, y - y0, W, H); por(); },
      soltar: (x, y) => {
        d = limitarDeslocamento(caixas, x - x0, y - y0, W, H);
        por();
        acabar();
        // na ordem em que estão empilhadas agora (quem ficar por cima continua por cima)
        const z = (i: number) => Number(els[i].style.zIndex) || 0;
        fazer.soltar(guardar.map((id) => ids.indexOf(id)).filter((i) => i >= 0).sort((i, j) => z(i) - z(j)).map((i) => {
          const [qx, qy] = proporcional(caixas[i].x + d.dx, caixas[i].y + d.dy, W, H);
          return { obj: ids[i], x: qx, y: qy };
        }));
      },
      cancelar: () => { d = { dx: 0, dy: 0 }; por(); acabar(); },
    };
  });
}

/**
 * Onde entra a carta solta da mão no campo (de 0 a 1): o ponto por onde ela foi pega (fx, fy, de 0
 * a 1 na carta) fica sob o ponteiro, já no tamanho das cartas do campo, e ela cabe inteira no campo.
 */
export function posicaoAoSoltar(campo: HTMLElement, x: number, y: number, fx: number, fy: number): { x: number; y: number } {
  const rc = campo.getBoundingClientRect();
  const { W, H } = medidas(campo);
  const w = Number(campo.dataset.cartaW) || 80, h = w * 88 / 63;
  const l = limites({ x: 0, y: 0, w, h }, W, H);
  const cx = Math.min(l.xMax, Math.max(l.xMin, x - rc.left - fx * w)), cy = Math.min(l.yMax, Math.max(l.yMin, y - rc.top - fy * h));
  const [qx, qy] = proporcional(cx, cy, W, H);
  return { x: qx, y: qy };
}

/**
 * Retângulo de seleção a partir do espaço vazio do seu campo. As cartas que ele toca ficam marcadas
 * enquanto você arrasta (direto no DOM); ao soltar, `fim` recebe a permanente de cada uma (`dono`
 * devolve a carta em que um anexo está preso, ou null para o que não é seu). Um clique sem
 * arrastar chama `fim(null)`.
 */
export function selecionarArea(ev: PointerEvent, campo: HTMLElement, dono: (id: ObjId) => ObjId | null, fim: (ids: ObjId[] | null) => void): void {
  // um texto selecionado na página viraria um arraste do navegador e cancelaria o retângulo
  if (ev.button === 0) getSelection()?.removeAllRanges();
  acompanharArrasto(ev, () => {
    const rc = campo.getBoundingClientRect();
    const { W, H } = medidas(campo);
    const cartas = [...campo.querySelectorAll<HTMLElement>(':scope > .carta[data-obj]')].flatMap((e) => {
      const d = dono(Number(e.dataset.obj));
      return d === null ? [] : [{ e, d, c: ler(e) }];
    });
    const ax = ev.clientX - rc.left, ay = ev.clientY - rc.top;
    const caixa = document.createElement('div');
    caixa.className = 'retangulo-selecao';
    let tocadas = new Set<ObjId>();
    const desenhar = (x: number, y: number) => {
      const r = retangulo(ax, ay, x - rc.left, y - rc.top, W, H);
      Object.assign(caixa.style, { left: `${rc.left + r.x0}px`, top: `${rc.top + r.y0}px`, width: `${r.x1 - r.x0}px`, height: `${r.y1 - r.y0}px` });
      tocadas = new Set(cartas.filter((k) => tocaRetangulo(k.c, r)).map((k) => k.d));
      for (const k of cartas) k.e.classList.toggle('na-selecao', tocadas.has(k.d));
    };
    const acabar = () => { caixa.remove(); for (const k of cartas) k.e.classList.remove('na-selecao'); };
    return {
      inicio: () => { document.body.appendChild(caixa); },
      mover: desenhar,
      soltar: (x, y) => { desenhar(x, y); acabar(); fim([...tocadas]); },
      cancelar: acabar,
    };
  }, () => fim(null));
}

/**
 * Estado da arrumação do seu campo que fica só neste navegador: as cartas selecionadas (o Esc e o
 * clique no espaço vazio desfazem) e a ordem em que você soltou as cartas (a última fica por cima).
 */
export function useArrumar(minhas: ObjView[] | undefined, anexos: Map<ObjId, ObjView[]>) {
  const [marcadas, setMarcadas] = useState<ReadonlySet<ObjId>>(new Set());
  const [ordemZ, setOrdemZ] = useState<Record<string, number>>({});
  const ids = useMemo(() => new Set((minhas ?? []).map((o) => o.id)), [minhas]);
  // carta que saiu do campo (ou mudou de dono) sai da seleção
  const selecao = useMemo(() => {
    const s = new Set([...marcadas].filter((id) => ids.has(id)));
    return s.size === marcadas.size ? marcadas : s;
  }, [marcadas, ids]);
  const algo = selecao.size > 0;
  useEffect(() => {
    if (!algo) return;
    // com um menu aberto o Esc é dele (as janelas já seguram o Esc antes de chegar aqui)
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('.menu-acoes')) setMarcadas(new Set()); };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [algo]);
  /** a permanente sua que a carta representa no campo: ela mesma, ou aquela em que o anexo está preso */
  const dono = (id: ObjId): ObjId | null => {
    if (ids.has(id)) return id;
    for (const [h, presos] of anexos) if (ids.has(h) && presos.some((a) => a.id === id)) return h;
    return null;
  };
  return {
    selecao,
    dono,
    ordemZ,
    selecionar: (novas: ObjId[], somar: boolean) => setMarcadas(new Set(somar ? [...selecao, ...novas] : novas)),
    limpar: () => { if (marcadas.size) setMarcadas(new Set()); },
    /** as cartas soltas agora ficam por cima das outras que você arrumou */
    trazerParaFrente: (soltas: ObjId[]) => setOrdemZ((a) => {
      let n = Math.max(0, ...Object.values(a));
      const novo = { ...a };
      for (const id of soltas) novo[id] = ++n;
      return novo;
    }),
  };
}
