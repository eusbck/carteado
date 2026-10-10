// Arrastar cartas com o ponteiro (mouse, caneta ou toque). Um movimento curto continua sendo
// um clique; passando do limite vira arrasto, e o clique que o navegador dispara no fim é
// descartado (quem arrasta decide se o arrasto curto que não deu em nada vale como clique). A carta "fantasma" que segue o ponteiro tem estado próprio, para a mesa não
// ser redesenhada a cada movimento.

import { useEffect, useState } from 'preact/hooks';
import type { ObjView } from '../../../motor/view.ts';

export interface Fantasma {
  o: ObjView;
  /** posição do canto da carta na tela */
  x: number;
  y: number;
  w: number;
  /** área onde soltar (destacada) e o que acontece ao soltar ali */
  alvo: DOMRect | null;
  texto: string;
  valido: boolean;
  /** voltando para o lugar de origem (soltou fora ou não dava para jogar) */
  voltando?: boolean;
  /** pousando no campo onde foi solta (fica até a permanente, ou o tracejado de "pagando", aparecer ali) */
  pousando?: boolean;
  virada?: boolean;
}

let ouvinte: ((f: Fantasma | null) => void) | null = null;
export function mostrarFantasma(f: Fantasma | null): void { ouvinte?.(f); }
export function useFantasma(): Fantasma | null {
  const [f, setF] = useState<Fantasma | null>(null);
  useEffect(() => { ouvinte = setF; return () => { if (ouvinte === setF) ouvinte = null; }; }, []);
  return f;
}

const LIMITE = 7;

export interface Gesto {
  /** o arrasto começou (passou do limite) */
  inicio: () => void;
  mover: (x: number, y: number) => void;
  soltar: (x: number, y: number) => void;
  cancelar?: () => void;
}

/** o clique que o navegador manda logo depois de soltar o botão não vale (o gesto já fez o que tinha de fazer) */
function engolirClique(): void {
  const engolir = (c: MouseEvent) => { c.stopPropagation(); c.preventDefault(); };
  addEventListener('click', engolir, { capture: true, once: true });
  setTimeout(() => removeEventListener('click', engolir, { capture: true }), 0);
}

/**
 * Chame no pointerdown; devolve sem fazer nada se não for o botão principal. `semArrasto`: soltou sem passar do limite
 * (foi um clique); se ela devolver true, ela mesma tratou o clique e o do navegador não vale. `limite`: quantos px o
 * ponteiro anda antes de virar arrasto.
 */
export function acompanharArrasto(ev: PointerEvent, gesto: () => Gesto, semArrasto?: (e: PointerEvent) => boolean | void, limite = LIMITE): void {
  if (ev.button !== 0 || !ev.isPrimary) return;
  const x0 = ev.clientX, y0 = ev.clientY;
  let g: Gesto | null = null;
  const mover = (e: PointerEvent) => {
    if (!g) {
      if (Math.hypot(e.clientX - x0, e.clientY - y0) < limite) return;
      g = gesto();
      g.inicio();
    }
    e.preventDefault();
    g.mover(e.clientX, e.clientY);
  };
  const fim = (e: PointerEvent) => {
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', fim);
    removeEventListener('pointercancel', cancelar);
    if (!g) { if (semArrasto?.(e) === true) engolirClique(); return; }
    // o navegador ainda manda um clique depois do arrasto: esse não vale
    engolirClique();
    g.soltar(e.clientX, e.clientY);
  };
  const cancelar = () => {
    removeEventListener('pointermove', mover);
    removeEventListener('pointerup', fim);
    removeEventListener('pointercancel', cancelar);
    g?.cancelar?.();
  };
  addEventListener('pointermove', mover, { passive: false });
  addEventListener('pointerup', fim);
  addEventListener('pointercancel', cancelar);
}

export const dentro = (r: DOMRect | null, x: number, y: number) => !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

// ---------------------------------------------------------------- a carta jogada que vira terreno deitado

/** um quadro da transformação, na tela: canto da caixa sem giro, tamanho, giro e escala (em torno do centro), raio da
 *  borda e a imagem dentro dela (largura e deslocamento) */
export interface Quadro { x: number; y: number; w: number; h: number; giro: number; escala: number; raio: number; img: { w: number; x: number; y: number } }

/** a carta inteira: a imagem ocupa a caixa toda */
export function quadroCarta(x: number, y: number, w: number, h: number, giro = 0, escala = 1): Quadro {
  return { x, y, w, h, giro, escala, raio: w * .055, img: { w, x: 0, y: 0 } };
}

/** o terreno deitado: a imagem da carta inteira, ampliada para a caixa da arte (de 8% a 92% da largura) cobrir a peça,
 *  com o meio da peça a 33% da altura da carta (a mesma conta do estilo .carta.deitada) */
export function quadroTile(x: number, y: number, tw: number, th: number, giro = 0): Quadro {
  const wi = tw / .84;
  return { x, y, w: tw, h: th, giro, escala: 1, raio: th * .14, img: { w: wi, x: -wi * .08, y: th / 2 - wi * (88 / 63) * .33 } };
}

/** a carta como ela aparece agora (na mão ela vem girada, curvada e, sob o mouse, ampliada): o centro da caixa que
 *  aparece é o centro dela */
export function quadroDoElemento(el: HTMLElement): Quadro {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const w = el.offsetWidth, h = el.offsetHeight;
  const giro = parseFloat(cs.rotate) || 0;
  const escala = parseFloat(cs.scale) || 1;
  return quadroCarta(r.left + r.width / 2 - w / 2, r.top + r.height / 2 - h / 2, w, h, giro, escala);
}

export interface Morfose {
  /** tira o elemento (chame no quadro seguinte ao terreno de verdade aparecer) */
  remover: () => void;
}

const MORFOSE_MS = 460;
/** posição: chega depressa e assenta; tamanho e recorte: começam devagar e terminam junto */
const CURVA_LUGAR = 'cubic-bezier(.22, .8, .24, 1)', CURVA_FORMA = 'cubic-bezier(.5, 0, .2, 1)';
const movimentoReduzido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A carta jogada vira o terreno deitado num movimento só (~0,46 s): a caixa vai até o lugar do terreno e passa do
 * tamanho da carta ao da peça, endireita, e a imagem passa da carta inteira ao recorte da arte; o nome aparece no fim.
 * A caixa e a imagem têm largura e altura em px (nada de proporção automática), então tudo anda junto, sem troca de
 * forma no meio. As animações são do próprio navegador (Web Animations, as mesmas curvas de uma transição CSS), e o fim
 * é o fim delas, não um relógio: `chegou` vem quando ela termina, o terreno de verdade aparece ali e quem chamou tira
 * esta caixa no quadro seguinte (`remover`). Com "reduzir movimento" não há animação: `chegou` vem na hora.
 */
export function morfar(de: Quadro, para: Quadro, imagem: string | null, nome: string, chegou: () => void, virado = false): Morfose {
  if (movimentoReduzido() || typeof document === 'undefined' || !('animate' in document.body)) { chegou(); return { remover: () => {} }; }
  const caixa = document.createElement('div');
  caixa.className = 'morfose';
  const img = document.createElement('img');
  img.alt = '';
  img.draggable = false;
  if (imagem) img.src = imagem;
  caixa.appendChild(img);
  const rotulo = document.createElement('span');
  rotulo.className = 'morfose-nome';
  // o mesmo rótulo do terreno deitado (.tile-nome): some na peça pequena
  rotulo.textContent = para.w >= 60 ? nome : '';
  rotulo.style.fontSize = `${Math.max(9, Math.min(11.5, para.h * .22))}px`;
  caixa.appendChild(rotulo);
  const px = (n: number) => `${n}px`;
  // o quadro de partida também no estilo (o primeiro desenho já sai certo, antes de as animações começarem)
  Object.assign(caixa.style, { left: px(de.x), top: px(de.y), width: px(de.w), height: px(de.h), borderRadius: px(de.raio), rotate: `${de.giro}deg`, scale: String(de.escala) });
  Object.assign(img.style, { width: px(de.img.w), left: px(de.img.x), top: px(de.img.y) });
  document.body.appendChild(caixa);
  const op = (easing: string): KeyframeAnimationOptions => ({ duration: MORFOSE_MS, easing, fill: 'both' });
  const anims = [
    caixa.animate([{ left: px(de.x), top: px(de.y) }, { left: px(para.x), top: px(para.y) }], op(CURVA_LUGAR)),
    caixa.animate([{ width: px(de.w), height: px(de.h) }, { width: px(para.w), height: px(para.h) }], op(CURVA_FORMA)),
    caixa.animate([
      { borderRadius: px(de.raio), rotate: `${de.giro}deg`, scale: String(de.escala), boxShadow: '0 30px 50px rgba(0, 0, 0, .7)' },
      { borderRadius: px(para.raio), rotate: `${para.giro}deg`, scale: String(para.escala), boxShadow: '0 2px 8px rgba(0, 0, 0, .6)' },
    ], op('ease')),
    img.animate([{ width: px(de.img.w), left: px(de.img.x), top: px(de.img.y) }, { width: px(para.img.w), left: px(para.img.x), top: px(para.img.y) }], op(CURVA_FORMA)),
    // o nome entra no fim; o terreno virado apaga junto
    rotulo.animate([{ opacity: 0 }, { opacity: 0, offset: .8 }, { opacity: 1 }], op('linear')),
    ...(virado ? [img.animate([{ filter: 'none' }, { filter: 'none', offset: .7 }, { filter: 'brightness(.48) saturate(.55)' }], op('linear'))] : []),
  ];
  let fim = false;
  Promise.all(anims.map((a) => a.finished)).then(() => { if (!fim) { fim = true; chegou(); } }, () => {});
  return { remover: () => { fim = true; for (const a of anims) a.cancel(); caixa.remove(); } };
}
