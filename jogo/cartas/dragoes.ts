// Ajudantes do deck How to Train Ur-Dragon (lote3-e).

import { chars, chooseNumber, controlledBy, controllerOf, isCreature, on, power, type G } from '../motor/api.ts';
import type { Gen, TriggerSpec } from '../motor/defs.ts';
import type { ManaType, ObjId, PlayerId } from '../motor/types.ts';

/** as cores entre os permanentes que o jogador controla (Bloom Tender, Chromatic Orrery): só as cinco cores contam */
export function coresEntrePermanentes(g: G, p: PlayerId): ManaType[] {
  const s = new Set<string>();
  for (const id of controlledBy(g, p, () => true)) for (const cor of chars(g, id).colors) s.add(cor);
  return (['W', 'U', 'B', 'R', 'G'] as ManaType[]).filter((x) => s.has(x));
}

/** é Dragon (tipo de criatura na linha de tipo; ruling de Tiamat: o nome não conta) */
export function ehDragao(g: G, id: ObjId): boolean {
  return chars(g, id).subtypes.includes('Dragon');
}

/** criatura com força 4 ou mais que o jogador controla (ferocidade) */
export function temFerocidade(g: G, p: PlayerId): boolean {
  return criaturasFortes(g, p) > 0;
}

/** quantas criaturas com força 4 ou mais o jogador controla (Temur Battlecrier) */
export function criaturasFortes(g: G, p: PlayerId): number {
  return controlledBy(g, p, (id) => isCreature(g, id) && power(g, id) >= 4).length;
}

/**
 * "Sempre que uma criatura com força 4 ou mais entra sob o seu controle" (Kiora, Temur Ascendancy): a força é a que ela
 * tem ao entrar, com estáticas e marcadores com que entrou; o que muda depois não desfaz o gatilho (rulings)
 */
export function entraCriaturaForte(): TriggerSpec {
  return on.enters((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you && power(c.g, id) >= 4);
}

/** "adicione X manas em qualquer combinação de cores" fora de habilidade de mana (Klauth): pergunta quantas de cada cor */
export function* manaEmCombinacao(g: G, p: PlayerId, x: number, rotulo: string): Gen<ManaType[]> {
  const cores: ManaType[] = ['W', 'U', 'B', 'R', 'G'];
  const out: ManaType[] = [];
  let resta = x;
  for (let i = 0; i < cores.length && resta > 0; i++) {
    const n = i === cores.length - 1 ? resta : yield* chooseNumber(g, p, `${rotulo}: quantas manas ${NOMES[cores[i]]}? (restam ${resta})`, 0, resta);
    for (let k = 0; k < n; k++) out.push(cores[i]);
    resta -= n;
  }
  return out;
}

const NOMES: Record<string, string> = { W: 'brancas', U: 'azuis', B: 'pretas', R: 'vermelhas', G: 'verdes' };
