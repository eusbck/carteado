// A pilha da coluna da direita com o mesmo zoom das cartas da mesa (zoomLoja): o mouse num item (ou o toque, como nos
// emblemas) mostra a carta grande, a da mágica ou, numa habilidade, a da fonte; e a fonte acende na mesa enquanto isso,
// se ainda estiver à vista. O realce é uma regra de estilo só (o seletor da carta pelo data-obj): passar o mouse não
// redesenha a mesa, e a carta redesenhada no meio do caminho continua acesa.

import type { ObjId } from '../../../motor/types.ts';
import type { ObjView, StackView } from '../../../motor/view.ts';
import { esconderZoom, mostrarZoom } from './zoomLoja.ts';

/** a carta do zoom: a fonte à vista na mesa (com o estado de agora) ou uma feita da definição (mágica, fonte que já saiu) */
export function cartaDaPilha(s: StackView, todos: Map<ObjId, ObjView>): ObjView | null {
  const fonte = s.source !== undefined ? todos.get(s.source) : undefined;
  if (fonte?.def) return fonte;
  if (!s.def) return null;
  return {
    id: s.id, def: s.def, name: s.name, face: 0, owner: s.controller, controller: s.controller, tapped: false, faceDown: false, phasedOut: false,
    token: false, counters: {}, damage: 0, attachedTo: null, types: [], subtypes: [], supertypes: [], power: null, toughness: null, loyalty: null,
    manaCost: '', colors: [], keywords: [], abilities: s.text ? [s.text] : [], commander: false, sick: false, prepared: false, classLevel: 0, goaded: false,
  };
}

let regra: HTMLStyleElement | null = null;
/** acende as cartas com este data-obj (null apaga) */
function acenderFonte(id: ObjId | null): void {
  if (!regra && id === null) return;
  regra ??= document.head.appendChild(document.createElement('style'));
  regra.textContent = id !== null && Number.isInteger(id) ? `.tabuleiro .carta[data-obj="${id}"] { outline: 2px solid var(--ouro); outline-offset: 3px; animation: fonte-da-pilha .8s ease-in-out infinite alternate; }` : '';
}

/** o item da pilha com o zoom aberto (o mouse em cima, ou tocado) */
let sobre: HTMLElement | null = null;

function soltar(): void {
  if (!sobre) return;
  sobre = null;
  esconderZoom();
  acenderFonte(null);
}

/** os eventos do `<li>` de um item da pilha */
export function zoomDaPilha(s: StackView, todos: Map<ObjId, ObjView>) {
  const mostrar = (e: MouseEvent) => {
    const o = cartaDaPilha(s, todos);
    if (!o) return;
    sobre = e.currentTarget as HTMLElement;
    mostrarZoom(o, sobre.getBoundingClientRect());
    acenderFonte(s.source ?? null);
  };
  return {
    onMouseEnter: mostrar,
    onClick: mostrar,
    onMouseLeave: soltar,
    // o item resolveu (ou saiu da pilha) com o mouse em cima: o mouseleave não vem, e o zoom e o realce saem aqui. A
    // cada desenho a função é outra, então o Preact chama a de antes com null: só sai se o item saiu da página mesmo
    ref: (el: HTMLElement | null) => { if (!el && sobre) queueMicrotask(() => { if (sobre && !sobre.isConnected) soltar(); }); },
  };
}
