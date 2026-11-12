// A carta sob o mouse (o zoom ao lado da mesa) fica fora do estado da mesa: passar o mouse de carta em carta só
// redesenha o zoom, não a mesa inteira com as suas cem cartas.
//
// N24 (revisão 2 do estudo do Arena): enquanto a cena anda (golpes, mortes, a arrumação), as cartas passam por baixo
// do ponteiro parado e cada uma disparava um mouseenter, e o zoom ficava piscando. O Arena recusa o hover durante a
// animação de combate. Aqui, com o zoom segurado (segurarZoom), o passar do mouse só anota a última carta e, quando a
// cena acaba, o zoom abre nela (se o mouse ainda estiver em cima de uma). Esconder de propósito (arrastar, abrir uma
// janela) vale sempre.

import { useEffect, useState } from 'preact/hooks';
import type { ObjView } from '../../../motor/view.ts';
import { aoMudarCena, emCena } from './cenaLoja.ts';

export interface ZoomAtual { o: ObjView; lado: 'esq' | 'dir' }

let atual: ZoomAtual | null = null;
const ouvintes = new Set<() => void>();

/** a cena está andando: o mouse não troca o zoom */
let segurado = false;
/** o que o mouse pediu enquanto o zoom estava segurado (null: saiu de todas as cartas) */
let pendente: ZoomAtual | null = null;

function avisar(): void { for (const f of ouvintes) f(); }

function trocar(novo: ZoomAtual | null): void {
  if (novo === atual || (novo && atual && novo.o === atual.o && novo.lado === atual.lado)) return;
  atual = novo;
  avisar();
}

/** mostra o zoom da carta (do lado oposto ao dela na tela), ou esconde com `null` */
export function mostrarZoom(o: ObjView | null, r?: DOMRect): void {
  const novo = o && r ? { o, lado: (r.left + r.width / 2 < innerWidth / 2 ? 'dir' : 'esq') as ZoomAtual['lado'] } : null;
  if (segurado) { pendente = novo; return; }
  trocar(novo);
}

/** esconde de propósito (arrastar, janela, a mesa saiu), mesmo com a cena andando */
export function esconderZoom(): void {
  pendente = null;
  trocar(null);
}

/** segura o zoom enquanto a cena anda; ao soltar, abre na carta em que o mouse ficou (ou fecha, se saiu de todas) */
export function segurarZoom(sim: boolean): void {
  if (sim === segurado) return;
  segurado = sim;
  if (sim) {
    // a carta do zoom saiu de baixo do mouse sem mouseleave (conjurada do duplo clique, foi para a pilha): o zoom
    // fechava só no fim da cena, cobrindo o Passar. Sem nada com zoom sob o mouse, fecha já
    pendente = semNadaSobOMouse() ? null : atual;
    if (!pendente) trocar(null);
    return;
  }
  const p = pendente && semNadaSobOMouse() ? null : pendente;
  pendente = null;
  trocar(p);
}

/** nenhuma carta (nem item da pilha) sob o mouse; fora do navegador (testes), não dá para saber: false */
function semNadaSobOMouse(): boolean {
  if (typeof document === 'undefined') return false;
  return !document.querySelector('.carta:hover, .pilha li:hover');
}

// a cena da fila de quadros (cenaLoja) segura e solta o zoom
aoMudarCena(() => segurarZoom(emCena()));

export function useZoom(): ZoomAtual | null {
  const [, forcar] = useState(0);
  useEffect(() => {
    const f = () => forcar((x) => x + 1);
    ouvintes.add(f);
    return () => { ouvintes.delete(f); };
  }, []);
  return atual;
}
