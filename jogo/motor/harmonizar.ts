// lote4-c: harmonizar (harmonize, CR 702.180): "Você pode conjurar este card do seu cemitério pagando [custo] e virando
// até uma criatura desvirada que você controla em vez de pagar o custo de mana desta mágica"; o custo total é reduzido
// em mana genérica igual à força da criatura virada; e a carta vai para o exílio em vez de ir para qualquer outro lugar
// quando sai da pilha (Nature's Rhythm e outras de Tarkir: Dragonstorm).
import { chooseItems, objItem } from './ask.ts';
import { tap } from './actions.ts';
import { controllerOf, isCreature, nameOf, power } from './chars.ts';
import type { AltCastDef, Gen } from './defs.ts';
import type { G } from './game-context.ts';
import { reduceGeneric } from './mana.ts';
import type { ManaSymbol, ObjId, PlayerId } from './types.ts';
import { jog, obj, reg } from './registro.ts';

/** "Harmonize [custo]" na face: vai em `altCosts` (CR 702.180a: custo alternativo, do cemitério, exila ao sair da pilha) */
export function harmonize(custo: string): AltCastDef {
  return { key: 'harmonize', label: `harmonizar ${custo}`, zone: 'graveyard', mana: custo, exileAfter: true, harmonize: true };
}

/**
 * CR 702.180a-b: ao pagar o custo total, vira até uma criatura desvirada que você controla e reduz o genérico pela força
 * dela (força 0 ou negativa não reduz nada). Só genérico: a parte colorida continua (CR 601.2f). Devolve o custo novo.
 * Simplificação: a criatura é escolhida junto com o pagamento, não ao anunciar a mágica (CR 601.2b); o resultado é o mesmo.
 */
export function* reducaoHarmonizar(g: G, player: PlayerId, cost: ManaSymbol[], label: string, spell: ObjId): Gen<ManaSymbol[]> {
  const s = g.state;
  const criaturas = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && !s.objects[id].tapped && id !== spell && controllerOf(g, id) === player && isCreature(g, id));
  if (!criaturas.length) return cost;
  const itens = criaturas.map((id) => objItem(g, id, `${nameOf(g, id)} (força ${Math.max(0, power(g, id))})`));
  const esc = yield* chooseItems(g, player, `Harmonizar: vire até uma criatura sua para reduzir o custo genérico de ${label} pela força dela`, itens, 0, 1);
  if (!esc.length) return cost;
  const id = Number(esc[0]);
  const reducao = Math.max(0, power(g, id));
  tap(g, id);
  reg(g, 'outro', { rule: '702.180a' })`${jog(player)} vira ${obj(id)} para harmonizar (reduz {${reducao}}).`;
  return reduceGeneric(cost, reducao);
}

/** a maior redução possível ao harmonizar (para o limite da escolha de X) */
export function forcaParaHarmonizar(g: G, player: PlayerId, spell: ObjId): number {
  const s = g.state;
  const forcas = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && !s.objects[id].tapped && id !== spell && controllerOf(g, id) === player && isCreature(g, id)).map((id) => power(g, id));
  return Math.max(0, ...forcas);
}
