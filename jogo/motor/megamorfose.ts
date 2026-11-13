// Megamorfose (megamorph, CR 702.37b) — lote 4, frente D (Gudul Lurker).
//
// "Megamorph [custo]" é uma variante do morph: conjura-se virada para baixo por {3} como o morph, e "ao ser virada para
// cima, ponha um marcador +1/+1 nela se o custo de megamorfose foi pago para virá-la". Um custo de megamorfose é um custo
// de morph (702.37b): morphCost (conjurar-alternativo.ts) aceita as duas palavras-chave, e turnFaceUpMorph chama
// `aoVirarPorMorph` para pôr o marcador como parte da ação especial (sem pilha, ruling 2 de Gudul Lurker). Virada para
// cima de outro jeito (manifestada e virada pelo custo de mana, por exemplo), não ganha o marcador.
import { addCounters } from './actions.ts';
import type { StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';
import { reg } from './registro.ts';

/** palavra-chave megamorfose (CR 702.37b): em `abilities` da carta */
export function megamorph(custo: string): StaticDef {
  return {
    kind: 'static', kw: 'megamorph', param: custo,
    text: `Megamorfose ${custo} (você pode conjurar esta carta virada para baixo como uma criatura 2/2 por {3}; vire-a para cima a qualquer momento pagando o custo de megamorfose e coloque um marcador +1/+1 nela)`,
  };
}

/**
 * Chamado por turnFaceUpMorph depois de virar a permanente pelo custo de morph (`kw` é a palavra-chave cujo custo foi
 * pago): com megamorfose, põe o marcador +1/+1 ao virar (CR 702.37b).
 */
export function aoVirarPorMorph(g: G, id: ObjId, kw: string | undefined, p: PlayerId): void {
  if (kw !== 'megamorph') return;
  addCounters(g, { kind: 'obj', id }, '+1/+1', 1, p);
  reg(g, 'outro', { rule: '702.37b', actor: p })`Megamorfose: recebe um marcador +1/+1 ao ser virada para cima.`;
}
