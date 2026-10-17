// Peças repetidas nas cartas do deck Buckle Up (Kotori): Veículos, "vira criatura artefato até o fim do turno", fichas
// Pilot e "o resto no fundo em ordem aleatória". A palavra-chave de tripular está em motor/mecanicas.ts (crew) e a força
// com que uma criatura tripula em motor/costs.ts (crewPower).
import { chars, chooseItems, controlledBy, createTokens, nameOf, untilEndOfTurn } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import { shuffle } from '../motor/rng.ts';
import type { ChoiceItem, ObjId, PlayerId } from '../motor/types.ts';

/** é um Veículo? (subtipo de artefato, CR 301.7) */
export function ehVeiculo(g: G, id: ObjId): boolean {
  return chars(g, id).subtypes.includes('Vehicle');
}

/** Veículos que o jogador controla */
export function veiculosDe(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => ehVeiculo(g, id));
}

/**
 * "[Esses Veículos] se tornam criaturas artefato até o fim do turno" (Peacewalker Colossus, Mobilizer Mech, Armed and
 * Armored): o mesmo efeito da tripulação, sem tripular (ruling 2 de Mobilizer Mech) e sem mudar a força e a resistência
 * impressas (ruling 3)
 */
export function viramCriaturasArtefato(c: Ctx, ids: ObjId[]): void {
  const noCampo = ids.filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  untilEndOfTurn(c, noCampo, [{ k: 'addTypes', types: ['Artifact', 'Creature'] }]);
}

/** cria uma ficha Pilot 1/1 incolor que tripula como se a força fosse 2 maior (cartas/fichas.ts) */
export function* criaPiloto(c: Ctx, n = 1): Gen<ObjId[]> {
  return yield* createTokens(c.g, c.you, 'Pilot', n);
}

/** põe as cartas que ainda estão no grimório no fundo dele, em ordem aleatória */
export function restoNoFundo(g: G, p: PlayerId, ids: ObjId[]): void {
  const s = g.state;
  const resto = shuffle(s.rng, ids.filter((id) => s.objects[id]?.zone === 'library'));
  s.zones.library[p] = [...s.zones.library[p].filter((id) => !resto.includes(id)), ...resto];
  g.bump();
}

/**
 * "Olhe as N cartas do topo do seu grimório. Você pode revelar uma carta [tal] dentre elas e colocá-la na sua mão"
 * (Arcanist's Owl, Weatherlight): a pessoa vê todas as cartas olhadas, mesmo quando nenhuma serve (aí só continua).
 * Devolve a carta escolhida (ainda no grimório) ou null.
 */
export function* olhaEPegaUma(c: Ctx, cartas: ObjId[], pode: (id: ObjId) => boolean, rotulo: string): Gen<ObjId | null> {
  const s = c.g.state;
  const itens: ChoiceItem[] = cartas.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !pode(id) }));
  if (!itens.length) return null;
  const algum = itens.some((i) => !i.disabled);
  const esc = algum
    ? yield* chooseItems(c.g, c.you, `${rotulo}: você pode revelar uma delas e colocá-la na sua mão`, itens, 0, 1)
    : yield* chooseItems(c.g, c.you, `${rotulo}: nenhuma das cartas olhadas pode ser escolhida`, [{ id: '', label: 'Continuar' }, ...itens], 1, 1);
  return esc.length && esc[0] ? Number(esc[0]) : null;
}
